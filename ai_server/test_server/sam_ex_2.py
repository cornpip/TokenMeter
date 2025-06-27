import torch
from PIL import Image
import requests
from transformers import SamModel, SamProcessor
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
processor = SamProcessor.from_pretrained("facebook/sam-vit-base")
model = SamModel.from_pretrained("facebook/sam-vit-base").to(device)

img_url = "https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png"
raw_image = Image.open(requests.get(img_url, stream=True).raw).convert("RGB")
mask_url = "https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png"
segmentation_map = Image.open(requests.get(
    mask_url, stream=True).raw).convert("1")
input_points = [[[450, 600]]]  # 2D location of a window in the image

inputs = processor(raw_image, input_points=input_points,
                   segmentation_maps=segmentation_map, return_tensors="pt").to(device)
with torch.no_grad():
    outputs = model(**inputs)

masks = processor.image_processor.post_process_masks(
    outputs.pred_masks.cpu(), inputs["original_sizes"].cpu(
    ), inputs["reshaped_input_sizes"].cpu()
)
scores = outputs.iou_scores

# masks는 (batch_size, 1, H, W), batch=1이라서 첫 번째꺼만 사용
mask = masks[0]  # 리스트 첫 번째 요소를 꺼냄
if isinstance(mask, torch.Tensor):
    mask = mask.squeeze(0).numpy() 

# 원본 이미지 크기
width, height = raw_image.size

mask_2d = mask[0]  # shape: (1764, 2646), bool 배열

# 마스크를 (H, W, 1) 형태로 차원 확장
mask_3d = mask_2d[:, :, None]

# 이미지 배열 모양: (H, W, 3)
masked_image = np.array(raw_image).copy()

red_mask = np.zeros_like(masked_image)
red_mask[:, :, 0] = 255  # 빨간색 채널

alpha = 0.5

masked_image = np.where(mask_3d, (1 - alpha) * masked_image + alpha * red_mask, masked_image).astype(np.uint8)

red_mask = np.zeros_like(masked_image)
red_mask[:, :, 0] = 255  # 빨간색

print("masked_image.shape:", masked_image.shape)

# 마스크 True인 부분에만 빨간색을 alpha blend 적용
masked_image = np.where(mask_3d, (1 - alpha) * masked_image + alpha * red_mask, masked_image).astype(np.uint8)

# # 결과 저장
result_img = Image.fromarray(masked_image)
result_img.save("segmentation_result.png")

print("segmentation_result.png 저장 완료")
print("IOU scores:", scores.numpy())