# 模拟训练时的词汇表构建逻辑

dict = {'<pad>': 0, '<sos>': 1, '<eos>': 2}
output_dim = 3

# 按行顺序处理corpus.txt
with open('../../corpus.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip().split()
        if len(line) >= 2:
            sentence = line[1]
            # 将句子按字符分割
            for char in sentence:
                if char not in dict:
                    dict[char] = output_dim
                    output_dim += 1

print(f"词汇表大小: {len(dict)}")
print(f"输出维度: {output_dim}")

# 打印完整词汇表
print("\n完整词汇表:")
sorted_items = sorted(dict.items(), key=lambda x: x[1])
for char, idx in sorted_items:
    print(f"{idx}: {repr(char)}")

# 测试几个句子
print("\n测试句子:")
test_sentences = ["他的同学是警察", "我朋友的祖父是工人", "我的毛巾是干的"]
for sentence in test_sentences:
    tokens = [dict['<sos>']]
    for char in sentence:
        if char in dict:
            tokens.append(dict[char])
    tokens.append(dict['<eos>'])
    print(f"{sentence}: {tokens}")

# 与日志中的预测结果对比
print("\n与日志中的预测结果对比:")
print("第一句预测: [0, 3, 22, 208, 19, 20, 7, 21, 22, 23, 2] -> 解码为: 他放弃目标是解放军")
print("第二句预测: [0, 14, 27, 28, 4, 29, 30, 7, 31, 17, 2] -> 解码为: 我朋友的祖父是工人")
print("第三句预测: [0, 3, 4, 15, 15, 7, 16, 17, 2] -> 解码为: 他的爸爸是商人")

# 检查关键字符的索引
print("\n关键字符索引:")
key_chars = ["他", "的", "同", "学", "是", "警", "察", "我", "朋", "友", "祖", "父", "工", "人", "毛", "巾", "干"]
for char in key_chars:
    if char in dict:
        print(f"{char}: {dict[char]}")
    else:
        print(f"{char}: 不在词汇表中")