
import logging
from logging.handlers import RotatingFileHandler
import sys

def setup_logging():
    """
    Set up the logging configuration for the application.
    """
    log_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Rotating file handler
    file_handler = RotatingFileHandler(
        'app.log', maxBytes=1024 * 1024 * 1024, backupCount=5  # 1GB per file
    )
    file_handler.setFormatter(log_formatter)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_formatter)

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    return root_logger
