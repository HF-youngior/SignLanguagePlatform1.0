#coding:utf-8


pro_name = 'shouyushibie'
#数据集路径
data_ymal_path = 'datasets/'+pro_name+'_DATASET/data.yaml'

# 项目保存路径
project_path = "./runs/detect/"+pro_name+"_pro"

# 图片及视频检测结果保存路径
save_path = 'save_data/'+pro_name+'_result/'

# 使用的模型路径
model_path = 'models/shouyushibie_0921best.pt'

# 测试图片文件夹路径
test_images_path = 'TestFiles/'+pro_name+'_test_images/'

# 测试图片路径
test_image_path = 'TestFiles/'+pro_name+'_test_images/01_missing_hole_09.jpg'

#测试视频路径
test_video_path = 'TestFiles/'+pro_name+'_test_images/2.mp4'

#测试label保存路径
yolo_file_path = 'save_data/'+pro_name+'labels/'

names = {  0: 'time',
  1: 'you/your/this',
  2: 'morning',
  3: '9',
  4: '0',
  5: 'happy',
  6: 'new',
  7: 'wish',
  8: 'please',
  9: 'road',
  10: 'birthday',
  11: 'flat',
  12: 'safe',
  13: 'friend',
  14: '8',
  15: 'know',
  16: 'business card',
  17: 'marry/wife',
  18: 'tea',
  19: 'have',
  20: 'flavor',
  21: 'today',
  22: 'door',
  23: 'stop',
  24: 'thank you',
  25: 'slow',
  26: 'walk',
  27: 'late/night',
  28: 'I/me',
  29: 'love',
  30: 'good',
  31: 'peason',
  32: 'what',
  33: 'name',
  34: 'introduce',}
CH_names = ['时间/时候','你/您/你的/这','早上','9','0','快乐/高兴','新','祝','请','路','生日','平','安','朋友','8','认识','名片','结婚/妻子','茶','有','花','今天','门','停','谢谢','慢','走','晚','我','爱','好','人','什么','名字','介绍']
