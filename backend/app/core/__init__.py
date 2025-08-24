"""
Core Application Logic

This package contains the core business logic for EduBridge backend,
including OCR processing, diagram detection, and AI features.
"""

from .config import get_settings
from .logging import get_logger

__all__ = ["get_settings", "get_logger"]
