"""
手语识别API路由
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import cv2
import numpy as np
from PIL import Image
import io

from src.services.recognition_service import RecognitionService
from src.utils.exceptions import CustomException, InvalidInputException, ProcessingException

router = APIRouter()

# 依赖注入
def get_recognition_service() -> RecognitionService:
    """获取识别服务实例"""
    return RecognitionService()

@router.post("/detect-hands")
async def detect_hands(
    image: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    检测图像中的手部
    
    Args:
        image: 上传的图像文件
        service: 识别服务实例
        
    Returns:
        检测结果
    """
    try:
        # 验证文件类型
        if not image.content_type.startswith('image/'):
            raise InvalidInputException("只支持图像文件")
        
        # 读取图像
        image_data = await image.read()
        image_array = np.frombuffer(image_data, np.uint8)
        image_cv = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image_cv is None:
            raise InvalidInputException("无法解析图像文件")
        
        # 检测手部
        result = await service.detect_hands(image_cv)
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手部检测失败: {str(e)}")

@router.post("/recognize-sign")
async def recognize_sign(
    image: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    识别手语
    
    Args:
        image: 上传的图像文件
        service: 识别服务实例
        
    Returns:
        识别结果
    """
    try:
        # 验证文件类型
        if not image.content_type.startswith('image/'):
            raise InvalidInputException("只支持图像文件")
        
        # 读取图像
        image_data = await image.read()
        image_array = np.frombuffer(image_data, np.uint8)
        image_cv = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image_cv is None:
            raise InvalidInputException("无法解析图像文件")
        
        # 识别手语
        result = await service.recognize_sign(image_cv)
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语识别失败: {str(e)}")

@router.post("/recognize-sequence")
async def recognize_sequence(
    images: List[UploadFile] = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    识别手语序列
    
    Args:
        images: 上传的图像序列
        service: 识别服务实例
        
    Returns:
        识别结果
    """
    try:
        if len(images) == 0:
            raise InvalidInputException("至少需要一张图像")
        
        if len(images) > 50:
            raise InvalidInputException("图像数量不能超过50张")
        
        # 读取图像序列
        image_sequence = []
        for image in images:
            if not image.content_type.startswith('image/'):
                raise InvalidInputException("只支持图像文件")
            
            image_data = await image.read()
            image_array = np.frombuffer(image_data, np.uint8)
            image_cv = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if image_cv is None:
                raise InvalidInputException("无法解析图像文件")
            
            image_sequence.append(image_cv)
        
        # 识别手语序列
        result = await service.recognize_sequence(image_sequence)
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语序列识别失败: {str(e)}")

@router.get("/supported-signs")
async def get_supported_signs(
    service: RecognitionService = Depends(get_recognition_service)
):
    """
    获取支持的手语列表
    
    Returns:
        支持的手语列表
    """
    try:
        signs = await service.get_supported_signs()
        
        return JSONResponse(content={
            "success": True,
            "data": signs
        })
        
    except Exception as e:
        raise ProcessingException(f"获取支持的手语列表失败: {str(e)}")
