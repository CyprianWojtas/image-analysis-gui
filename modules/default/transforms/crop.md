---
name: Crop
id: defaults.transforms.crop
group: defaults.transforms

inputs:
  image_in:
    type: image
    name: Image
  width:
    type: number
    name: Width
  height:
    type: number
    name: Height
  pos_x:
    type: number
    name: Offset X
  pos_y:
    type: number
    name: Offset Y

outputs:
  image_out:
    type: image
    name: Image

---

!description

Crops the image

!wiki

The Crop node allows users to define a rectangular region within an input image and extract the corresponding pixels to create a new cropped image. This functionality is particularly useful for isolating specific areas of interest within larger images for detailed examination or targeted processing.

## Parameters

- **Image**: The input image from which the region of interest (ROI) will be cropped.
- **ROI Coordinates**: The coordinates of the rectangular region to be cropped, typically defined as (x, y) coordinates of the top-left corner and (width, height) of the region.

## Considerations

- **ROI Dimensions**: Users should ensure that the specified dimensions of the region of interest (ROI) are within the bounds of the input image to avoid errors or unexpected behavior.

## Conclusion

The Crop function provides users with a powerful tool for selecting and extracting specific regions of interest from input images within the Image Analysis Tool's interface. By enabling focused analysis, processing, and visualization tasks, the Crop function enhances the flexibility and usability of the tool, empowering users to isolate and examine targeted areas of image data with precision and accuracy.