import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings
from app.core.image_processor import ImageProcessor

# Initialize image processor
processor = ImageProcessor()

def detect_shapes(contour: np.ndarray) -> str:
    """
    Detect shape type from contour
    
    Args:
        contour: OpenCV contour
        
    Returns:
        Shape type string
    """
    # Approximate contour
    epsilon = 0.02 * cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, epsilon, True)
    vertices = len(approx)
    
    # Classify based on vertices
    if vertices == 3:
        return "triangle"
    elif vertices == 4:
        # Check if it's a square or rectangle
        (x, y, w, h) = cv2.boundingRect(approx)
        aspect_ratio = w / float(h)
        if 0.95 <= aspect_ratio <= 1.05:
            return "square"
        else:
            return "rectangle"
    elif vertices > 4:
        # Check if it's circular
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        if perimeter > 0:
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity > 0.7:
                return "circle"
        return "polygon"
    else:
        return "unknown"

def analyze_diagram_complexity(boxes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze the complexity of detected diagrams
    
    Args:
        boxes: List of detected bounding boxes
        
    Returns:
        Complexity analysis
    """
    if not boxes:
        return {"complexity": "none", "count": 0, "total_area": 0}
    
    total_area = sum(box["w"] * box["h"] for box in boxes)
    count = len(boxes)
    avg_area = total_area / count if count > 0 else 0
    
    # Classify complexity
    if count == 1:
        complexity = "simple"
    elif count <= 3:
        complexity = "moderate"
    else:
        complexity = "complex"
    
    return {
        "complexity": complexity,
        "count": count,
        "total_area": total_area,
        "average_area": avg_area,
        "largest_box": max(boxes, key=lambda x: x["w"] * x["h"]) if boxes else None
    }

def detect_diagrams(image_path: str) -> np.ndarray:
    """
    Returns annotated image with green boxes around diagrams/flowcharts
    
    Args:
        image_path: Path to input image
        
    Returns:
        Annotated image array
        
    Raises:
        FileNotFoundError: If image file not found
    """
    # Validate and load image
    image = processor.validate_image(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found or invalid: {image_path}")
    
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Preprocess image for diagram detection
    gray, thresh = processor.preprocess_for_diagram_detection(image)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create annotated image
    annotated_img = image_rgb.copy()
    
    for cnt in contours:
        # Filter contours by area
        if cv2.contourArea(cnt) > settings.min_contour_area:
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Apply additional filters
            aspect_ratio = w / h if h > 0 else 0
            if 0.2 <= aspect_ratio <= 5.0:  # Filter extreme aspect ratios
                # Detect shape type
                shape = detect_shapes(cnt)
                
                # Draw bounding box
                cv2.rectangle(annotated_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
                
                # Add shape label
                cv2.putText(annotated_img, shape, (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    return annotated_img

def detect_diagrams_json(image_path: str) -> List[Dict[str, Any]]:
    """
    Returns bounding boxes of diagrams as list of dictionaries
    
    Args:
        image_path: Path to input image
        
    Returns:
        List of bounding box dictionaries with additional metadata
        
    Raises:
        FileNotFoundError: If image file not found
    """
    # Validate and load image
    image = processor.validate_image(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found or invalid: {image_path}")
    
    # Preprocess image for diagram detection
    gray, thresh = processor.preprocess_for_diagram_detection(image)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = []
    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        
        # Filter contours by area
        if area > settings.min_contour_area:
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Apply additional filters
            aspect_ratio = w / h if h > 0 else 0
            if 0.2 <= aspect_ratio <= 5.0:  # Filter extreme aspect ratios
                # Detect shape type
                shape = detect_shapes(cnt)
                
                # Calculate confidence based on area and shape regularity
                perimeter = cv2.arcLength(cnt, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    confidence = min(0.95, max(0.5, circularity + (area / 10000) * 0.1))
                else:
                    confidence = 0.5
                
                boxes.append({
                    "x": int(x),
                    "y": int(y),
                    "w": int(w),
                    "h": int(h),
                    "area": int(area),
                    "shape": shape,
                    "confidence": round(confidence, 2),
                    "aspect_ratio": round(aspect_ratio, 2),
                    "id": f"diagram_{i}"
                })
    
    # Sort boxes by area (largest first)
    boxes.sort(key=lambda x: x["area"], reverse=True)
    
    return boxes

def detect_diagrams_advanced(
    image_path: str, 
    min_area: Optional[int] = None,
    threshold: Optional[int] = None
) -> Dict[str, Any]:
    """
    Advanced diagram detection with analysis
    
    Args:
        image_path: Path to input image
        min_area: Minimum contour area (overrides config)
        threshold: Threshold value (overrides config)
        
    Returns:
        Dictionary with boxes and analysis
    """
    # Use custom parameters if provided
    original_min_area = settings.min_contour_area
    original_threshold = settings.diagram_detection_threshold
    
    if min_area is not None:
        settings.min_contour_area = min_area
    if threshold is not None:
        settings.diagram_detection_threshold = threshold
    
    try:
        # Detect diagrams
        boxes = detect_diagrams_json(image_path)
        
        # Analyze complexity
        analysis = analyze_diagram_complexity(boxes)
        
        return {
            "boxes": boxes,
            "analysis": analysis,
            "parameters": {
                "min_area": settings.min_contour_area,
                "threshold": settings.diagram_detection_threshold
            }
        }
    
    finally:
        # Restore original settings
        settings.min_contour_area = original_min_area
        settings.diagram_detection_threshold = original_threshold

def save_annotated_image(image_path: str, output_path: str) -> bool:
    """
    Save annotated image with detected diagrams
    
    Args:
        image_path: Path to input image
        output_path: Path to save annotated image
        
    Returns:
        True if successful, False otherwise
    """
    try:
        annotated = detect_diagrams(image_path)
        # Convert RGB back to BGR for OpenCV saving
        annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
        return cv2.imwrite(output_path, annotated_bgr)
    except Exception as e:
        print(f"❌ Failed to save annotated image: {e}")
        return False

# Optional test block
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        
        try:
            # Test diagram detection
            boxes = detect_diagrams_json(image_path)
            print(f"✅ Detected {len(boxes)} diagrams:")
            for box in boxes:
                print(f"  - {box['shape']} at ({box['x']}, {box['y']}) "
                      f"size: {box['w']}x{box['h']} confidence: {box['confidence']}")
            
            # Save annotated image
            output_path = "annotated_" + os.path.basename(image_path)
            if save_annotated_image(image_path, output_path):
                print(f"✅ Annotated image saved to {output_path}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("Usage: python diagram_detector.py <image_path>")
