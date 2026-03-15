# -*- coding: utf-8 -*-
"""
手语翻译系统后端API
基于Flask框架，提供RESTful API接口
支持YOLOv8检测模型和Seq2Seq_v4连续识别模型
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import time
import os
import base64
from PIL import Image
import io
from ultralytics import YOLO
import sys
import os
import torch
import torchvision.transforms as transforms
sys.path.append('..')
import Config
from seq2seq_inference import get_seq2seq_recognizer

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 全局变量
yolo_model = None
seq2seq_model = None
colors = None

def init_yolo_model():
    """初始化YOLO模型"""
    global yolo_model
    try:
        # 修复模型路径，指向上级目录的模型文件
        model_path = os.path.join('..', Config.model_path)
        yolo_model = YOLO(model_path, task='detect')
        # 预加载模型
        yolo_model(np.zeros((48, 48, 3)))
        print("YOLO模型加载成功")
        return True
    except Exception as e:
        print(f"YOLO模型加载失败: {e}")
        return False

def init_seq2seq_model():
    """初始化Seq2Seq_v4模型"""
    global seq2seq_model
    try:
        # Seq2Seq模型路径 - 使用准确率最高的模型
        model_path = os.path.join('..', '..', 'continuous_slr_epoch047.pth')
        
        # 先加载词汇表
        dict_path = os.path.join('..', '..', 'dictionary.txt')
        
        # 使用seq2seq_inference模块加载模型
        seq2seq_model = get_seq2seq_recognizer(model_path, 'cpu')
        
        # 加载词汇表（必须在模型加载之前，因为模型需要词汇表大小）
        seq2seq_model.load_vocab(dict_path)
        
        # 重新加载模型（现在词汇表已经加载）
        seq2seq_model._load_model(model_path)
        
        print("Seq2Seq模型加载成功 (continuous_slr_epoch047.pth)")
        return True
    except Exception as e:
        print(f"Seq2Seq模型加载失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def init_models():
    """初始化所有模型"""
    yolo_loaded = init_yolo_model()
    seq2seq_loaded = init_seq2seq_model()
    return yolo_loaded or seq2seq_loaded

def init_colors():
    """初始化颜色类"""
    global colors
    from detect_tools import Colors
    colors = Colors()

def result_filter(result, confidence_threshold):
    """过滤检测结果"""
    conf_threshold = confidence_threshold
    boxes = result.boxes
    conf_mask = boxes.conf >= conf_threshold
    filtered_boxes = boxes[conf_mask]
    result.boxes = filtered_boxes
    return result

def process_detection_results(results, file_path=None):
    """处理检测结果"""
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
                },
                'filePath': file_path
            }
            detections.append(detection)
    
    return detections

def process_seq2seq_results(predictions, file_path=None):
    """处理Seq2Seq识别结果"""
    detections = []
    
    # 将Seq2Seq的输出转换为检测结果格式
    # 这里需要根据实际的输出格式进行调整
    if predictions:
        for i, pred in enumerate(predictions):
            detection = {
                'index': i,
                'className': str(pred),  # Seq2Seq输出的是文本
                'confidence': 100.0,     # Seq2Seq没有置信度，设为100
                'coordinates': {
                    'xmin': 0,
                    'ymin': 0,
                    'xmax': 0,
                    'ymax': 0
                },
                'filePath': file_path
            }
            detections.append(detection)
    
    return detections

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'message': '手语翻译系统运行正常',
        'yolo_model_loaded': yolo_model is not None,
        'seq2seq_model_loaded': seq2seq_model is not None
    })

@app.route('/api/detect/image', methods=['POST'])
def detect_image():
    """图片检测接口"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': '没有上传图片文件'}), 400
        
        file = request.files['image']
        confidence = float(request.form.get('confidence', 0.5))
        model_type = request.form.get('model', 'yolo')
        
        # 根据模型类型选择检测方式
        if model_type == 'seq2seq':
            # 使用Seq2Seq模型进行识别
            if seq2seq_model is None:
                return jsonify({'error': 'Seq2Seq模型未加载'}), 500
            
            # 读取图片
            image_bytes = file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({'error': '无法读取图片'}), 400
            
            # Seq2Seq识别
            start_time = time.time()
            
            # 使用seq2seq_model进行推理
            if seq2seq_model.is_loaded():
                # 保存临时视频文件用于Seq2Seq推理
                temp_video_path = f"temp_{int(time.time())}.mp4"
                with open(temp_video_path, 'wb') as f:
                    f.write(image_bytes)
                
                try:
                    predictions = seq2seq_model.predict(temp_video_path)
                finally:
                    # 清理临时文件
                    if os.path.exists(temp_video_path):
                        os.remove(temp_video_path)
            else:
                predictions = ['Seq2Seq模型未加载']
            
            inference_time = time.time() - start_time
            
            # 处理结果
            detections = process_seq2seq_results(predictions, file.filename)
            
            # 生成结果图片（原图）
            _, buffer = cv2.imencode('.jpg', image)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                'success': True,
                'detections': detections,
                'inference_time': round(inference_time, 3),
                'image': image_base64,
                'image_format': 'jpg',
                'model': 'seq2seq'
            })
        else:
            # 使用YOLO模型进行检测
            if yolo_model is None:
                return jsonify({'error': 'YOLO模型未加载'}), 500
            
            # 读取图片
            image_bytes = file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({'error': '无法读取图片'}), 400
            
            # 执行检测
            start_time = time.time()
            results = yolo_model(image)[0]
            inference_time = time.time() - start_time
            
            # 过滤结果
            results = result_filter(results, confidence)
            
            # 处理检测结果
            detections = process_detection_results(results, file.filename)
            
            # 生成带检测框的图片
            result_image = results.plot()
            
            # 将结果图片转换为base64
            _, buffer = cv2.imencode('.jpg', result_image)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                'success': True,
                'detections': detections,
                'inference_time': round(inference_time, 3),
                'image': image_base64,
                'image_format': 'jpg',
                'model': 'yolo'
            })
        
    except Exception as e:
        return jsonify({'error': f'检测失败: {str(e)}'}), 500

