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

        # 2) 포인트 좌표 파싱 (예: "[[450, 600], [800, 500]]")
        coords = json.loads(point_coords)
        # labels = [1] * len(coords)
        labels = json.loads(point_labels)
        print(labels, coords)

        # 3) 예측
        with torch.inference_mode(), torch.autocast("cuda" if torch.cuda.is_available() else "cpu", dtype=torch.bfloat16):
            masks, scores, logits = predictor.predict(
                point_coords=coords,
                point_labels=labels,
            )

        # 4) 첫 번째 마스크 생성
        mask = masks[0].astype(np.uint8) * 255
        mask_img = Image.fromarray(mask).convert("L").resize(pil_image.size)

        red_mask = Image.new("RGBA", pil_image.size, (255, 0, 0, 180))
        mask_rgba = Image.new("RGBA", pil_image.size)
        mask_rgba.paste(red_mask, mask=mask_img)

        image_rgba = pil_image.convert("RGBA")
        composite = Image.alpha_composite(image_rgba, mask_rgba)

        # 5) 이미지 반환
        buf = BytesIO()
        composite.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
