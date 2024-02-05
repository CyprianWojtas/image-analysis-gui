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

The Image Reading from URL function enables users to retrieve images hosted on remote servers or websites by providing the URL of the image resource. This functionality streamlines the image loading process and allows users to access a diverse range of image sources for analysis and processing.

## Parameters

- **Image URL**: The URL pointing to the location of the image to be retrieved and loaded. Users provide the complete URL address where the image is hosted.

## Considerations

- **URL Validity**: Users should ensure that the provided URL is valid and points to the location of the desired image resource.
- **Network Connectivity**: The Image Reading from URL function requires an active internet connection to retrieve image data from remote servers or websites.
