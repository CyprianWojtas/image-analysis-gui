---
name: Average Brightness
id: default.analysis.avg_brightness
group: default.analysis

inputs:
  image:
    type: image
    name: Image

outputs:
  value:
    type: number
    name: Brightness

---

!description

Calculates average brightness of the image

!wiki

Calculating the average brightness of an image is a useful operation in image processing that provides a quantitative measure of the overall luminance. This metric is valuable for assessing the overall illumination of an image and can be utilised in various applications, such as exposure analysis, quality control, and image enhancement.

## How it Works

The average brightness is determined by calculating the mean intensity value of all pixels in the image. For grayscale images, this involves summing up the intensity values of all pixels and dividing by the total number of pixels. For color images, the brightness may be computed in different color spaces, such as converting to grayscale or considering luminance values.

## Applications

- **Exposure Analysis:** Assessing the overall brightness level of images in photography.
- **Quality Control:** Verifying the brightness consistency in a set of images.
- **Image Enhancement:** Using average brightness as a reference for adjusting contrast and exposure.

The average brightness of an image serves as a fundamental metric in image analysis and processing, offering insights into the global illumination characteristics of the visual content.
