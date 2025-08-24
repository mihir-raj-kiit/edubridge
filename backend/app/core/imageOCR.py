import cv2
import easyocr
import json
from datetime import datetime
import os
from spellchecker import SpellChecker 

 # This is correct for pyspellchecker
# Try to use handwriting-tuned model if available (EasyOCR >=1.6.0)
try:
    reader = easyocr.Reader(['en'], recog_network='english_g2')
except Exception:
    reader = easyocr.Reader(['en'])

spell = SpellChecker()

def correct_spelling(text):
    words = text.split()
    corrected = []
    for word in words:
        if word.isalpha() and not word.isupper():
            fixed = spell.correction(word)
            corrected.append(fixed if fixed else word)
        else:
            corrected.append(word)
    return " ".join(corrected)

def process_image(image_path, output_file="notes.json"):
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return

    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ Failed to load image: {image_path}")
        return

    # Upscale for thin handwriting
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Adaptive thresholding for variable backgrounds
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11
    )

    # Dilation to connect broken handwriting
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thresh = cv2.dilate(thresh, kernel, iterations=1)

    # Run OCR with contrast/decoder tuning if possible
    try:
        result = reader.readtext(
            thresh, detail=0, paragraph=True,
            contrast_ths=0.1, adjust_contrast=0.7, decoder='greedy'
        )
    except TypeError:
        # EasyOCR version fallback
        result = reader.readtext(thresh, detail=0, paragraph=True)

    if not result:
        print("⚠️ No text detected in the image")
        return

    print("Detected text blocks:")
    for text in result:
        print("-", text)

    notes_data = {
        "lecture_id": "lec_001",
        "course": "Operating Systems",
        "topic": "Process Management",
        "date": datetime.today().strftime("%Y-%m-%d"),
        "content": []
    }

    for text in result:
        text = text.strip()
        if text:
            fixed = correct_spelling(text)
            if fixed.isupper():
                notes_data["content"].append({
                    "type": "heading",
                    "text": fixed
                })
            else:
                notes_data["content"].append({
                    "type": "text",
                    "text": fixed
                })

    # Diagram placeholder
    notes_data["content"].append({
        "type": "diagram",
        "title": "Placeholder Diagram",
        "description": "Auto-detected figure (manual description required)",
        "nodes": [],
        "connections": []
    })

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(notes_data, f, indent=4, ensure_ascii=False)

    print(f"✅ Structured notes saved to {output_file}")

if __name__ == "__main__":
    process_image(r"C:\Users\KIIT0001\Pictures\mihir_notes.jpg")