---
name: Subtract Images
id: defaults.image_arithmetics.subtract
group: defaults.image_arithmetics

inputs:
  image_in:
    type: image
    name: Image 1
  subtracted_image:
    type: image
    name: Image 2

outputs:
  image_out:
    type: image
    name: Out Image

---

!wiki

The Image Subtraction Operation is a fundamental technique in image processing that involves subtracting the pixel values of one image from another. This operation is commonly used to highlight the differences or changes between two images, revealing unique features or emphasizing specific details.

## How it Works

The subtraction of two images is performed on a pixel-by-pixel basis. For each corresponding pixel in the two images, the intensity value of the pixel in the second image is subtracted from the intensity value of the pixel in the first image. The result is a new image that emphasizes areas where the two original images differ.

\\[ \text{{Resulting Pixel Value}} = \text{{Pixel Value in Image 1}} - \text{{Pixel Value in Image 2}} \\]

It's important to note that the subtraction may result in negative values, and depending on the implementation, these negative values might be clamped or processed accordingly.

## Usage

Image Subtraction is utilized in various applications, such as motion detection, background removal, and change detection. In programming and image processing tools, users can apply image subtraction through dedicated functions or algorithms.

```python
# Example usage in Python with OpenCV
import cv2
import numpy as np

# Load two images
image1 = cv2.imread('image1.jpg')
image2 = cv2.imread('image2.jpg')

# Ensure both images have the same dimensions
image2 = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

# Perform Image Subtraction
result_image = cv2.subtract(image1, image2)

# Display the original images and the result
cv2.imshow('Image 1', image1)
cv2.imshow('Image 2', image2)
cv2.imshow('Result Image', result_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

## Applications

- **Motion Detection:** Highlighting areas where motion has occurred between two consecutive frames.
- **Change Detection:** Identifying differences between images taken at different times or under different conditions.
- **Object Segmentation:** Isolating specific objects or regions of interest.

The Image Subtraction Operation is a valuable tool in image analysis, providing insights into dynamic changes within a scene and assisting in various computer vision tasks.
