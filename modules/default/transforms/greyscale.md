---
name: Greyscale
id: defaults.transforms.greyscale
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

!description

Converts image to greyscale

!wiki

The Convert to Greyscale function transforms colour images, represented in RGB (Red, Green, Blue) colour space, into grayscale images, where pixel intensities represent shades of gray corresponding to luminance levels. This functionality simplifies image analysis tasks by reducing colour complexity while preserving essential image details and structures.

## Parameters

- **Image**: The input colour image to be converted to grayscale representation.

## Conclusion

The Convert to Greyscale function offers users a convenient tool for transforming colour images into grayscale representations within the Image Analysis Tool's interface. By simplifying image complexity while preserving essential details, grayscale images enhance the efficiency and effectiveness of image analysis, processing, and visualization tasks, empowering users to extract meaningful insights and information from image data with ease.