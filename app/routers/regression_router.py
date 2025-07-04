
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas import RegressionRequest, RegressionResponse
from app.services.regression_service import RegressionService

router = APIRouter()

@router.post("/regression", response_model=RegressionResponse)
async def get_regression(
    request: RegressionRequest,
    regression_service: RegressionService = Depends(RegressionService)
):
    """
    Calculates linear regression on historical data for a given symbol.
    """
    try:
        results = await regression_service.calculate_regression(request)
        return RegressionResponse(request_params=request, regression_results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
