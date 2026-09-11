import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from backend.ml.pipeline import MLPipeline

pipeline = MLPipeline()
with open("images/image1.jpg", "rb") as f:
    image_bytes = f.read()

res = pipeline.run_full_pipeline(image_bytes)
print("--- OCR TOKENS ---")
for t in res.ocr_tokens:
    print(t)
