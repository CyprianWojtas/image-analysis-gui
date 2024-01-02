import Node from "/js/editor/Node.js";
import { createNodeTree, createElement, stopLMBPropagation } from "/js/Utils.js";

export default
class ImageInputNode extends Node
{
	renderContents()
	{
		this.canvasEl = createElement("canvas",
			{
				style: `width: 128px; height: 128px; border: 1px solid #fff2; background: #fff1; object-fit: contain; vertical-align: top;`,
				width: "256",
				height: "256",
				draggable: "false"
			}
		);
		this.canvasCtx = this.canvasEl.getContext("2d");

		this.valueInput = createNodeTree(
			{
				name: "label",
				style: "cursor: pointer",
				listeners:
				{
					mousedown: e => stopLMBPropagation(e)
				},
				childNodes:
				[
					{
						name: "input",
						type: "file",
						accept: ".jpg, .jpeg, .png, .bmp",
						style: "display: none",
						listeners:
						{
							input: e =>
							{
								const reader = new FileReader();
								reader.addEventListener("load", event =>
								{
									this.attributes.image = event.target.result;
									this.showImageOnCanvas(this.attributes.image);
									this.sendUpdate();
								});
								reader.readAsDataURL(e.target.files[0]);
							}
						}
					},
					this.canvasEl,
					{
						name: "div",
						class: "btn",
						style: "margin-top: 0.5rem",
						childNodes:
						[
							"Choose File"
						]
					}
				]
			}
		);

		this.nodeContents.style.gridTemplateColumns = "auto";

		this.nodeContents.append(
			this.outputsContainer
		);

		this.addOutput("image", "image", this.valueInput, "");
		this.showImageOnCanvas(this.attributes.image);
	}

	showImageOnCanvas(imgData)
	{
		if (!imgData)
			return;

		const img = createElement("img", { src: imgData });

		img.addEventListener("load", () =>
		{
			this.canvasCtx.clearRect(0, 0, 256, 256);
			this.canvasCtx.drawImage(
				img,
				img.width > img.height ? 0 : 128 * (1 - img.width / img.height),
				img.width < img.height ? 0 : 128 * (1 - img.height / img.width),
				img.width > img.height ? 256 : 256 * img.width / img.height,
				img.width < img.height ? 256 : 256 * img.height / img.width
			);
			img.remove();
		});
	}

	onOutdated()
	{
		this.canvasEl.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
	}
}
