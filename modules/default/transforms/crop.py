def run(inputs, attributes):

	img_width  = inputs['image_in'].shape[1]
	img_height = inputs['image_in'].shape[0]

	pos_x  = int(inputs['pos_x'])
	pos_x2 = int(pos_x + inputs['width'])

	pos_y  = int(inputs['pos_y'])
	pos_y2 = int(pos_y + inputs['height'])

	if inputs['width'] <= 0:
		raise RuntimeError('Width cannot be smaller than 1')
	
	if inputs['height'] <= 0:
		raise RuntimeError('Height cannot be smaller than 1')

	if pos_x >= img_width - 1:
		raise RuntimeError('Offset X results in image with zero width')
	
	if pos_y >= img_height - 1:
		raise RuntimeError('Offset Y results in image with zero height')

	return {'image_out': inputs['image_in'][pos_y:pos_y2, pos_x:pos_x2]}
