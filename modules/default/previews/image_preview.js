import Node from "/js/editor/Node.js";
import { createElement } from "/js/Utils.js";

export default
class ImagePreviewNode extends Node
{
	renderContents()
	{
		this.imageEl = createElement("img",
			{
				style: `width: ${ this.attributes.width || 256 }px; height: ${ this.attributes.height || 256 }px;border: 1px solid #fff2;background: #fff1;object-fit: contain;vertical-align: top;`,
				draggable: "false",
				src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
				alt: ""
			}
		);

		this.nodeContents.style.gridTemplateColumns = "repeat(3, auto)";
		this.nodeContents.style.gap = "0";

		this.nodeContents.append(
			this.inputsContainer,
			this.imageEl,
			this.outputsContainer
		);

		this.addInput("image", "image", " ", "");
		this.addOutput("image_out", "image", " ", "");
	}

	onProcessed(data)
	{
		this.imageEl.src = data.image;
	}

	onOutdated()
	{
		this.imageEl.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
	}
}