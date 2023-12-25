import base64
import cv2
import numpy as np


def run(inputs, attributes):
	img_encode = cv2.imencode('.png', inputs['image'])[1] 
	data_encode = np.array(img_encode)
	byte_encode = 'data:image/png;base64,' + base64.b64encode(data_encode.tobytes()).decode("utf-8")

	return {}, {'image': byte_encode}
