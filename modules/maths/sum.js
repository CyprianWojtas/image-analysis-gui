import Node from "/js/editor/Node.js";
import { createNodeTree, createElement } from "/js/Utils.js";

export default
class IntInputNode extends Node
{
	renderContents()
	{
		if (!this.attributes.numberCount)
			this.attributes.numberCount = 2;

		this.plusMinusButtons = createNodeTree(
			{
				name: "div",
				attributes: { style: "grid-column: 1 / -1; display: flex; gap: 0.25rem; margin-top: 0.5rem;" },
				childNodes:
				[
					{
						name: "button",
						attributes: { class: "btn-circled" },
						childNodes: [ { name: "i", attributes: { class: "icon-plus" } } ],
						listeners:
						{
							click: () =>
							{
								this.attributes.numberCount++;
								this.updateInputs();
							}
						}
					},
					{
						name: "button",
						attributes: { class: "btn-circled" },
						childNodes: [ { name: "i", attributes: { class: "icon-minus" } } ],
						listeners:
						{
							click: () =>
							{
								if (this.attributes.numberCount > 2)
									this.attributes.numberCount--;
								this.updateInputs();
							}
						}
					}
				]
			}
		);

		this.nodeContents.append(
			this.inputsContainer,
			this.outputsContainer,
			this.plusMinusButtons
		);

		this.addOutput("sum", "int", "Sum", "");

		this.updateInputs();
	}

	updateInputs()
	{
		const desiredInputs = this.attributes.numberCount || 2;
		let currentInputs = Object.keys(this.inputs).length;

		while (desiredInputs > currentInputs)
		{
			currentInputs++;
			this.addInput(`number${ currentInputs }`, "int", `Number ${ currentInputs }`, "");
			this.customInputs.push(`number${ currentInputs }`);
		}

		while (desiredInputs < currentInputs)
		{
			this.removeInput(`number${ currentInputs }`);
			this.customInputs.pop();
			currentInputs--;
		}

		this.updateHandlePositions();
	}
}