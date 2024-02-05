---
name: Channel Split
id: defaults.transforms.channel_split
group: defaults.transforms

inputs:
  image_in:
    type: image
    name: Image in

outputs:
  image_r:
    type: image
    name: Red
  image_g:
    type: image
    name: Green
  image_b:
    type: image
    name: Blue

---

!description

Splits image into it's RGB channels

!wiki

# Channel Split Filter

The Channel Split Filter is an image processing technique that involves separating a color image into its individual color channels. In typical RGB (Red, Green, Blue) color representation, an image is composed of three channels, each representing the intensity of one of these primary colors. Channel splitting allows for the isolation and independent manipulation of these color components.

## How it Works

For an RGB image, the three color channels (Red, Green, and Blue) are extracted, resulting in three grayscale images. Each channel represents the contribution of a specific color to the overall image. By isolating these channels, it becomes possible to analyze and modify the image's color composition independently.

## Usage

In image editing software or programming libraries, the Channel Split Filter is often accessible through specific functions or methods. After splitting the channels, users can apply various operations or enhancements to individual color components.

## Applications

- **Color Analysis:** Studying the contribution of each color channel to the overall image.
- **Selective Editing:** Applying adjustments or enhancements to specific color components.
- **Feature Extraction:** Isolating specific color information for further analysis.

The Channel Split Filter is a valuable tool in understanding and manipulating the color composition of an image. It provides a foundation for various color-based image processing tasks and creative endeavors in digital media.
