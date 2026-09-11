import requests
import json

url = "http://localhost:8001/api/v1/scan"
files = {'image': open('images/image1.jpg', 'rb')}
data = {'product_name': 'Balaji Wafers'}

response = requests.post(url, files=files, data=data)
try:
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
