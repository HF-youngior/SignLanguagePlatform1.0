import sys
sys.path.append('F:\\SignLanguagePlatform1.0\\shouyuDetestion\\backend_api')

from seq2seq_inference import Seq2SeqRecognizer

print("测试Seq2Seq模型加载...")

# 测试词汇表加载
recognizer = Seq2SeqRecognizer(
    model_path='F:\\SignLanguagePlatform1.0\\models\\best_model.pth',
    device='cpu'
)

# 加载词汇表
dict_path = 'F:\\SignLanguagePlatform1.0\\dictionary.txt'
success = recognizer.load_vocab(dict_path)

if success:
    print(f"✓ 词汇表加载成功")
    print(f"  词汇表大小: {len(recognizer.idx2word)}")
    print(f"  前5个词:")
    for idx in range(min(5, len(recognizer.idx2word))):
        word = recognizer.idx2word[idx]
        print(f"    {idx}: {word}")
else:
    print("✗ 词汇表加载失败")

# 检查模型是否加载
if recognizer.model is not None:
    print("✓ 模型已加载")
    print(f"  模型类型: {type(recognizer.model)}")
    print(f"  模型设备: {recognizer.device}")
else:
    print("✗ 模型未加载（占位符模式）")

print("\n测试完成！")
