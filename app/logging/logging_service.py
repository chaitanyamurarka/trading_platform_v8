
import logging
from functools import wraps
from time import time

logger = logging.getLogger(__name__)

def timed(func):
    """
    This decorator prints the execution time for the decorated function.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time()
        result = func(*args, **kwargs)
        end = time()
        logger.info(f'{func.__name__} ran in {round(end - start, 2)}s')
        return result
    return wrapper

def log_request(request):
    """
    Log the incoming request details.
    """
    logger.info(f"Received request: {request.method} {request.url}")
    logger.info(f"Client IP: {request.client.host}")

def log_response(response):
    """
    Log the outgoing response details.
    """
    logger.info(f"Sent response with status code: {response.status_code}")

def log_data_interchange(source, destination, data):
    """
    Log the data interchange between functions.
    """
    logger.info(f"Data interchange from {source} to {destination}: {data}")

def log_operation_step(step_name, **kwargs):
    """
    Log a step of an operation.
    """
    log_message = f"Operation step: {step_name}"
    if kwargs:
        log_message += f" - Details: {kwargs}"
    logger.info(log_message)

def log_summary(summary):
    """
    Log a summary of data sent to the client.
    """
    logger.info(f"Summary of data sent to client: {summary}")
