from pydantic import BaseModel
from typing import List

class Topic(BaseModel):
    name: str
    complexity: int  # 1 to 5, where 5 is hardest

class Syllabus(BaseModel):
    topics: List[Topic]

class StudyPlanRequest(BaseModel):
    available_hours: int
    syllabus_text: str

class StudyPlanResponse(BaseModel):
    schedule: List[dict] # Will contain formatted schedule
