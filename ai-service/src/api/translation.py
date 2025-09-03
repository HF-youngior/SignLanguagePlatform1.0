"""
手语翻译API路由
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from src.services.translation_service import TranslationService
from src.utils.exceptions import CustomException, InvalidInputException, ProcessingException

router = APIRouter()

# 请求模型
class SignToTextRequest(BaseModel):
    """手语转文字请求"""
    image_data: str  # base64编码的图像数据
    confidence_threshold: Optional[float] = 0.7

class TextToSignRequest(BaseModel):
    """文字转手语请求"""
    text: str
    language: Optional[str] = "zh-CN"
    style: Optional[str] = "standard"

class BatchTranslationRequest(BaseModel):
    """批量翻译请求"""
    items: List[Dict[str, Any]]
    translation_type: str  # "sign_to_text" 或 "text_to_sign"

# 依赖注入
def get_translation_service() -> TranslationService:
    """获取翻译服务实例"""
    return TranslationService()

@router.post("/sign-to-text")
async def sign_to_text(
    request: SignToTextRequest,
    service: TranslationService = Depends(get_translation_service)
):
    """
    手语转文字翻译
    
    Args:
        request: 翻译请求
        service: 翻译服务实例
        
    Returns:
        翻译结果
    """
    try:
        if not request.image_data:
            raise InvalidInputException("图像数据不能为空")
        
        if not (0 <= request.confidence_threshold <= 1):
            raise InvalidInputException("置信度阈值必须在0-1之间")
        
        # 执行翻译
        result = await service.sign_to_text(
            request.image_data,
            request.confidence_threshold
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"手语转文字翻译失败: {str(e)}")

@router.post("/text-to-sign")
async def text_to_sign(
    request: TextToSignRequest,
    service: TranslationService = Depends(get_translation_service)
):
    """
    文字转手语翻译
    
    Args:
        request: 翻译请求
        service: 翻译服务实例
        
    Returns:
        翻译结果
    """
    try:
        if not request.text.strip():
            raise InvalidInputException("文本内容不能为空")
        
        if len(request.text) > 1000:
            raise InvalidInputException("文本长度不能超过1000个字符")
        
        # 执行翻译
        result = await service.text_to_sign(
            request.text,
            request.language,
            request.style
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"文字转手语翻译失败: {str(e)}")

@router.post("/batch-translate")
async def batch_translate(
    request: BatchTranslationRequest,
    service: TranslationService = Depends(get_translation_service)
):
    """
    批量翻译
    
    Args:
        request: 批量翻译请求
        service: 翻译服务实例
        
    Returns:
        批量翻译结果
    """
    try:
        if not request.items:
            raise InvalidInputException("翻译项目不能为空")
        
        if len(request.items) > 100:
            raise InvalidInputException("批量翻译项目不能超过100个")
        
        if request.translation_type not in ["sign_to_text", "text_to_sign"]:
            raise InvalidInputException("翻译类型必须是 'sign_to_text' 或 'text_to_sign'")
        
        # 执行批量翻译
        result = await service.batch_translate(
            request.items,
            request.translation_type
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"批量翻译失败: {str(e)}")

@router.get("/supported-languages")
async def get_supported_languages(
    service: TranslationService = Depends(get_translation_service)
):
    """
    获取支持的语言列表
    
    Returns:
        支持的语言列表
    """
    try:
        languages = await service.get_supported_languages()
        
        return JSONResponse(content={
            "success": True,
            "data": languages
        })
        
    except Exception as e:
        raise ProcessingException(f"获取支持的语言列表失败: {str(e)}")

@router.get("/translation-history/{user_id}")
async def get_translation_history(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    service: TranslationService = Depends(get_translation_service)
):
    """
    获取用户翻译历史
    
    Args:
        user_id: 用户ID
        limit: 限制数量
        offset: 偏移量
        service: 翻译服务实例
        
    Returns:
        翻译历史记录
    """
    try:
        if limit > 100:
            raise InvalidInputException("限制数量不能超过100")
        
        history = await service.get_translation_history(
            user_id,
            limit,
            offset
        )
        
        return JSONResponse(content={
            "success": True,
            "data": history
        })
        
    except CustomException as e:
        raise e
    except Exception as e:
        raise ProcessingException(f"获取翻译历史失败: {str(e)}")
