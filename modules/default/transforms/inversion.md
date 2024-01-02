---
name: Inversion Filter
id: defaults.transforms.inversion
group: defaults.transforms

inputs:
  image_in:
    type: image
    name: Image

outputs:
  image_out:
    type: image
    name: Image

---

!wiki

The Inversion Filter is a simple yet powerful image processing technique that involves the transformation of pixel intensities to their complementary values. In other words, dark pixels become light, and light pixels become dark. This filter is often employed to create artistic effects, highlight certain features in an image, or as a basic step in image preprocessing.

## How it Works

The inversion process is achieved by subtracting each pixel intensity value from the maximum possible intensity value. For example, in an 8-bit image (where pixel intensities range from 0 to 255), the inversion can be expressed as:

\\[ \text{{Inverted Pixel Value}} = \text{{Max Intensity Value}} - \text{{Original Pixel Value}} \\]

## Usage

Inversion filters are straightforward to apply and can be found in most image editing software or programming libraries. Users can apply this filter to images to quickly transform their appearance and experiment with the visual impact.

```python
# Example usage in Python with OpenCV
import cv2
import numpy as np

# Load an image
image = cv2.imread('input_image.jpg')

# Apply Inversion
inverted_image = 255 - image

# Display the original and inverted images
cv2.imshow('Original Image', image)
cv2.imshow('Inverted Image', inverted_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
```

## Applications

- **Artistic Rendering:** Creating visually striking and abstract representations of images.
- **Feature Enhancement:** Emphasizing specific details or patterns in an image.
- **Image Preprocessing:** Inversion can be a useful step in preparing images for further analysis or computer vision tasks.

The Inversion Filter is a quick and effective way to transform the appearance of images, providing a versatile tool for both creative and practical applications in the realm of image processing.
