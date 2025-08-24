"""
Image Processing Utilities

Common image processing functions used across the application.
"""

from typing import Tuple, Optional
from pathlib import Path
import shutil
import uuid
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np

from app.core.logging import get_logger
from app.core.config import get_settings

logger = get_logger(__name__)
settings = get_settings()


class ImageProcessor:
    """Utility class for image processing operations"""
    
    @staticmethod
    def save_uploaded_file(uploaded_file, upload_dir: str = None) -> str:
        """
        Save uploaded file to disk
        
        Args:
            uploaded_file: FastAPI UploadFile object
            upload_dir: Directory to save file (defaults to settings.UPLOAD_DIR)
            
        Returns:
            Path to saved file
        """
        if upload_dir is None:
            upload_dir = settings.UPLOAD_DIR
        
        # Create upload directory if it doesn't exist
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(uploaded_file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = Path(upload_dir) / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
        
        logger.info(f"Saved uploaded file to: {file_path}")
        return str(file_path)
    
    @staticmethod
    def preprocess_image(image_path: str, output_path: str = None) -> str:
        """
        Preprocess image for better OCR results
        
        Args:
            image_path: Path to input image
            output_path: Path for processed image (optional)
            
        Returns:
            Path to processed image
        """
        try:
            if output_path is None:
                output_path = str(Path(settings.TEMP_DIR) / f"processed_{Path(image_path).name}")
            
            # Ensure temp directory exists
            Path(settings.TEMP_DIR).mkdir(parents=True, exist_ok=True)
            
            # Open image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Enhance image for better OCR
            image = ImageProcessor._enhance_for_ocr(image)
            
            # Save processed image
            image.save(output_path, quality=95)
            
            logger.info(f"Preprocessed image saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {str(e)}")
            raise
    
    @staticmethod
    def _enhance_for_ocr(image: Image.Image) -> Image.Image:
        """
        Apply enhancements to improve OCR accuracy
        
        Args:
            image: PIL Image object
            
        Returns:
            Enhanced PIL Image object
        """
        # Increase contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        
        # Increase sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.1)
        
        # Apply slight denoising
        image = image.filter(ImageFilter.MedianFilter(size=3))
        
        return image
    
    @staticmethod
    def resize_image(image_path: str, max_width: int = 1920, max_height: int = 1080) -> str:
        """
        Resize image while maintaining aspect ratio
        
        Args:
            image_path: Path to input image
            max_width: Maximum width
            max_height: Maximum height
            
        Returns:
            Path to resized image
        """
        try:
            image = Image.open(image_path)
            
            # Calculate new size maintaining aspect ratio
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save resized image
            resized_path = str(Path(settings.TEMP_DIR) / f"resized_{Path(image_path).name}")
            image.save(resized_path, quality=95)
            
            logger.info(f"Resized image saved to: {resized_path}")
            return resized_path
            
        except Exception as e:
            logger.error(f"Error resizing image {image_path}: {str(e)}")
            raise
    
    @staticmethod
    def get_image_info(image_path: str) -> dict:
        """
        Get basic information about an image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with image information
        """
        try:
            image = Image.open(image_path)
            
            return {
                "width": image.width,
                "height": image.height,
                "mode": image.mode,
                "format": image.format,
                "size_bytes": Path(image_path).stat().st_size
            }
            
        except Exception as e:
            logger.error(f"Error getting image info for {image_path}: {str(e)}")
            raise
    
    @staticmethod
    def convert_to_opencv(image_path: str) -> np.ndarray:
        """
        Convert image to OpenCV format
        
        Args:
            image_path: Path to image file
            
        Returns:
            OpenCV image array
        """
        try:
            # Read image with OpenCV
            image = cv2.imread(image_path)
            
            if image is None:
                raise ValueError(f"Could not read image: {image_path}")
            
            return image
            
        except Exception as e:
            logger.error(f"Error converting image to OpenCV format: {str(e)}")
            raise
    
    @staticmethod
    def cleanup_temp_files(file_paths: list):
        """
        Clean up temporary files
        
        Args:
            file_paths: List of file paths to delete
        """
        for file_path in file_paths:
            try:
                if Path(file_path).exists():
                    Path(file_path).unlink()
                    logger.debug(f"Deleted temporary file: {file_path}")
            except Exception as e:
                logger.warning(f"Could not delete temporary file {file_path}: {str(e)}")


# Global image processor instance
image_processor = ImageProcessor()
