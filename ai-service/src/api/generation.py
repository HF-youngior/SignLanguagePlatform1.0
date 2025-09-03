"""
手语生成API路由
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from src.services.generation_service import GenerationService
from src.utils.exceptions import CustomException, InvalidInputException, ProcessingException

router = APIRouter()

# 请求模型
class SignGenerationRequest(BaseModel):
    """手语生成请求"""
    text: str
    style: Optional[str] = "standard"  # standard, formal, casual
    speed: Optional[float] = 1.0  # 0.5 - 2.0
    language: Optional[str] = "zh-CN"

class SignSequenceRequest(BaseModel):
    """手语序列生成请求"""
    texts: List[str]
    style: Optional[str] = "standard"
    speed: Optional[float] = 1.0
    language: Optional[str] = "zh-CN"

class SignAnimationRequest(BaseModel):
    """手语动画生成请求"""
    text: str
    animation_style: Optional[str] = "smooth"  # smooth, sharp, natural
    duration: Optional[float] = 3.0  # 秒
    resolution: Optional[str] = "720p"  # 480p, 720p, 1080p

# 依赖注入
def get_generation_service() -> GenerationService:
    """获取生成服务实例"""
    return GenerationService()

@router.post("/generate-sign")
async def generate_sign(
    request: SignGenerationRequest,
    service: GenerationService = Depends(get_generation_service)
):
    """
    生成手语动作
    
    Args:
        request: 生成请求
        service: 生成服务实例
        
    Returns:
        生成结果
    """
    try:
        if not request.text.strip():
            raise InvalidInputException("文本内容不能为空")
        
        if len(request.text) > 500:
            raise InvalidInputException("文本长度不能超过500个字符")
        
        if not (0.5 <= request.speed <= 2.0):
            raise InvalidInputException("速度必须在0.5-2.0之间")
        
        # 生成手语
        result = await service.generate_sign(
            request.text,
            request.style,
            request.speed,
            request.language
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语生成失败: {str(e)}")

@router.post("/generate-sequence")
async def generate_sequence(
    request: SignSequenceRequest,
    service: GenerationService = Depends(get_generation_service)
):
    """
    生成手语序列
    
    Args:
        request: 序列生成请求
        service: 生成服务实例
        
    Returns:
        生成结果
    """
    try:
        if not request.texts:
            raise InvalidInputException("文本列表不能为空")
        
        if len(request.texts) > 20:
            raise InvalidInputException("文本数量不能超过20个")
        
        if not (0.5 <= request.speed <= 2.0):
            raise InvalidInputException("速度必须在0.5-2.0之间")
        
        # 生成手语序列
        result = await service.generate_sequence(
            request.texts,
            request.style,
            request.speed,
            request.language
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语序列生成失败: {str(e)}")

@router.post("/generate-animation")
async def generate_animation(
    request: SignAnimationRequest,
    service: GenerationService = Depends(get_generation_service)
):
    """
    生成手语动画
    
    Args:
        request: 动画生成请求
        service: 生成服务实例
        
    Returns:
        生成结果
    """
    try:
        if not request.text.strip():
            raise InvalidInputException("文本内容不能为空")
        
        if len(request.text) > 200:
            raise InvalidInputException("文本长度不能超过200个字符")
        
        if not (1.0 <= request.duration <= 10.0):
            raise InvalidInputException("动画时长必须在1.0-10.0秒之间")
        
        if request.resolution not in ["480p", "720p", "1080p"]:
            raise InvalidInputException("分辨率必须是 480p, 720p 或 1080p")
        
        # 生成手语动画
        result = await service.generate_animation(
            request.text,
            request.animation_style,
            request.duration,
            request.resolution
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语动画生成失败: {str(e)}")

@router.get("/generation-styles")
async def get_generation_styles(
    service: GenerationService = Depends(get_generation_service)
):
    """
    获取可用的生成样式
    
    Returns:
        可用样式列表
    """
    try:
        styles = await service.get_generation_styles()
        
        return JSONResponse(content={
            "success": True,
            "data": styles
        })
        
    except Exception as e:
        raise ProcessingException(f"获取生成样式失败: {str(e)}")

@router.get("/generation-status/{task_id}")
async def get_generation_status(
    task_id: str,
    service: GenerationService = Depends(get_generation_service)
):
    """
    获取生成任务状态
    
    Args:
        task_id: 任务ID
        service: 生成服务实例
        
    Returns:
        任务状态
    """
    try:
        if not task_id:
            raise InvalidInputException("任务ID不能为空")
        
        status = await service.get_generation_status(task_id)
        
        return JSONResponse(content={
            "success": True,
            "data": status
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"获取生成状态失败: {str(e)}")
