# FloodWay Backend - FastAPI Server for Flood Prediction
# This server exposes the trained ANN model (flood_detector.h5) as an API

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import Optional
import os

# Lazy load TensorFlow to avoid import issues
model = None
scaler_mean = None
scaler_std = None

def load_model():
    """Load the trained model and scaler parameters"""
    global model, scaler_mean, scaler_std
    
    if model is None:
        try:
            from tensorflow import keras
            # Load the trained model
            model_path = os.path.join(os.path.dirname(__file__), '..', 'flood_detector.h5')
            model = keras.models.load_model(model_path)
            print(f"Model loaded successfully from {model_path}")
            
            # Scaler parameters from the notebook training (StandardScaler mean and std)
            # These are the mean and variance values from the training data
            scaler_mean = np.array([
                234.46855795,  # JAN
                143.84,        # FEB
                189.6490027,   # MAR
                194.10075472,  # APR
                185.84382749,  # MAY
                184.12814016,  # JUN
                200.09545822,  # JUL
                203.83150943,  # AUG
                228.91012129,  # SEP
                303.68787062,  # OCT
                317.4056469,   # NOV
                320.23351752,  # DEC
                2706.19455526  # ANNUAL RAINFALL
            ])
            
            scaler_var = np.array([
                31655.47755655,
                14301.39292264,
                7094.54185426,
                7022.60326089,
                5334.57776298,
                6756.81594128,
                5615.73950107,
                4269.5507298,
                6124.67849985,
                11934.4639297,
                16191.53928307,
                23194.28061121,
                318824.90069192
            ])
            scaler_std = np.sqrt(scaler_var)
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e

# Initialize FastAPI app
app = FastAPI(
    title="FloodWay API",
    description="AI-powered flood prediction API using ANN model trained on Malaysian flood data",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class RainfallData(BaseModel):
    """Monthly rainfall data in mm"""
    JAN: float
    FEB: float
    MAR: float
    APR: float
    MAY: float
    JUN: float
    JUL: float
    AUG: float
    SEP: float
    OCT: float
    NOV: float
    DEC: float
    ANNUAL_RAINFALL: Optional[float] = None  # Will be calculated if not provided

class PredictionResponse(BaseModel):
    """Flood prediction response"""
    flood_probability: float  # 0-1 probability
    flood_predicted: bool     # True if flood is predicted
    risk_level: str           # 'safe', 'warning', 'danger'
    confidence: float         # Model confidence
    input_data: dict          # Echo back the input for verification

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    version: str

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        print(f"Warning: Could not load model on startup: {e}")

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to FloodWay API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_flood(data: RainfallData):
    """
    Predict flood probability based on monthly rainfall data.
    
    The model expects 13 features:
    - JAN through DEC: Monthly rainfall in mm
    - ANNUAL_RAINFALL: Total annual rainfall in mm
    """
    try:
        # Ensure model is loaded
        if model is None:
            load_model()
        
        # Calculate annual rainfall if not provided
        annual = data.ANNUAL_RAINFALL
        if annual is None:
            annual = (data.JAN + data.FEB + data.MAR + data.APR + 
                     data.MAY + data.JUN + data.JUL + data.AUG + 
                     data.SEP + data.OCT + data.NOV + data.DEC)
        
        # Prepare input array in the correct order
        input_array = np.array([[
            data.JAN, data.FEB, data.MAR, data.APR,
            data.MAY, data.JUN, data.JUL, data.AUG,
            data.SEP, data.OCT, data.NOV, data.DEC,
            annual
        ]])
        
        # Standardize the input using the training scaler parameters
        input_scaled = (input_array - scaler_mean) / scaler_std
        
        # Make prediction
        prediction = model.predict(input_scaled, verbose=0)[0][0]
        
        # Determine risk level
        if prediction >= 0.7:
            risk_level = 'danger'
        elif prediction >= 0.4:
            risk_level = 'warning'
        else:
            risk_level = 'safe'
        
        return {
            "flood_probability": float(prediction),
            "flood_predicted": bool(prediction >= 0.5),
            "risk_level": risk_level,
            "confidence": float(abs(prediction - 0.5) * 2),  # 0-1 confidence
            "input_data": {
                "monthly_rainfall": {
                    "JAN": data.JAN, "FEB": data.FEB, "MAR": data.MAR,
                    "APR": data.APR, "MAY": data.MAY, "JUN": data.JUN,
                    "JUL": data.JUL, "AUG": data.AUG, "SEP": data.SEP,
                    "OCT": data.OCT, "NOV": data.NOV, "DEC": data.DEC
                },
                "annual_rainfall": annual
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-simple")
async def predict_simple(
    jan: float = 200, feb: float = 150, mar: float = 180,
    apr: float = 200, may: float = 180, jun: float = 150,
    jul: float = 180, aug: float = 200, sep: float = 220,
    oct: float = 300, nov: float = 320, dec: float = 300
):
    """
    Simplified prediction endpoint with default values.
    Useful for quick testing.
    """
    data = RainfallData(
        JAN=jan, FEB=feb, MAR=mar, APR=apr,
        MAY=may, JUN=jun, JUL=jul, AUG=aug,
        SEP=sep, OCT=oct, NOV=nov, DEC=dec
    )
    return await predict_flood(data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
