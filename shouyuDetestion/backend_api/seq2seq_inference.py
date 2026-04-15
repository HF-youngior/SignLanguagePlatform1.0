# -*- coding: utf-8 -*-
"""
Seq2Seq_v4 手语识别模型推理服务
支持连续手语序列识别
"""

import torch
import torchvision.transforms as transforms
from PIL import Image
import cv2
import numpy as np
import os
import sys
from seq2seq_model import Encoder, Decoder, Seq2Seq_v4

class Seq2SeqRecognizer:
    """Seq2Seq手语识别器"""
    
    def __init__(self, model_path, device='cuda'):
        """
        初始化识别器
        
        Args:
            model_path: 模型权重文件路径
            device: 计算设备 ('cuda' 或 'cpu')
        """
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.sample_duration = 48  # 视频帧数
        self.sample_size = 128     # 图像尺寸
        self.model = None
        self.vocab = None
        
        # 数据预处理
        self.transform = transforms.Compose([
            transforms.Resize([self.sample_size, self.sample_size]),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5])
        ])
        
        # 尝试加载模型
        self._load_model(model_path)
        
        print(f"Seq2Seq识别器初始化完成，使用设备: {self.device}")
    
    def _load_model(self, model_path):
        """加载模型权重"""
        try:
            if not os.path.exists(model_path):
                print(f"警告: Seq2Seq模型文件不存在: {model_path}")
                print("Seq2Seq模型将使用占位符模式")
                return False
            
            # 尝试加载模型
            print(f"Seq2Seq模型路径: {model_path}")
            
            # 加载模型权重
            # 兼容新版本 torch 的 weights_only 参数
            try:
                checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
            except TypeError:
                # 如果 torch 版本较旧，不支持 weights_only 参数
                checkpoint = torch.load(model_path, map_location=self.device)
            
            # 从权重中获取实际的输出维度（词汇表大小）
            # 从decoder.embedding.weight的形状中获取
            output_dim = 252  # 从错误信息中获取的实际词汇表大小
            lstm_hidden_size = 1024  # 从错误信息中获取的实际隐藏维度
            
            print(f"使用模型训练时的参数: hidden_size={lstm_hidden_size}, output_dim={output_dim}")
            
            # 创建编码器和解码器，使用与训练时相同的参数
            encoder = Encoder(lstm_hidden_size=lstm_hidden_size, arch="resnet18")
            decoder = Decoder(
                output_dim=output_dim,
                emb_dim=256,
                enc_hid_dim=lstm_hidden_size,
                dec_hid_dim=lstm_hidden_size,
                dropout=0.5
            )
            
            # 创建Seq2Seq模型
            self.model = Seq2Seq_v4(encoder=encoder, decoder=decoder, device=self.device).to(self.device)
            
            # 加载权重
            if isinstance(checkpoint, dict):
                if 'model' in checkpoint:
                    self.model.load_state_dict(checkpoint['model'])
                elif 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                else:
                    # 直接是state_dict
                    self.model.load_state_dict(checkpoint)
            else:
                # checkpoint本身就是模型
                self.model.load_state_dict(checkpoint.state_dict())
            
            self.model.eval()
            print("Seq2Seq模型加载成功")
            return True
            
        except Exception as e:
            print(f"Seq2Seq模型加载失败: {e}")
            import traceback
            traceback.print_exc()
            print("Seq2Seq模型将使用占位符模式")
            return False
    
    def load_vocab(self, dict_path):
        """加载词汇表"""
        try:
            self.word2idx = {}
            self.idx2word = {}
            
            if not os.path.exists(dict_path):
                print(f"警告: 字典文件不存在: {dict_path}")
                return False
            
            # 从句子中提取所有字符，构建字符级别的词汇表
            # 保持与训练时相同的顺序：按出现顺序添加，不排序
            chars = []
            seen_chars = set()
            
            with open(dict_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    # 尝试多种分隔符：制表符、空格
                    parts = line.split('\t')
                    if len(parts) < 2:
                        parts = line.split(' ', 1)  # 使用空格分隔，最多分割一次
                    
                    if len(parts) >= 2:
                        sentence = parts[1]
                        # 字符级分词（逐字符提取）
                        for char in sentence:
                            if char.strip() and char not in seen_chars:
                                chars.append(char)
                                seen_chars.add(char)
            
            # 构建字符到索引的映射
            # 添加特殊标记
            special_tokens = ['<PAD>', '<SOS>', '<EOS>']
            for i, token in enumerate(special_tokens):
                self.word2idx[token] = i
                self.idx2word[i] = token
            
            # 添加所有字符（按出现顺序）
            for i, char in enumerate(chars, len(special_tokens)):
                self.word2idx[char] = i
                self.idx2word[i] = char
            
            print(f"词汇表加载完成，共 {len(self.idx2word)} 个字符")
            print(f"词汇表示例: {list(self.idx2word.items())[:10]}")
            return True
        except Exception as e:
            print(f"词汇表加载失败: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def preprocess_video(self, video_path):
        """
        预处理视频文件
        
        Args:
            video_path: 视频文件路径
            
        Returns:
            tensor: 预处理后的视频张量 [1, C, T, H, W]
        """
        cap = cv2.VideoCapture(video_path)
        frames = []
        
        # 获取视频总帧数
        fps_all = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # 计算采样间隔（与训练时一致）
        timeF = int(fps_all / self.sample_duration)
        n = 1
        
        # 按固定间隔采样帧（与训练时一致）
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # 每隔timeF帧进行存储操作
            if n % timeF == 0:
                # 转换颜色空间 BGR -> RGB
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = Image.fromarray(frame)
                frame = self.transform(frame)
                frames.append(frame)
            
            n = n + 1
        
        cap.release()
        
        # 如果采样后的帧数超过目标帧数，随机删除多余的帧（与训练时一致）
        lenB = len(frames)
        for o in range(0, int(lenB - self.sample_duration)):
            # 随机删除一个帧
            del frames[np.random.randint(0, len(frames))]
        
        # 如果帧数不足，重复最后一帧
        if len(frames) == 0:
            raise ValueError("No frames extracted from video")
        
        while len(frames) < self.sample_duration:
            frames.append(frames[-1])
        
        # 堆叠成张量 [C, T, H, W]
        frames = torch.stack(frames, dim=1)
        return frames.unsqueeze(0).to(self.device)  # 添加batch维度
    
    def predict(self, video_path):
        """
        对视频进行推理
        
        Args:
            video_path: 视频文件路径
            
        Returns:
            list: 预测的词列表
        """
        if self.model is None:
            # 占位符模式
            return ["Seq2Seq识别结果（模型未加载）"]
        
        try:
            # 预处理
            input_tensor = self.preprocess_video(video_path)
            print(f"输入张量形状: {input_tensor.shape}")
            
            # 推理
            with torch.no_grad():
                # 使用模型进行预测
                predictions = self.model.predict(input_tensor, max_length=50)
                print(f"预测结果形状: {predictions.shape}")
                print(f"预测结果原始值: {predictions[0].cpu().numpy()[:20]}")  # 只打印前20个
                
                # 解码预测结果
                result_text = self.decode(predictions[0].cpu().numpy())
                print(f"解码结果: {result_text}")
            
            return [result_text]
        except Exception as e:
            print(f"推理失败: {e}")
            import traceback
            traceback.print_exc()
            return ["推理失败"]
    
    def predict_from_frames(self, frames):
        """
        从帧列表进行推理（用于实时摄像头）
        
        Args:
            frames: 帧列表（PIL Image或numpy array）
            
        Returns:
            list: 预测的词列表
        """
        if self.model is None:
            return ["Seq2Seq识别结果（模型未加载）"]
        
        try:
            # 预处理帧
            processed_frames = []
            for frame in frames:
                if isinstance(frame, np.ndarray):
                    # OpenCV格式 (BGR)
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame = Image.fromarray(frame)
                
                frame = self.transform(frame)
                processed_frames.append(frame)
            
            # 堆叠成张量
            input_tensor = torch.stack(processed_frames, dim=1).unsqueeze(0).to(self.device)
            
            # 推理
            with torch.no_grad():
                # TODO: 实现真实的推理逻辑
                predictions = ["Seq2Seq识别结果（占位符）"]
            
            return predictions
        except Exception as e:
            print(f"推理失败: {e}")
            return ["推理失败"]
    
    def decode(self, indices):
        """
        将索引序列解码为文本
        
        Args:
            indices: 字符ID列表或numpy数组
            
        Returns:
            str: 解码后的文本
        """
        if not self.idx2word:
            return " ".join([str(idx) for idx in indices])
        
        chars = []
        for idx in indices:
            # 0 = PAD, 1 = SOS, 2 = EOS
            if idx == 0:  # PAD - 跳过
                continue
            if idx == 1:  # SOS - 跳过
                continue
            if idx == 2:  # EOS - 遇到结束标记，停止解码
                break
            if idx in self.idx2word:
                # 词汇表中每个条目是单个字符
                char = self.idx2word[idx]
                chars.append(char)
        
        # 如果没有解码出任何字符，返回提示
        if len(chars) == 0:
            return "未能识别出手语内容"
        
        # 将字符组合成句子（字符之间不需要空格）
        sentence = ''.join(chars)
        return sentence
    
    def is_loaded(self):
        """检查模型是否已加载"""
        return self.model is not None


# 创建全局识别器实例
_seq2seq_recognizer = None

def get_seq2seq_recognizer(model_path=None, device='cuda'):
    """
    获取Seq2Seq识别器单例
    
    Args:
        model_path: 模型路径（首次创建时需要）
        device: 计算设备
    
    Returns:
        Seq2SeqRecognizer: 识别器实例
    """
    global _seq2seq_recognizer
    
    if _seq2seq_recognizer is None:
        if model_path is None:
            model_path = os.path.join('..', '..', 'continuous_slr_epoch047.pth')
        _seq2seq_recognizer = Seq2SeqRecognizer(model_path, device)
    
    return _seq2seq_recognizer