# 测试词汇表加载
chars = []
seen_chars = set()

with open('../../corpus.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        
        # 尝试多种分隔符：制表符、空格
        parts = line.split('\t')
        if len(parts) < 2:
            parts = line.split(' ', 1)
        
        if len(parts) >= 2:
            sentence = parts[1]
            # 字符级分词（逐字符提取）
            for char in sentence:
                if char.strip() and char not in seen_chars:
                    chars.append(char)
                    seen_chars.add(char)

# 构建字符到索引的映射
special_tokens = ['<PAD>', '<SOS>', '<EOS>']
idx2word = {}
for i, token in enumerate(special_tokens):
    idx2word[i] = token

# 添加所有字符（按出现顺序）
for i, char in enumerate(chars, len(special_tokens)):
    idx2word[i] = char

print(f"词汇表加载完成，共 {len(idx2word)} 个字符")
print(f"\n完整词汇表:")
for idx, char in idx2word.items():
    print(f"{idx}: {repr(char)}")

# 测试解码
print(f"\n测试解码:")
test_indices = [0, 3, 4, 15, 7, 16, 17, 2]
decoded = ''.join([idx2word[idx] for idx in test_indices if idx not in [0, 1, 2]])
print(f"索引 {test_indices} 解码为: {decoded}")