import Node from "/js/editor/Node.js";
import { createElement } from "/js/Utils.js";

export default
class ImagePreviewNode extends Node
{
	renderContents()
	{
		this.imageEl = createElement("img",
			{
				style: `width: ${ this.attributes.width || 256 }px; height: ${ this.attributes.height || 256 }px;border: 1px solid #fff2;background: #fff1;object-fit: contain;`,
				src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
				alt: ""
			}
		);

		this.nodeContents.append(
			this.inputsContainer,
			this.imageEl
		);

		this.addInput("image", "image", "Image", "");
	}

	onProcessed(data)
	{
		this.imageEl.src = data.image;
	}
}