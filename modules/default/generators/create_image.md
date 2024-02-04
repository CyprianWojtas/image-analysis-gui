---
name: Create Image
id: default.generators.image_create
group: default.generators

inputs:
  width:
    type: number
    name: Width
    description: Image width
  height:
    type: number
    name: Height
    description: Image height
  channel_r:
    type: number
    name: Colour Red
    description: Red value of the fill colour
    optional: true
  channel_g:
    type: number
    name: Colour Green
    description: Green value of the fill colour
    optional: true
  channel_b:
    type: number
    name: Colour Blue
    description: Blue value of the fill colour
    optional: true

outputs:
  file:
    type: image
    name: Image
    description: Created Image

---

!description

Creates an image from given parametres

!wiki

Creates an image from given parametres
