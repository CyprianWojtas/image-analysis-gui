---
name: The Biggest Object
id: default.analysis.max_object
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

Finds the biggest object on the image and calculates it's size

!wiki

The Biggest Object Node is used to identify and retrieve the largest object present in an image along with its size. This function is valuable in scenarios where understanding the dominant or most significant object within the visual data is essential for analysis, segmentation, or feature extraction purposes.

## Applications

- **Object Recognition and Segmentation**: Identifying and isolating the largest object aids in segmentation and recognition tasks.
- **Scene Understanding**: Determining the most prominent element within an image contributes to understanding the overall scene.
- **Quality Control**: Assessing the size of objects in manufacturing processes or industrial inspections.
