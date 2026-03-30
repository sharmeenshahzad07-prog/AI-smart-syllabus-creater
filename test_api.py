import requests
import json

url = 'http://localhost:8000/upload'
file_path = 'sample_syllabus.txt'

try:
    with open(file_path, 'rb') as f:
        files = {'file': (file_path, f, 'text/plain')}
        data = {'available_hours': '20'}
        response = requests.post(url, files=files, data=data)
        
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