@app.route('/api/detect/video', methods=['POST'])
def detect_video():
    """视频检测接口"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': '没有上传视频文件'}), 400
        
        file = request.files['video']
        confidence = float(request.form.get('confidence', 0.5))
        model_type = request.form.get('model', 'yolo')
        
        # 根据模型类型选择检测方式
        if model_type == 'seq2seq':
            # 使用Seq2Seq模型进行识别
            if seq2seq_model is None:
                return jsonify({'error': 'Seq2Seq模型未加载'}), 500
            
            # 保存临时视频文件
            temp_video_path = f"temp_{int(time.time())}.mp4"
            file.save(temp_video_path)
            
            # 打开视频
            cap = cv2.VideoCapture(temp_video_path)
            if not cap.isOpened():
                os.remove(temp_video_path)
                return jsonify({'error': '无法打开视频文件'}), 400
            
            # 获取视频信息
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # 释放资源（不需要逐帧处理）
            cap.release()
            
            # 对整个视频进行一次Seq2Seq识别
            all_detections = []
            
            try:
                if seq2seq_model.is_loaded():
                    # 对整个视频进行预测
                    predictions = seq2seq_model.predict(temp_video_path)
                else:
                    predictions = ['Seq2Seq模型未加载']
                
                # 处理结果 - 只添加一次结果
                detections = process_seq2seq_results(predictions, file.filename)
                all_detections.extend(detections)
                
            except Exception as e:
                print(f"Seq2Seq预测失败: {e}")
                import traceback
                traceback.print_exc()
                all_detections.append({
                    'index': 0,
                    'className': f'预测失败: {str(e)}',
                    'confidence': 0,
                    'coordinates': {'xmin': 0, 'ymin': 0, 'xmax': 0, 'ymax': 0},
                    'filePath': file.filename
                })
            finally:
                # 清理临时文件
                if os.path.exists(temp_video_path):
                    os.remove(temp_video_path)
            
            return jsonify({
                'success': True,
                'total_frames': frame_count,
                'fps': fps,
                'duration': frame_count / fps if fps > 0 else 0,
                'detections': all_detections,
                'original_filename': file.filename,
                'model': 'seq2seq'
            })
        else:
            # 使用YOLO模型进行检测
            if yolo_model is None:
                return jsonify({'error': 'YOLO模型未加载'}), 500
            
            # 保存临时视频文件
            temp_video_path = f"temp_{int(time.time())}.mp4"
            file.save(temp_video_path)
            
            # 打开视频
            cap = cv2.VideoCapture(temp_video_path)
            if not cap.isOpened():
                os.remove(temp_video_path)
                return jsonify({'error': '无法打开视频文件'}), 400
            
            # 获取视频信息
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # 设置输出视频
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            output_path = f"output_{int(time.time())}.mp4"
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            all_detections = []
            frame_detections = []
            
            frame_idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 检测当前帧
                results = yolo_model(frame)[0]
                results = result_filter(results, confidence)
                
                # 处理检测结果
                detections = process_detection_results(results, f"{file.filename}_frame_{frame_idx}")
                frame_detections.append({
                    'frame': frame_idx,
                    'detections': detections
                })
                all_detections.extend(detections)
                
                # 绘制检测框
                result_frame = results.plot()
                out.write(result_frame)
                
                frame_idx += 1
            
            # 释放资源
            cap.release()
            out.release()
            
            # 清理临时文件
            os.remove(temp_video_path)
            
            # 不返回整个视频，只返回检测结果和输出路径
            # 如果需要观看处理后的视频，可以通过 /api/download/<filename> 下载
            return jsonify({
                'success': True,
                'total_frames': frame_idx,
                'fps': fps,
                'duration': frame_idx / fps,
                'detections': all_detections,
                'frame_detections': frame_detections,
                'output_video_path': output_path,
                'original_filename': file.filename,
                'model': 'yolo'
            })
        
    except Exception as e:
        return jsonify({'error': f'视频检测失败: {str(e)}'}), 500

@app.route('/api/detect/batch', methods=['POST'])
def detect_batch():
    """批量图片检测接口"""
    try:
        if 'images' not in request.files:
            return jsonify({'error': '没有上传图片文件'}), 400
        
        files = request.files.getlist('images')
        confidence = float(request.form.get('confidence', 0.5))
        model_type = request.form.get('model', 'yolo')
        
        results = []
        
        for file in files:
            if file.filename == '':
                continue
            
            # 读取图片
            image_bytes = file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                continue
            
            # 根据模型类型选择检测方式
            if model_type == 'seq2seq':
                # Seq2Seq识别
                if seq2seq_model is None:
                    return jsonify({'error': 'Seq2Seq模型未加载'}), 500
                
                # 执行识别
                start_time = time.time()
                
                # 使用seq2seq_model进行推理
                if seq2seq_model.is_loaded():
                    # 保存临时图片用于Seq2Seq推理
                    temp_image_path = f"temp_{int(time.time())}.jpg"
                    with open(temp_image_path, 'wb') as f:
                        f.write(image_bytes)
                    
                    try:
                        predictions = seq2seq_model.predict(temp_image_path)
                    finally:
                        # 清理临时文件
                        if os.path.exists(temp_image_path):
                            os.remove(temp_image_path)
                else:
                    predictions = ['Seq2Seq模型未加载']
                
                inference_time = time.time() - start_time
                
                # 处理结果
                detections = process_seq2seq_results(predictions, file.filename)
                
                # 生成结果图片（原图）
                _, buffer = cv2.imencode('.jpg', image)
                image_base64 = base64.b64encode(buffer).decode('utf-8')
            else:
                # YOLO检测
                if yolo_model is None:
                    return jsonify({'error': 'YOLO模型未加载'}), 500
                
                # 执行检测
                start_time = time.time()
                detection_results = yolo_model(image)[0]
                inference_time = time.time() - start_time
                
                # 过滤结果
                detection_results = result_filter(detection_results, confidence)
                
                # 处理检测结果
                detections = process_detection_results(detection_results, file.filename)
                
                # 生成带检测框的图片
                result_image = detection_results.plot()
                
                # 将结果图片转换为base64
                _, buffer = cv2.imencode('.jpg', result_image)
                image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            results.append({
                'filename': file.filename,
                'detections': detections,
                'inference_time': round(inference_time, 3),
                'image': image_base64,
                'model': model_type
            })
        
        return jsonify({
            'success': True,
            'total_images': len(results),
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': f'批量检测失败: {str(e)}'}), 500

@app.route('/api/detect/camera', methods=['POST'])
def detect_camera():
    """摄像头实时检测接口"""
    try:
        # 这个接口需要特殊处理，因为需要实时视频流
        # 可以使用WebSocket或者Server-Sent Events
        return jsonify({
            'message': '摄像头检测需要WebSocket连接',
            'websocket_url': 'ws://localhost:5000/ws/camera'
        })
        
    except Exception as e:
        return jsonify({'error': f'摄像头检测失败: {str(e)}'}), 500

@app.route('/api/save/results', methods=['POST'])
def save_results():
    """保存检测结果接口"""
    try:
        data = request.get_json()
        results = data.get('results', [])
        timestamp = data.get('timestamp', int(time.time()))
        
        # 保存到文件
        save_dir = os.path.join('..', Config.save_path)
        os.makedirs(save_dir, exist_ok=True)
        
        # 保存检测结果到JSON文件
        import json
        result_file = os.path.join(save_dir, f"detection_results_{timestamp}.json")
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': '结果保存成功',
            'file_path': result_file
        })
        
    except Exception as e:
        return jsonify({'error': f'保存失败: {str(e)}'}), 500

@app.route('/api/download/<filename>')
def download_file(filename):
    """下载文件接口"""
    try:
        file_path = os.path.join('..', Config.save_path, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': '文件不存在'}), 404
    except Exception as e:
        return jsonify({'error': f'下载失败: {str(e)}'}), 500

@app.route('/api/models/info', methods=['GET'])
def get_model_info():
    """获取模型信息接口"""
    try:
        return jsonify({
            'yolo_model_path': Config.model_path,
            'yolo_class_names': Config.CH_names,
            'yolo_num_classes': len(Config.CH_names),
            'yolo_model_loaded': yolo_model is not None,
            'seq2seq_model_path': os.path.join('..', '..', 'continuous_slr_epoch011.pth'),
            'seq2seq_model_loaded': seq2seq_model is not None,
            'available_models': ['yolo', 'seq2seq']
        })
    except Exception as e:
        return jsonify({'error': f'获取模型信息失败: {str(e)}'}), 500

if __name__ == '__main__':
    # 初始化模型
    if not init_models():
        print("模型初始化失败，请检查模型文件路径")
        exit(1)
    
    init_colors()
    
    print("手语翻译系统API服务启动中...")
    print("API文档: http://localhost:5000/api/health")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
