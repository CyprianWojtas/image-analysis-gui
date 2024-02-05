---
name: Scale
id: defaults.transforms.scale
group: defaults.transforms

inputs:
  image:
    type: image
    name: Image
  width:
    type: number
    name: Width
  height:
    type: number
    name: Height

outputs:
  image_out:
    type: image
    name: Image

---

!description

Scales the image

!wiki

The Scale node resizes images by specifying new dimensions of the image. This functionality is essential for adjusting the size of images for various processing, and storage requirements.

## Considerations

- **Image Quality**: Resizing images may impact image quality, especially when scaling images up or down significantly. Users should consider the trade-offs between image size, processing time, and image quality when resizing images.

## Conclusion

The Scale function provides users with a flexible tool for resizing images within the Image Analysis Tool's interface. By adjusting image dimensions proportionally or explicitly defining new dimensions, users can customize image sizes to meet specific display, processing, and storage requirements, enabling efficient image manipulation and optimization for various applications and use cases.