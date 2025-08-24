import cv2
import numpy as np
from typing import Tuple, Optional
from app.config import settings

class ImageProcessor:
    """Image processing utilities for OCR and diagram detection"""
    
    def __init__(self):
        self.diagram_threshold = settings.diagram_detection_threshold
        self.min_contour_area = settings.min_contour_area
    
    def preprocess_for_ocr(self, image: np.ndarray, scale_factor: float = 2.0) -> np.ndarray:
        """
        Preprocess image for better OCR results
        
        Args:
            image: Input image
            scale_factor: Upscaling factor for thin handwriting
            
        Returns:
            Preprocessed image
        """
        # Upscale for thin handwriting
        height, width = image.shape[:2]
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Adaptive thresholding for variable backgrounds
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11
        )
        
        # Dilation to connect broken handwriting
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        thresh = cv2.dilate(thresh, kernel, iterations=1)
        
        return thresh
    
    def preprocess_for_diagram_detection(self, image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess image for diagram detection
        
        Args:
            image: Input image
            
        Returns:
            Tuple of (processed_image, threshold_image)
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply threshold
        _, thresh = cv2.threshold(blurred, self.diagram_threshold, 255, cv2.THRESH_BINARY_INV)
        
        return gray, thresh
    
    def enhance_image_quality(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image quality for better processing
        
        Args:
            image: Input image
            
        Returns:
            Enhanced image
        """
        # Denoise
        if len(image.shape) == 3:
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        else:
            denoised = cv2.fastNlMeansDenoising(image, None, 10, 7, 21)
        
        # Enhance contrast
        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB) if len(denoised.shape) == 3 else denoised
        if len(denoised.shape) == 3:
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            enhanced = cv2.merge([l, a, b])
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        else:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
        
        return enhanced
    
    def validate_image(self, image_path: str) -> Optional[np.ndarray]:
        """
        Validate and load image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Loaded image or None if invalid
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            # Check image dimensions
            height, width = image.shape[:2]
            if height < 100 or width < 100:
                return None
            
            return image
            
        except Exception:
            return None
