---
name: Image Size
id: default.analysis.img_size
group: default.analysis

inputs:
  image:
    type: image
    name: Image

outputs:
  width:
    type: number
    name: Width
  height:
    type: number
    name: Height

---

!description

Gets the size of an image

!wiki

# Image Size Function

The Image Size Function is a utility in image processing that provides information about the dimensions of an image. It returns the width and height of the image, allowing users to understand the spatial resolution and aspect ratio of the visual data they are working with. This function is fundamental in various image processing tasks, including resizing, cropping, and aspect ratio preservation.

## How it Works

The Image Size Function retrieves the dimensions of an image by querying its width and height attributes. These attributes represent the number of pixels along the horizontal and vertical axes of the image, respectively.

## Applications

- **Resizing and Cropping**: Understanding the current size of the image aids in determining appropriate dimensions for resizing or cropping operations.
- **Aspect Ratio Preservation**: Ensuring that the aspect ratio remains unchanged during resizing or transformation processes.
- **Image Metadata**: Providing descriptive information about the image, which can be used for documentation or analysis purposes.

The Image Size Function is a foundational tool in image processing workflows, enabling users to gain insights into the spatial characteristics of images and make informed decisions about subsequent processing steps.
