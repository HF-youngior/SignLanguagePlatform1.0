import torch
import sys
sys.path.append('F:\\SignLanguagePlatform1.0\\shouyuDetestion\\backend_api')

from seq2seq_model import Seq2SeqModel

print("测试模型前向传播...")

# 创建测试输入
batch_size = 1
channels = 3
frames = 48
height = 128
width = 128

# 随机输入
input_tensor = torch.randn(batch_size, channels, frames, height, width)
print(f"输入形状: {input_tensor.shape}")

# 创建模型
model = Seq2SeqModel(
    input_channels=3,
    hidden_dim=512,
    output_dim=100,
    num_layers=2,
    dropout=0.3
)

print("模型创建成功")

try:
    # 测试前向传播
    output = model(input_tensor)
    print(f"前向传播成功！")
    print(f"输出形状: {output.shape}")
    
    # 测试预测
    predictions = model.predict(input_tensor)
    print(f"预测成功！")
    print(f"预测形状: {predictions.shape}")
    print(f"预测结果: {predictions[0].cpu().numpy()[:10]}...")
    
    print("✓ 模型测试通过！")
    
except Exception as e:
    print(f"✗ 测试失败: {e}")
    import traceback
    traceback.print_exc()

print("测试完成！")
