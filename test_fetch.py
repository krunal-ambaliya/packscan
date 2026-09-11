import requests
import json

url = "http://localhost:8001/api/v1/scan/e6be33f6-227b-4d27-9f9c-702a188c03c6"

response = requests.get(url)
try:
    print(json.dumps(response.json(), indent=2))
except:
    print(response.text)
