"""
手语教学平台 AI 微服务
提供手语识别、翻译和生成功能
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv

# 导入API路由
from src.api import recognition, translation, generation
from src.utils.logger import setup_logger
from src.utils.exceptions import CustomException, custom_exception_handler

# 加载环境变量
load_dotenv()

# 设置日志
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info("🚀 AI服务启动中...")
    
    # 初始化模型
    try:
        from src.services.model_manager import ModelManager
        app.state.model_manager = ModelManager()
        await app.state.model_manager.initialize_models()
        logger.info("✅ 模型初始化完成")
    except Exception as e:
        logger.error(f"❌ 模型初始化失败: {e}")
        raise
    
    yield
    
    # 关闭时执行
    logger.info("🔄 AI服务关闭中...")
    if hasattr(app.state, 'model_manager'):
        await app.state.model_manager.cleanup()
    logger.info("✅ AI服务已关闭")

# 创建FastAPI应用
app = FastAPI(
    title="手语教学平台 AI 服务",
    description="提供手语识别、翻译和生成功能的AI微服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
)

# 异常处理
app.add_exception_handler(CustomException, custom_exception_handler)

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "sign-language-ai-service",
        "version": "1.0.0",
        "models_loaded": hasattr(app.state, 'model_manager') and app.state.model_manager.is_ready()
    }

# API路由
app.include_router(recognition.router, prefix="/api/v1/recognition", tags=["手语识别"])
app.include_router(translation.router, prefix="/api/v1/translation", tags=["手语翻译"])
app.include_router(generation.router, prefix="/api/v1/generation", tags=["手语生成"])

# 根路径
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "手语教学平台 AI 服务",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局异常处理器"""
    logger.error(f"未处理的异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "内部服务器错误",
            "message": "服务暂时不可用，请稍后重试"
        }
    )

if __name__ == "__main__":
    # 开发环境启动
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        log_level="info"
    )
