# -*- coding: utf-8 -*-
"""
WebSocket处理器 - 用于实时摄像头检测
"""

import asyncio
import websockets
import json
import cv2
import numpy as np
import base64
from ultralytics import YOLO
import Config

class CameraDetectionHandler:
    def __init__(self):
        self.model = None
        self.clients = set()
        self.init_model()
    
    def init_model(self):
        """初始化模型"""
        try:
            self.model = YOLO(Config.model_path, task='detect')
            self.model(np.zeros((48, 48, 3)))  # 预加载
            print("WebSocket模型加载成功")
        except Exception as e:
            print(f"WebSocket模型加载失败: {e}")
    
    async def register_client(self, websocket):
        """注册客户端"""
        self.clients.add(websocket)
        print(f"客户端已连接，当前连接数: {len(self.clients)}")
    
    async def unregister_client(self, websocket):
        """注销客户端"""
        self.clients.discard(websocket)
        print(f"客户端已断开，当前连接数: {len(self.clients)}")
    
    async def broadcast_detection(self, image_data, confidence=0.5):
        """广播检测结果"""
        if not self.model or not self.clients:
            return
        
        try:
            # 解码图片
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return
            
            # 执行检测
            results = self.model(image)[0]
            
            # 过滤结果
            if results.boxes is not None and len(results.boxes) > 0:
                conf_mask = results.boxes.conf >= confidence
                results.boxes = results.boxes[conf_mask]
            
            # 处理检测结果
            detections = []
            if results.boxes is not None and len(results.boxes) > 0:
                location_list = results.boxes.xyxy.tolist()
                cls_list = results.boxes.cls.tolist()
                conf_list = results.boxes.conf.tolist()
                
                for i, (location, cls, conf) in enumerate(zip(location_list, cls_list, conf_list)):
                    detection = {
                        'index': i,
                        'className': Config.CH_names[int(cls)],
                        'confidence': round(conf * 100, 2),
                        'coordinates': {
                            'xmin': int(location[0]),
                            'ymin': int(location[1]),
                            'xmax': int(location[2]),
                            'ymax': int(location[3])
                        }
                    }
                    detections.append(detection)
            
            # 生成带检测框的图片
            result_image = results.plot()
            _, buffer = cv2.imencode('.jpg', result_image)
            result_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # 准备响应数据
            response = {
                'type': 'detection_result',
                'detections': detections,
                'image': result_image_base64,
                'timestamp': int(time.time() * 1000)
            }
            
            # 广播给所有客户端
            if self.clients:
                await asyncio.gather(
                    *[client.send(json.dumps(response)) for client in self.clients],
                    return_exceptions=True
                )
                
        except Exception as e:
            print(f"检测处理失败: {e}")
    
    async def handle_client(self, websocket, path):
        """处理客户端连接"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                
                if data.get('type') == 'camera_frame':
                    # 处理摄像头帧
                    image_data = data.get('image')
                    confidence = data.get('confidence', 0.5)
                    await self.broadcast_detection(image_data, confidence)
                
                elif data.get('type') == 'ping':
                    # 心跳检测
                    await websocket.send(json.dumps({'type': 'pong'}))
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister_client(websocket)

# 全局处理器实例
detection_handler = CameraDetectionHandler()

async def websocket_server():
    """启动WebSocket服务器"""
    print("WebSocket服务器启动中...")
    async with websockets.serve(detection_handler.handle_client, "localhost", 8765):
        await asyncio.Future()  # 保持运行

if __name__ == "__main__":
    import time
    asyncio.run(websocket_server())
