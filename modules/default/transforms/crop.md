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
