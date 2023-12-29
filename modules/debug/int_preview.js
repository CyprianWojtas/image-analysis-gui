import Node from "/js/editor/Node.js";
import { createElement } from "/js/Utils.js";

export default
class ImagePreviewNode extends Node
{
	renderContents()
	{
		this.inputEl = createElement("input",
			{
				type: "number",
				readonly: "true",
				style: "outline: none; background: transparent; text-align: center;"
			}
		);

		this.nodeContents.style.gridTemplateColumns = "repeat(3, auto)";
		this.nodeContents.style.gap = "0";

		this.nodeContents.append(
			this.inputsContainer,
			this.inputEl,
			this.outputsContainer
		);

		this.addInput("value", "number", " ", "");
		this.addOutput("value_out", "number", " ", "");
	}

	onProcessed(data)
	{
		this.inputEl.value = data.value;
	}

	onOutdated()
	{
		this.inputEl.value = "";
	}
}