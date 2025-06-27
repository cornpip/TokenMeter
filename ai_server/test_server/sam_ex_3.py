import torch
import requests
from PIL import Image
from io import BytesIO
import numpy as np
from sam2.sam2_image_predictor import SAM2ImagePredictor

def segment_image_from_url_save(image_url, prompt_points, save_path):
    # 1) SAM2 predictor 불러오기
    predictor = SAM2ImagePredictor.from_pretrained("facebook/sam2-hiera-base-plus")

    # 2) URL에서 이미지 다운로드 및 열기
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content)).convert("RGB")

    # 3) 이미지 세팅
    predictor.set_image(image)

    # 4) 점 프롬프트 준비 (라벨 1 = 물체 안, 라벨 0 = 물체 밖)
    labels = [1] * len(prompt_points)
    print(labels)
    print(prompt_points)
    prompts = {
        "point_coords": prompt_points,
        "point_labels": labels
    }

    # 5) 예측 (GPU 지원 시 자동 활성화)
    with torch.inference_mode(), torch.autocast("cuda" if torch.cuda.is_available() else "cpu", dtype=torch.bfloat16):
        masks, scores, logits = predictor.predict(
        point_coords=prompt_points,
        point_labels=labels,
        )

    # 6) 첫 번째 마스크를 원본 이미지 위에 빨간색 반투명으로 합성
    mask = masks[0].astype(np.uint8) * 255  # bool -> 0/255
    mask_img = Image.fromarray(mask).convert("L").resize(image.size)

    red_mask = Image.new("RGBA", image.size, color=(255, 0, 0, 180))  # 반투명 빨강
    mask_rgba = Image.new("RGBA", image.size)
    mask_rgba.paste(red_mask, mask=mask_img)

    image_rgba = image.convert("RGBA")
    composite = Image.alpha_composite(image_rgba, mask_rgba)

    # 7) 결과 저장
    composite.save(save_path)
    print(f"저장 완료: {save_path}")

if __name__ == "__main__":
    img_url = "https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png"
    points = [[500, 400], [800, 600]]
    points = [[450, 600]]
    save_file = "segmented_result_2.png"

    segment_image_from_url_save(img_url, points, save_file)