---
name: Sum Images
id: defaults.image_arithmetics.sum
group: defaults.image_arithmetics

inputs:
  image_in:
    type: image
    name: Image 1
  image_in2:
    type: image
    name: Image 2

outputs:
  image_out:
    type: image
    name: Out Image

---

!description

Adds two images from together

!wiki

The Image Summation function computes the element-wise summation of pixel values across corresponding pixels in two input images. This functionality facilitates the aggregation of pixel data from multiple images, allowing users to generate composite images, perform image blending, or analyse cumulative pixel values.


## Considerations

- **Image Dimensions**: Input images should have consistent dimensions to ensure proper alignment and summation of pixel values.
- **Data Range**: Users should consider potential overflow issues when summing pixel values, especially when dealing with images of high dynamic range or when the summation operation may result in values exceeding the data type limits.
- **Normalization**: Depending on the application, users may need to normalize the summed image to ensure that pixel values are within a desired range or scale.

## Conclusion

The Image Summation function provides users with a powerful tool for computing the element-wise summation of pixel values across multiple input images. By enabling the aggregation of pixel data from diverse sources, the function enhances the analytical capabilities of the Image Analysis Tool, facilitating image blending, composite image generation, and cumulative pixel value analysis for various applications and use cases.