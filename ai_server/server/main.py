from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import torch
from PIL import Image
from io import BytesIO
import numpy as np
import json

from sam2.sam2_image_predictor import SAM2ImagePredictor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 또는 ["http://localhost:3000"] 등 허용할 출처만 지정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SAM2 predictor 미리 로딩
predictor = SAM2ImagePredictor.from_pretrained("facebook/sam2-hiera-base-plus")

@app.post("/segment")
async def segment_image(
    image: UploadFile = File(...),
    point_coords: str = Form(...),
    point_labels: str = Form(...)
):
    try:
        # 1) 이미지 로딩
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents)).convert("RGB")
        predictor.set_image(pil_image)

        ## check
        width, height = pil_image.size
        print("이미지 사이즈:", width, height)

        # 2) 포인트 좌표 파싱 (예: "[[450, 600], [800, 500]]")
        coords = json.loads(point_coords)
        # labels = [1] * len(coords)
        labels = json.loads(point_labels)
        print(labels, coords)

        normalized_coords = [[x / width, y / height] for x, y in coords]
        print(normalized_coords)

        # 1) autocast 컨텍스트 분기 처리 (CPU 안전)
        if torch.cuda.is_available():
            autocast_ctx = torch.autocast("cuda", dtype=torch.bfloat16)
            device = "cuda"
        else:
            autocast_ctx = nullcontext()
            device = "cpu"

        # 3) 예측
        # 함수 설명에는 normalize_coords = true 면 정규화 값 넣으라고 하는데 반대임
        with torch.inference_mode(), autocast_ctx:
            masks, scores, logits = predictor.predict(
                point_coords=np.array(coords),
                point_labels=np.array(labels),
                mask_input=None,
                multimask_output=True,
                box=None,
            )

        for i in range(len(masks)):
            mask = masks[i]
            score = scores[i]

            pixel_count = np.count_nonzero(mask)  # 마스크 픽셀 수 (0이 아닌 값의 개수)
            
            print(f"[{i}] mask pixel count: {pixel_count}")
            print(f"[{i}] score: {score:.4f}")

        # 4) score 기준 최고 마스크 선택
        best_idx = np.argmax(scores)  # 가장 높은 score를 가진 마스크 인덱스
        print(f"best mask index: {best_idx}, score: {scores[best_idx]:.4f}")
        best_mask = masks[best_idx].astype(np.uint8) * 255

        # # 5) 마스크 PIL 이미지로 변환 및 리사이즈
        # mask_img = Image.fromarray(best_mask).convert("L").resize(pil_image.size)

        # # 6) 빨간 마스크 덧씌우기
        # red_mask = Image.new("RGBA", pil_image.size, (255, 0, 0, 180))
        # mask_rgba = Image.new("RGBA", pil_image.size)
        # mask_rgba.paste(red_mask, mask=mask_img)

        # # 7) 원본 이미지와 합성
        # image_rgba = pil_image.convert("RGBA")
        # composite = Image.alpha_composite(image_rgba, mask_rgba)

        # 6) OpenAI 요구 포맷 마스크 생성 (투명 배경, 편집 영역은 투명)
        # OpenAI는 편집할 영역을 투명(알파 0)으로 요구하므로 best_mask 반전 처리
        alpha_channel = Image.fromarray(255 - best_mask).convert("L")  # 255-best_mask : 편집영역 투명(0)
        mask_image = Image.new("RGBA", pil_image.size, (0, 0, 0, 255))  # 검정 배경 불투명
        mask_image.putalpha(alpha_channel)  # 알파 채널로 편집 영역 지정

        # 8) 이미지 반환
        buf = BytesIO()
        # composite.save(buf, format="PNG")
        mask_image.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
