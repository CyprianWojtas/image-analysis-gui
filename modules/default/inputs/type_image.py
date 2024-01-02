import cv2
import numpy as np
import base64


def run(inputs, attributes):

	if 'image' not in attributes:
		raise RuntimeError("No image selected")

	encoded_data = attributes['image'].split(',')[1]
	nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
	image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

	return {'image': image}
