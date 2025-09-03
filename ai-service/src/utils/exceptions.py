"""
自定义异常类和处理工具
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class CustomException(Exception):
    """自定义异常基类"""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ModelNotLoadedException(CustomException):
    """模型未加载异常"""
    
    def __init__(self, model_name: str):
        super().__init__(
            message=f"模型 {model_name} 未加载",
            status_code=503,
            details={"model_name": model_name}
        )

class InvalidInputException(CustomException):
    """无效输入异常"""
    
    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            message=message,
            status_code=400,
            details={"field": field} if field else {}
        )

class ProcessingException(CustomException):
    """处理异常"""
    
    def __init__(self, message: str, step: Optional[str] = None):
        super().__init__(
            message=message,
            status_code=422,
            details={"step": step} if step else {}
        )

class ResourceNotFoundException(CustomException):
    """资源未找到异常"""
    
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} {resource_id} 未找到",
            status_code=404,
            details={"resource_type": resource_type, "resource_id": resource_id}
        )

async def custom_exception_handler(request: Request, exc: CustomException) -> JSONResponse:
    """自定义异常处理器"""
    
    logger.error(
        f"自定义异常: {exc.message}",
        extra={
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "details": exc.details,
            "path": request.url.path
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTP异常处理器"""
    
    logger.warning(
        f"HTTP异常: {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "path": request.url.path
        }
    )
