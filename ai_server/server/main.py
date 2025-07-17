from contextlib import nullcontext
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import torch
from PIL import Image
from io import BytesIO
import numpy as np
import json
from sam2.sam2_image_predictor import SAM2ImagePredictor
import nltk
from urllib.parse import urlparse
from crawler.crawl_func import summarize_text, fetch_github_readme, crawl_blog_content_hybrid
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

class URLRequest(BaseModel):
    url: str


DEBUG = False
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# global variable
sam2_predictor = None
summarizer_pipeline = None
summarizer_tokenizer = None

def get_summarizer():
    global summarizer_pipeline, summarizer_tokenizer
    return summarizer_pipeline, summarizer_tokenizer

@app.on_event("startup")
def download_nltk_resources():
    global summarizer_pipeline, summarizer_tokenizer
    global sam2_predictor

    model_name = "facebook/bart-large-cnn"
    summarizer_tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer_pipeline = pipeline("summarization", model=model, tokenizer=tokenizer)

    nltk.download("punkt")
    nltk.download('punkt_tab')

    sam2_predictor = SAM2ImagePredictor.from_pretrained("facebook/sam2-hiera-base-plus")

@app.post("/segment")
async def segment_image(
    image: UploadFile = File(...),
    point_coords: str = Form(...),
    point_labels: str = Form(...)
):
    global sam2_predictor
    try:
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents)).convert("RGB")
        sam2_predictor.set_image(pil_image)

        width, height = pil_image.size
        if DEBUG:
            print("이미지 사이즈:", width, height)

        coords = json.loads(point_coords)
        labels = json.loads(point_labels)

        if DEBUG:
            print(f"labels: {labels}")
            print(f"coords: {coords}")

        # normalized_coords = [[x / width, y / height] for x, y in coords]
        # if DEBUG:
        #     print(normalized_coords)

        if torch.cuda.is_available():
            autocast_ctx = torch.autocast("cuda", dtype=torch.bfloat16)
        else:
            autocast_ctx = nullcontext()

        with torch.inference_mode(), autocast_ctx:
            masks, scores, logits = sam2_predictor.predict(
                point_coords=np.array(coords),
                point_labels=np.array(labels),
                mask_input=None,
                multimask_output=True,
                box=None,
            )

        best_idx = np.argmax(scores)
        if DEBUG:
            print(f"mask list: {scores}")
            print(
                f"best mask index: {best_idx}, score: {scores[best_idx]:.4f}")
        best_mask = masks[best_idx].astype(np.uint8) * 255

        alpha_channel = Image.fromarray(255 - best_mask).convert("L")
        mask_image = Image.new("RGBA", pil_image.size, (0, 0, 0, 255))
        mask_image.putalpha(alpha_channel)

        buf = BytesIO()
        mask_image.save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/crawl/summarize")
async def summarize_url(request: URLRequest):
    url = request.url
    try:
        # crawling
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if "github.com" in domain:
            raw_text = fetch_github_readme(url)
        else:
            raw_text = crawl_blog_content_hybrid(url)

        # LLM summarize
        summarizer, tokenizer = get_summarizer()
        summary = summarize_text(raw_text, summarizer, tokenizer)
        return {
            "raw_text": raw_text,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
