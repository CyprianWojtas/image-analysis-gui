---
name: Read HTTP Image
id: default.http.read
group: default.http

inputs:
  file_name:
    type: string
    name: URL
    description: URL address of the image

outputs:
  file:
    type: image
    name: Image
    description: Opened Image

---

!description

Reads an image from the given URL

!wiki

Reads an image from the given URL
