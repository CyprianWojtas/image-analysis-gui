import base64
import cv2
import numpy as np


def run(inputs, attributes):
	if inputs['image'] is None:
		raise RuntimeError('No input image')
	
	size = inputs['image'].shape

	if size[0] > 512 or size[1] > 512:
		width  = size[1] * 512 // size[0] if size[1] > size[0] else 512
		height = size[0] * 512 // size[1] if size[1] < size[0] else 512

		resized_image = cv2.resize(inputs['image'], (width, height), interpolation = cv2.INTER_AREA)

		img_encode = cv2.imencode('.png', resized_image)[1]
	else:
		img_encode = cv2.imencode('.png', inputs['image'])[1]

	data_encode = np.array(img_encode)
	byte_encode = 'data:image/png;base64,' + base64.b64encode(data_encode.tobytes()).decode("utf-8")

	return { 'image_out': inputs['image'] }, {'image': byte_encode}
