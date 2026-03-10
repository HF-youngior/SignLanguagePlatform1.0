import torch
import os

model_path = r'f:\SignLanguagePlatform1.0\models\best_model.pth'

print(f"检查模型文件: {model_path}")
print(f"文件存在: {os.path.exists(model_path)}")
print(f"文件大小: {os.path.getsize(model_path) / (1024*1024):.2f} MB")

if os.path.exists(model_path):
    try:
        checkpoint = torch.load(model_path, map_location='cpu')
        print("\n模型加载成功!")
        print(f"类型: {type(checkpoint)}")
        
        if isinstance(checkpoint, dict):
            print(f"\n模型字典键:")
            for key in checkpoint.keys():
                print(f"  - {key}: {type(checkpoint[key])}")
                if key == 'model':
                    print(f"    模型类型: {type(checkpoint[key])}")
                    if hasattr(checkpoint[key], '__class__'):
                        print(f"    模型类名: {checkpoint[key].__class__.__name__}")
                elif key == 'state_dict':
                    print(f"    state_dict 包含 {len(checkpoint[key])} 个参数")
        elif hasattr(checkpoint, '__class__'):
            print(f"\n模型类名: {checkpoint.__class__.__name__}")
            if hasattr(checkpoint, 'state_dict'):
                state_dict = checkpoint.state_dict()
                print(f"模型包含 {len(state_dict)} 个参数")
                print("\n前10个参数:")
                for i, (name, param) in enumerate(state_dict.items()):
                    if i >= 10:
                        break
                    print(f"  {name}: {param.shape}")
    except Exception as e:
        print(f"\n模型加载失败: {e}")
        import traceback
        traceback.print_exc()
