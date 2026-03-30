import pdfplumber
import re

# Simple dictionary-based complexity scoring
COMPLEXITY_DICT = {
    "binary search tree": 5,
    "avl tree": 5,
    "tree": 5,
    "graph": 5,
    "dynamic programming": 5,
    "recursion": 4,
    "sorting": 4,
    "linked list": 3,
    "pointer": 4,
    "array": 1,
    "loop": 1,
    "variable": 1,
    "function": 2,
    "class": 3,
    "object": 3
}

def analyze_complexity(topic_name: str) -> int:
    name_lower = topic_name.lower()
    for key, score in COMPLEXITY_DICT.items():
        if key in name_lower:
            return score
    return 2 # Default medium-low complexity

def extract_topics_from_text(text: str) -> list:
    # Noise phrases to ignore
    NOISE_PHRASES = [
        "dear student", "this is to inform", "following topics", 
        "final syllabus", "course content", "learning objectives",
        "please note", "important instructions", "examination",
        "sincerely", "good luck", "the faculty", "best regards",
        "hope you are doing well"
    ]
    
    lines = text.split('\n')
    topics = []
    for line in lines:
        cleaned = re.sub(r'^[0-9\.\-\*]+', '', line).strip()
        
        # Filtering logic:
        # 1. Basic length check
        if 3 < len(cleaned) < 120:
            lower_cleaned = cleaned.lower()
            
            # 2. Noise phrase check
            if any(noise in lower_cleaned for noise in NOISE_PHRASES):
                continue
                
            # 3. Punctuation check (avoid full sentences/closings)
            if cleaned.endswith(('!', ',', '?', ':', ';')):
                continue
            
            # 4. Keyword/Complexity Check
            complexity = analyze_complexity(cleaned)
            
            # If it's a known topic (complexity > 2), we keep it even if short
            if complexity > 2:
                topics.append({"name": cleaned, "complexity": complexity})
            else:
                # For unknown topics, check word count and length more strictly
                words = cleaned.split()
                if 2 <= len(words) < 10:
                    topics.append({"name": cleaned, "complexity": complexity})
                    
    return topics

def parse_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extract = page.extract_text()
            if extract:
                text += extract + "\n"
    return text
