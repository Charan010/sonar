from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import base64
import random

app = FastAPI()

# ✅ allow your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎨 create fake white image → base64
def generate_white_image_base64(width=224, height=224):
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


# 🎲 fake labels
LABELS = ["ship", "fish", "mine", "plane", "human", "seafloor"]


@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    # simulate "processing delay"
    import time
    time.sleep(1.2)

    label = random.choice(LABELS)
    probability = round(random.uniform(0.6, 0.98), 2)

    return {
        "model_prediction": {
            "label": label,
            "probability": probability,
            "gradcam_image_base64": generate_white_image_base64(),
            "lime_image_base64": generate_white_image_base64(),
        }
    }