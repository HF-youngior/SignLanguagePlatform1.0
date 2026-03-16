// 图片压缩工具

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度
 * @param {number} options.maxHeight - 最大高度
 * @param {number} options.quality - 压缩质量 (0-1)
 * @param {number} options.maxSize - 最大文件大小 (字节)
 * @returns {Promise<File>} 压缩后的图片文件
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve) => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
      maxSize = 1024 * 1024 // 默认1MB
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为blob
      canvas.toBlob(
        (blob) => {
          // 检查大小，如果仍然超过限制，降低质量
          if (blob.size > maxSize) {
            const newQuality = Math.max(0.1, quality - 0.1);
            compressImage(file, { ...options, quality: newQuality }).then(resolve);
          } else {
            // 转换为File对象
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 处理图片上传并压缩
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<string>} 压缩后的base64字符串
 */
export const handleImageUploadWithCompression = async (file, options = {}) => {
  try {
    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('图片大小不能超过10MB');
    }

    // 压缩图片
    const compressedFile = await compressImage(file, options);

    // 转换为base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    throw error;
  }
};