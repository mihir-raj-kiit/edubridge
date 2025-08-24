import cv2
import numpy as np

def detect_diagrams(image_path):
    """
    Returns annotated image with green boxes around diagrams/flowcharts
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found: {image_path}")
    image_cv = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Grayscale + blur + threshold
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    _, thresh = cv2.threshold(blurred, 150, 255, cv2.THRESH_BINARY_INV)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    annotated_img = image_cv.copy()
    for cnt in contours:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        if len(approx) >= 4 and cv2.contourArea(cnt) > 1000:
            cv2.drawContours(annotated_img, [approx], 0, (0, 255, 0), 2)

    return annotated_img

def detect_diagrams_json(image_path):
    """
    Returns bounding boxes of diagrams as list of dictionaries
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found: {image_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    _, thresh = cv2.threshold(blurred, 150, 255, cv2.THRESH_BINARY_INV)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for cnt in contours:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        if len(approx) >= 4 and cv2.contourArea(cnt) > 1000:
            x, y, w, h = cv2.boundingRect(approx)
            boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})

    return boxes

# Optional test block
if __name__ == "__main__":
    annotated = detect_diagrams("sample_image.jpg")
    cv2.imwrite("annotated_image.jpg", cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))
    print("Boxes:", detect_diagrams_json("sample_image.jpg"))
