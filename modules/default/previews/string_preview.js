import Node from "/js/editor/Node.js";
import { createElement } from "/js/Utils.js";

export default
class StringPreviewNode extends Node
{
	renderContents()
	{
		let resized = false;
		const resizeObserver = new ResizeObserver(() =>
		{
			this.updateHandlePositions();
			this.attributes.width = this.textBox.clientWidth;
			this.attributes.height = this.textBox.clientHeight;
			resized = true;
		});

		this.textBox = createElement("textarea",
			{
				readonly: "true",
				style: `outline: none; background: transparent;width: ${ this.attributes.width || 200 }px; height: ${ this.attributes.height || 50 }px`
			},
			{
				mouseup: () =>
				{
					if (resized)
					{
						this.sendUpdate();
						resized = false;
					}
				}
			}
		);

		this.nodeContents.style.gridTemplateColumns = "repeat(3, auto)";
		this.nodeContents.style.gap = "0";

		this.nodeContents.append(
			this.inputsContainer,
			this.textBox,
			this.outputsContainer
		);

		this.textBox.innerHTML = this.attributes.value || "";

		resizeObserver.observe(this.textBox);

		this.addInput("value", "string", " ", "");
		this.addOutput("value_out", "string", " ", "");
	}

	onProcessed(data)
	{
		this.textBox.value = data.value;
	}

	onOutdated()
	{
		this.textBox.value = "";
	}
}