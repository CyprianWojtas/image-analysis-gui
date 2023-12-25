import cv2
import requests
import numpy as np
import io


def run(inputs, attributes):
	response = requests.get(inputs['file_name'])
	
	if response.status_code == 200:
		image_content = io.BytesIO(response.content)
		image = cv2.imdecode(np.frombuffer(image_content.read(), np.uint8), 1)
		return {'file': image}

	return {}
