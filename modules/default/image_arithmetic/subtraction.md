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

!description

Subtracts two images from eachother

!wiki

The Image Subtraction Operation is a fundamental technique in image processing that involves subtracting the pixel values of one image from another. This operation is commonly used to highlight the differences or changes between two images, revealing unique features or emphasizing specific details.

## How it Works

The subtraction of two images is performed on a pixel-by-pixel basis. For each corresponding pixel in the two images, the intensity value of the pixel in the second image is subtracted from the intensity value of the pixel in the first image. The result is a new image that emphasizes areas where the two original images differ.

\\[ \text{{Resulting Pixel Value}} = \text{{Pixel Value in Image 1}} - \text{{Pixel Value in Image 2}} \\]

It's important to note that the subtraction may result in negative values, and depending on the implementation, these negative values might be clamped or processed accordingly.

## Usage

Image Subtraction is utilized in various applications, such as motion detection, background removal, and change detection. In programming and image processing tools, users can apply image subtraction through dedicated functions or algorithms.


## Applications

- **Motion Detection:** Highlighting areas where motion has occurred between two consecutive frames.
- **Change Detection:** Identifying differences between images taken at different times or under different conditions.
- **Object Segmentation:** Isolating specific objects or regions of interest.

The Image Subtraction Operation is a valuable tool in image analysis, providing insights into dynamic changes within a scene and assisting in various computer vision tasks.
