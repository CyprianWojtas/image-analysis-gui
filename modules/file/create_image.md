---
name: Create Image

inputs:
  width:
    type: int
    name: Width
    description: Image width
  height:
    type: int
    name: Height
    description: Image height
  channel_r:
    type: int
    name: Colour Red
    description: Red value of the fill colour
  channel_g:
    type: int
    name: Colour Green
    description: Green value of the fill colour
  channel_b:
    type: int
    name: Colour Blue
    description: Blue value of the fill colour

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
