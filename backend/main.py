from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import os
from parser import parse_pdf, extract_topics_from_text
from scheduler import generate_schedule
from chatbot import get_chatbot_response
from models import StudyPlanResponse, Topic, StudyPlanRequest # Assuming we might need request model for chat
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    schedule: list = []

app = FastAPI(title="Smart Syllabus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Syllabus API"}

@app.post("/upload", response_model=StudyPlanResponse)
async def upload_syllabus(
    file: UploadFile = File(...),
    available_hours: int = Form(10) # default 10 hours if not provided
):
    try:
        # Save file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse text based on extension
        text = ""
        if file.filename.lower().endswith(".pdf"):
            text = parse_pdf(temp_file_path)
        elif file.filename.lower().endswith(".txt"):
            with open(temp_file_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
            
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        # Extract topics
        topics_data = extract_topics_from_text(text)
        
        if not topics_data:
            return StudyPlanResponse(schedule=[])
            
        topics = [Topic(**t) for t in topics_data]
        
        # Generate schedule
        schedule = generate_schedule(topics, available_hours)
        
        return StudyPlanResponse(schedule=schedule)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_syllabus(request: ChatRequest):
    response = get_chatbot_response(request.message, request.schedule)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
