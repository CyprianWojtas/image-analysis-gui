import base64
import cv2
import numpy as np


def run(inputs, attributes):
	if 'image' not in inputs:
		raise RuntimeError('No input image')

	img_encode = cv2.imencode('.png', inputs['image'])[1] 
	data_encode = np.array(img_encode)
	byte_encode = 'data:image/png;base64,' + base64.b64encode(data_encode.tobytes()).decode("utf-8")

	return { 'image_out': inputs['image'] }, {'image': byte_encode}
