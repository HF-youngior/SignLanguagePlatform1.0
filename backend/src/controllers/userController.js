import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// 获取用户资料
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: '获取用户资料成功'
    });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      error: error.message
    });
  }
};

// 更新用户资料
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }
    
    const { username, email, firstName, lastName, bio } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: '用户资料更新成功'
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户资料失败',
      error: error.message
    });
  }
};

// 修改密码
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码不正确'
      });
    }
    
    // 加密新密码
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新密码
    user.password = hashedNewPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error.message
    });
  }
};

// 获取用户统计信息
export const getUserStats = async (req, res) => {
  try {
    // 这里可以添加更多统计逻辑
    const stats = {
      totalLessons: 0,
      completedLessons: 0,
      totalTime: 0,
      streak: 0,
      level: '初级'
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      message: '获取用户统计成功'
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败',
      error: error.message
    });
  }
};

// 获取用户学习进度
export const getUserProgress = async (req, res) => {
  try {
    // 这里可以添加更多进度逻辑
    const progress = {
      overallProgress: 0,
      completedModules: [],
      currentModule: null,
      nextModule: null
    };
    
    res.status(200).json({
      success: true,
      data: progress,
      message: '获取用户进度成功'
    });
  } catch (error) {
    console.error('获取用户进度失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户进度失败',
      error: error.message
    });
  }
};

// 删除账户
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '请输入密码确认删除账户'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '密码不正确，无法删除账户'
      });
    }
    
    // 删除用户
    await User.findByIdAndDelete(req.user.id);
    
    res.status(200).json({
      success: true,
      message: '账户删除成功'
    });
  } catch (error) {
    console.error('删除账户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除账户失败',
      error: error.message
    });
  }
};

















































