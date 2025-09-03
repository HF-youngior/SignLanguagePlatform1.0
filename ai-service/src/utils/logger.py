"""
日志配置工具
"""

import os
import sys
from loguru import logger
from typing import Optional

def setup_logger(name: Optional[str] = None) -> logger:
    """
    设置日志配置
    
    Args:
        name: 日志器名称
        
    Returns:
        配置好的日志器
    """
    # 移除默认处理器
    logger.remove()
    
    # 控制台输出格式
    console_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    # 文件输出格式
    file_format = (
        "{time:YYYY-MM-DD HH:mm:ss} | "
        "{level: <8} | "
        "{name}:{function}:{line} | "
        "{message}"
    )
    
    # 添加控制台处理器
    logger.add(
        sys.stdout,
        format=console_format,
        level="INFO",
        colorize=True,
        backtrace=True,
        diagnose=True
    )
    
    # 创建日志目录
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # 添加文件处理器
    logger.add(
        os.path.join(log_dir, "ai-service.log"),
        format=file_format,
        level="DEBUG",
        rotation="1 day",
        retention="30 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )
    
    # 错误日志单独文件
    logger.add(
        os.path.join(log_dir, "error.log"),
        format=file_format,
        level="ERROR",
        rotation="1 day",
        retention="90 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )
    
    return logger.bind(name=name) if name else logger
