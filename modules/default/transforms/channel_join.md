---
name: Channel Join
id: defaults.transforms.channel_join
group: defaults.transforms

inputs:
  image_r:
    type: image
    name: Red
  image_g:
    type: image
    name: Green
  image_b:
    type: image
    name: Blue

outputs:
  image_out:
    type: image
    name: Image out

---

!description

Joins RGB channels into an image

!wiki

The Channel Join Filter is an image processing technique that involves combining individual color channels to reconstruct a full-color image. In typical RGB (Red, Green, Blue) color representation, an image is composed of three separate channels, each representing the intensity of one of these primary colors. Channel joining allows for the synthesis of these channels to recreate the original color image.

## How it Works

For an RGB image, the three color channels (Red, Green, and Blue) are combined to form a single color image. Each pixel in the resulting image is defined by the intensities of the corresponding pixels in the three color channels. This process reconstructs the full spectrum of colors present in the original image.

## Usage

In image editing software or programming libraries, the Channel Join Filter is typically accessible through specific functions or methods. After performing individual channel operations, users can recombine the channels to restore the original color image.

## Applications

- **Selective Editing:** After performing operations on individual channels, recombine them to see the overall impact on the image.
- **Image Restoration:** Joining channels is useful in scenarios where channels have been processed independently and need to be reassembled.
- **Color Grading:** Fine-tune the color balance by adjusting individual color channels and then joining them back together.

The Channel Join Filter is an essential tool for working with color channels in image processing workflows. It provides flexibility in manipulating and restoring the color information within an image.
