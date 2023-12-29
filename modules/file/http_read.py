import cv2
import requests
import numpy as np
import io


def run(inputs, attributes):

	print(inputs)

	try:
		response = requests.get(inputs['file_name'])
	except:
		raise RuntimeError(f'Connection error')
	
	if response.status_code != 200:
		raise RuntimeError(f'Response status code: {response.status_code}')
	
	image_content = io.BytesIO(response.content)
	image = cv2.imdecode(np.frombuffer(image_content.read(), np.uint8), 1)
	return {'file': image}
