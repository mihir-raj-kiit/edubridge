import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import json
import os
from app.config import settings
from app.core.image_processor import ImageProcessor

class DiagramDetector:
    """Detect diagrams, flowcharts, and visual elements in images"""

    def __init__(self):
        self.processor = ImageProcessor()
        # Use settings directly, assuming they are accessible and modifiable globally if needed,
        # or better, pass them as arguments if they can change per instance.
        # For this refactoring, we'll assume direct access is intended.
        self.min_contour_area = settings.min_contour_area
        self.diagram_threshold = settings.diagram_detection_threshold # This variable is not used in the provided snippet, but kept for completeness if it were used elsewhere.

    def detect_diagrams(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Detect diagrams and shapes in an image.

        Args:
            image_path: Path to the image file

        Returns:
            List of detected diagram elements with bounding boxes and shape information.
        """
        # Validate and load image
        image = self.processor.validate_image(image_path)
        if image is None:
            # Return empty list if image is invalid or not found, as per original function's behavior
            return []

        # Preprocess for diagram detection
        # Note: The original code used `preprocess_for_diagram_detection` which returns gray and thresh.
        # The edited code uses this correctly.
        gray, thresh = self.processor.preprocess_for_diagram_detection(image)

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detected_elements = []

        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)

            # Filter out small contours
            if area < self.min_contour_area:
                continue

            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)

            # Calculate shape properties
            aspect_ratio = w / h if h > 0 else 0
            # Extent calculation was added in the edited code
            extent = area / (w * h) if w > 0 and h > 0 else 0

            # Classify shape using the new internal method
            shape_type = self._classify_shape(contour, aspect_ratio, extent)

            detected_elements.append({
                "id": f"element_{i}",
                "type": "diagram_element",
                "shape": shape_type,
                "bbox": {
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h)
                },
                "area": float(area),
                "aspect_ratio": float(aspect_ratio),
                # Confidence calculation is simplified in the edited code
                "confidence": min(0.95, 0.5 + (area / 10000))
            })

        return detected_elements

    def _classify_shape(self, contour: np.ndarray, aspect_ratio: float, extent: float) -> str:
        """Classify the shape of a contour using approximated polygon vertices and other properties."""

        # Approximate contour to polygon
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        vertices = len(approx)

        # Classify based on vertices and properties, adapted from original logic but within class
        if vertices <= 4:
            if 0.8 <= aspect_ratio <= 1.2 and extent > 0.7: # Specific check for square
                return "square"
            elif extent > 0.7: # Broader check for rectangle/other quadrilaterals
                return "rectangle"
            elif vertices == 3: # Triangle
                return "triangle"
            else: # Quadrilateral with less regular properties or other shapes with <= 4 vertices
                return "polygon"
        elif vertices > 8 or extent > 0.7: # For shapes with many vertices or high extent (potentially circular/elliptical)
            if 0.8 <= aspect_ratio <= 1.2: # Aspect ratio check for circularity
                return "circle"
            else: # Elliptical or irregular shapes with many vertices
                return "ellipse"
        else: # Default to polygon for other cases
            return "polygon"

    def detect_connections(self, image_path: str, elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect connections (lines, arrows) between diagram elements.

        Args:
            image_path: Path to the image file
            elements: List of detected elements (used to find which elements are connected)

        Returns:
            List of detected connections with start/end points and connected element IDs.
        """
        # Load and preprocess image
        image = self.processor.validate_image(image_path)
        if image is None:
            return []

        # Preprocessing for line detection might differ from shape detection,
        # but for now, reusing the same preprocess step.
        gray, thresh = self.processor.preprocess_for_diagram_detection(image)

        # Detect lines using HoughLinesP for better line segment detection
        lines = cv2.HoughLinesP(
            thresh,
            rho=1,  # Distance resolution in pixels
            theta=np.pi / 180,  # Angle resolution in radians
            threshold=50,  # Accumulator threshold for line detection
            minLineLength=30,  # Minimum line length. Line segments shorter than this are rejected.
            maxLineGap=10  # Maximum allowed gap between points on the same line to link them.
        )

        connections = []

        if lines is not None:
            for i, line in enumerate(lines):
                x1, y1, x2, y2 = line[0]

                # Calculate line properties
                length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                angle = np.arctan2(y2-y1, x2-x1) * 180 / np.pi # Angle in degrees

                # Find which elements this line connects to using bounding boxes
                connected_element_ids = self._find_connected_elements(
                    (x1, y1, x2, y2), elements
                )

                # Only consider connections between at least two elements
                if len(connected_element_ids) >= 2:
                    connections.append({
                        "id": f"connection_{i}",
                        "type": "line", # Could be extended to detect arrows
                        "start": {"x": int(x1), "y": int(y1)},
                        "end": {"x": int(x2), "y": int(y2)},
                        "length": float(length),
                        "angle": float(angle),
                        "connects": connected_element_ids[:2]  # Store IDs of the first two connected elements
                    })

        return connections

    def _find_connected_elements(self, line: Tuple[int, int, int, int],
                                elements: List[Dict[str, Any]]) -> List[str]:
        """Find which elements a line connects to by checking if line endpoints are near element bounding boxes."""
        x1, y1, x2, y2 = line
        connected_ids = []

        for element in elements:
            bbox = element["bbox"]

            # Check if either endpoint of the line is close to the bounding box of an element
            if self._point_near_bbox((x1, y1), bbox, tolerance=20):
                connected_ids.append(element["id"])
            elif self._point_near_bbox((x2, y2), bbox, tolerance=20):
                connected_ids.append(element["id"])

        # Ensure unique IDs
        return list(set(connected_ids))

    def _point_near_bbox(self, point: Tuple[int, int], bbox: Dict[str, int],
                        tolerance: int = 10) -> bool:
        """Check if a point is within a bounding box with a given tolerance."""
        x, y = point
        bx, by, bw, bh = bbox["x"], bbox["y"], bbox["width"], bbox["height"]

        # Check if the point's coordinates are within the bounding box, expanded by tolerance
        return (bx - tolerance <= x <= bx + bw + tolerance and
                by - tolerance <= y <= by + bh + tolerance)

def detect_diagrams_json(image_path: str) -> List[Dict[str, Any]]:
    """
    Orchestrates diagram detection and returns results in a JSON-compatible format.
    This function now acts as an interface to the DiagramDetector class.

    Args:
        image_path: Path to the image file

    Returns:
        List of detected diagram elements, formatted for JSON output.
    """
    try:
        detector = DiagramDetector()

        # Detect diagram elements using the class method
        elements = detector.detect_diagrams(image_path)

        # Detect connections between elements using the class method
        connections = detector.detect_connections(image_path, elements)

        # Combine results into a format similar to the original detect_diagrams_json output
        # The original function returned a list of boxes, while the edited class returns more detailed elements.
        # We'll map back to the original expected output format for compatibility.
        result = []

        # Format detected elements to match the original 'boxes' output structure
        for element in elements:
            bbox = element["bbox"]
            result.append({
                "x": bbox["x"],
                "y": bbox["y"],
                "w": bbox["width"],
                "h": bbox["height"],
                "shape": element["shape"],
                "confidence": element["confidence"]
            })

        # Note: The original detect_diagrams_json did not include connections.
        # If connections are to be part of this output, the structure would need to be updated.
        # For now, adhering to the original function's output by only including element bounding boxes.
        # If connections should be included, the `result` structure would need modification.
        # Example: result.append({"type": "connection", "start": conn["start"], ...})

        return result

    except FileNotFoundError:
        # Handle specific case where image_path might be invalid early on
        print(f"❌ File not found or invalid: {image_path}")
        return []
    except Exception as e:
        # Catch other potential errors during detection
        print(f"❌ Error in diagram detection for {image_path}: {e}")
        return []

# The original file had standalone functions and an `if __name__ == "__main__":` block.
# The new structure uses a class. The original `if __name__ == "__main__":` block
# was intended for testing the standalone functions.
# To maintain testability, we can adapt this block to instantiate and use the DiagramDetector class.
# However, the original snippet provided does NOT include the `if __name__ == "__main__":` block.
# Therefore, we will omit it as per the instructions to only include what's in the original and edited.
# If the intention was to keep the test block, it would need to be explicitly provided in the original.
# Given the prompt, we focus on the class implementation and the `detect_diagrams_json` interface.