
from typing import List, Dict
from app.schemas import RegressionRequest, RegressionResult, TimeframeRegressionResult, Interval
from app.services.historical_service import get_historical_data
import numpy as np
from scipy import stats
from datetime import datetime, timedelta

class RegressionService:
    async def calculate_regression(self, request: RegressionRequest) -> List[TimeframeRegressionResult]:
        """
        Calculates linear regression for the given request.
        """
        all_results = []

        for timeframe in request.timeframes:
            timeframe_results = TimeframeRegressionResult(timeframe=timeframe, results={})

            # Fetch initial data to get the latest timestamp
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=90)  # Look back up to 90 days

            try:
                initial_data = get_historical_data(
                    session_token="backtest",
                    exchange=request.exchange,
                    token=request.symbol,
                    interval_val=timeframe.value,
                    start_time=start_time,
                    end_time=end_time,
                    timezone="UTC",
                    data_type="regular"
                )
            except Exception as e:
                # Handle cases where no data is returned for a timeframe
                print(f"Could not fetch data for timeframe {timeframe.value}: {e}")
                continue

            if not initial_data.candles:
                continue

            # Sort candles by timestamp descending to easily get the latest
            sorted_candles = sorted(initial_data.candles, key=lambda c: c.unix_timestamp, reverse=True)

            for lookback in request.lookback_periods:
                if lookback >= len(sorted_candles):
                    continue

                start_index = lookback
                end_index = start_index + request.regression_length

                if end_index > len(sorted_candles):
                    continue

                candles_for_regression = sorted_candles[start_index:end_index]

                if len(candles_for_regression) < 2:
                    continue

                # timestamps should be in ascending order for regression
                timestamps = [c.unix_timestamp for c in reversed(candles_for_regression)]
                closes = [c.close for c in reversed(candles_for_regression)]

                slope, intercept, r_value, p_value, std_err = stats.linregress(timestamps, closes)

                timeframe_results.results[str(lookback)] = RegressionResult(slope=slope, r_value=r_value)

            if timeframe_results.results:
                all_results.append(timeframe_results)

        return all_results

