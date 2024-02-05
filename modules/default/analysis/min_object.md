---
name: The Smallest Object
id: default.analysis.min_object
group: default.analysis

inputs:
  image:
    type: image
    name: Image

outputs:
  size:
    type: number
    name: Object Size
  object_image:
    type: image
    name: The Object

---

!description

Counts objects on the image

!wiki

!description

Finds the smallest object on the image and calculates it's size

!wiki

The Smallest Object Node is used to identify and retrieve the smallest object present in an image along with its size.
