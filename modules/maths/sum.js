import Node from "/js/editor/Node.js";
import { createNodeTree, createElement } from "/js/Utils.js";

export default
class IntInputNode extends Node
{
	renderContents()
	{
		this.sumCountInput = createNodeTree(
			{
				name: "input",
				attributes: { type: "number", style: "width: 6rem; grid-column: 1 / -1;", value: this.attributes.numberCount || 2 },
				listeners:
				{
					input: e =>
					{
						this.attributes.numberCount = e.target.valueAsNumber;
						this.updateInputs();
					},
					blur: e =>
					{
						this.attributes.numberCount = e.target.valueAsNumber;
						this.updateInputs();
						this.sendUpdate();
					},
					mousedown: e => e.stopPropagation()
				}
			}
		);

		this.nodeContents.append(
			this.sumCountInput,
			this.inputsContainer,
			this.outputsContainer
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