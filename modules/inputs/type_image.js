import Node from "/js/editor/Node.js";
import { createNodeTree, createElement, stopLMBPropagation } from "/js/Utils.js";

export default
class ImageInputNode extends Node
{
	renderContents()
	{
		this.imageEl = createElement("img",
			{
				style: `width: 128px; height: 128px; border: 1px solid #fff2; background: #fff1; object-fit: contain; vertical-align: top;`,
				draggable: "false",
				src: this.attributes.image || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
				alt: ""
			}
		);

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
									this.sendUpdate();
								});
								reader.readAsDataURL(e.target.files[0]);
							}
						}
					},
					this.imageEl,
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
	}

	onProcessed(data)
	{
		this.imageEl.src = this.attributes.image;
	}

	onOutdated()
	{
		this.imageEl.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
	}
}
