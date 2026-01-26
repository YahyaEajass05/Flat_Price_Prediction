"""
Utility functions for logging, error handling, and common operations
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
import json
import joblib
from typing import Any, Dict, Optional

from src.config import LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT, LOGS_DIR


def setup_logging(log_file: Optional[str] = None, console_level: str = None) -> logging.Logger:
    """
    Setup logging configuration
    
    Args:
        log_file: Optional log file name
        console_level: Console logging level (overrides config)
        
    Returns:
        Root logger
    """
    # Create logs directory if it doesn't exist
    LOGS_DIR.mkdir(exist_ok=True)
    
    # Set logging level
    level = console_level or LOG_LEVEL
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create root logger
    logger = logging.getLogger()
    logger.setLevel(numeric_level)
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_formatter = logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler
    if log_file:
        log_path = LOGS_DIR / log_file
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_path = LOGS_DIR / f"pipeline_{timestamp}.log"
    
    file_handler = logging.FileHandler(log_path)
    file_handler.setLevel(logging.DEBUG)  # Always log everything to file
    file_formatter = logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    logger.info(f"Logging initialized - Level: {level}, Log file: {log_path}")
    
    return logger


def save_json(data: Dict, filepath: Path):
    """
    Save dictionary to JSON file
    
    Args:
        data: Dictionary to save
        filepath: Path to save file
    """
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4, default=str)
    logging.info(f"Saved JSON to {filepath}")


def load_json(filepath: Path) -> Dict:
    """
    Load dictionary from JSON file
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        Loaded dictionary
    """
    with open(filepath, 'r') as f:
        data = json.load(f)
    logging.info(f"Loaded JSON from {filepath}")
    return data


def save_model(model: Any, filepath: Path):
    """
    Save model to file using joblib
    
    Args:
        model: Model object to save
        filepath: Path to save file
    """
    joblib.dump(model, filepath)
    logging.info(f"Saved model to {filepath}")


def load_model(filepath: Path) -> Any:
    """
    Load model from file using joblib
    
    Args:
        filepath: Path to model file
        
    Returns:
        Loaded model
    """
    model = joblib.load(filepath)
    logging.info(f"Loaded model from {filepath}")
    return model


def format_number(number: float, decimals: int = 0) -> str:
    """
    Format number with thousands separator
    
    Args:
        number: Number to format
        decimals: Number of decimal places
        
    Returns:
        Formatted string
    """
    if decimals == 0:
        return f"{number:,.0f}"
    else:
        return f"{number:,.{decimals}f}"


def print_header(text: str, char: str = "=", width: int = 70):
    """
    Print formatted header
    
    Args:
        text: Header text
        char: Character to use for border
        width: Width of header
    """
    print("\n" + char * width)
    print(text.center(width))
    print(char * width)


def print_section(text: str, char: str = "-", width: int = 70):
    """
    Print formatted section
    
    Args:
        text: Section text
        char: Character to use for border
        width: Width of section
    """
    print("\n" + text)
    print(char * width)


class Timer:
    """Context manager for timing code execution"""
    
    def __init__(self, name: str = "Operation"):
        """
        Initialize Timer
        
        Args:
            name: Name of the operation being timed
        """
        self.name = name
        self.start_time = None
        self.elapsed_time = None
        
    def __enter__(self):
        """Start timer"""
        self.start_time = datetime.now()
        logging.info(f"Starting: {self.name}")
        return self
    
    def __exit__(self, *args):
        """Stop timer and log elapsed time"""
        end_time = datetime.now()
        self.elapsed_time = (end_time - self.start_time).total_seconds()
        logging.info(f"Completed: {self.name} in {self.elapsed_time:.2f} seconds")


def get_timestamp() -> str:
    """
    Get current timestamp as formatted string
    
    Returns:
        Formatted timestamp
    """
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ensure_dir(directory: Path):
    """
    Ensure directory exists
    
    Args:
        directory: Directory path
    """
    directory.mkdir(parents=True, exist_ok=True)


def get_file_size(filepath: Path) -> str:
    """
    Get file size as formatted string
    
    Args:
        filepath: Path to file
        
    Returns:
        Formatted file size
    """
    size_bytes = filepath.stat().st_size
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    
    return f"{size_bytes:.2f} TB"
