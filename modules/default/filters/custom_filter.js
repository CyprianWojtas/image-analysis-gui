import Node from "/js/editor/Node.js";
import { createNodeTree, createElement } from "/js/Utils.js";

export default
class CustomFilterNode extends Node
{
	renderContents()
	{
		if (!this.attributes.sizeX)
			this.attributes.sizeX = 3;
		if (!this.attributes.sizeY)
			this.attributes.sizeY = 3;
		if (!this.attributes.kernel)
			this.attributes.kernel = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];

		// Kernel size inputs
		const inputSizeX = createElement(
			"input",
			{
				type: "number",
				min: "1",
				value: this.attributes.sizeX,
				style: "width: 3rem; text-align: center"
			},
			{
				blur: e =>
				{
					this.updateKernelSize(inputSizeX.valueAsNumber, inputSizeY.valueAsNumber);
					this.sendUpdate();
				},
				mousedown: e => e.stopPropagation(),
				wheel: e =>
				{
					if (inputSizeX == document.activeElement)
						e.stopPropagation();
				}
			}
		);

		const inputSizeY = createElement(
			"input",
			{
				type: "number",
				min: "1",
				value: this.attributes.sizeY,
				style: "width: 3rem; text-align: center"
			},
			{
				blur: e =>
				{
					this.updateKernelSize(inputSizeX.valueAsNumber, inputSizeY.valueAsNumber);
					this.sendUpdate();
				},
				mousedown: e => e.stopPropagation(),
				wheel: e =>
				{
					if (inputSizeY == document.activeElement)
						e.stopPropagation();
				}
			}
		);

		this.kernelTable = createElement(
			"div",
			{
				style: `grid-column: 1 / 3; display: grid; grid-template-columns: repeat(${ this.attributes.sizeX }, 1fr);gap: 0.25rem;`
			}
		);
		this.kernelBox = createNodeTree(
			{
				name: "div",
				style: "display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; min-width: 6.5rem; justify-items: center;",
				childNodes:
				[
					inputSizeX,
					inputSizeY,
					this.kernelTable
				]
			}
		);

		this.nodeContents.style.gridTemplateColumns = "repeat(3, auto)";

		this.nodeContents.append(
			this.inputsContainer,
			this.kernelBox,
			this.outputsContainer
		);

		this.updateKernelSize(this.attributes.sizeX, this.attributes.sizeY);

		this.addInput ("image_in",  "image", "Image", "");
		this.addOutput("image_out", "image", "Image", "");
	}

	updateKernelSize(sizeX, sizeY)
	{
		this.attributes.kernel = this.shiftKernel(
			sizeX,
			sizeY
		);

		this.attributes.sizeX = sizeX;
		this.attributes.sizeY = sizeY;
		this.kernelTable.innerHTML = "";
		this.kernelTable.style.gridTemplateColumns = `repeat(${ sizeX }, 1fr)`;
		this.kernelBox.style.width = `${ sizeX * 2.25 - 0.25 }rem`;

		const middleCellX = Math.floor(sizeX / 2);
		const middleCellY = Math.floor(sizeY / 2);

		for (let iY = 0; iY < sizeY; iY++)
		{
			for (let iX = 0; iX < sizeX; iX++)
			{
				const inputEl = createElement(
					"input",
					{
						type: "number",
						value: this.attributes.kernel[iY][iX],
						style: "width: 2rem; text-align: center;padding: 0.25rem;font-size: 0.75rem;"
					},
					{
						blur: () =>
						{
							if (isNaN(inputEl.valueAsNumber))
								inputEl.value = 0;

							this.attributes.kernel[iY][iX] = inputEl.valueAsNumber;
							this.sendUpdate();
						},
						mousedown: e => e.stopPropagation(),
						wheel: e =>
						{
							if (inputEl == document.activeElement)
								e.stopPropagation();
						}
					}
				);

				if (iX == middleCellX && iY == middleCellY)
					inputEl.style.backgroundImage = "linear-gradient(#00f2, #00f2)";
				this.kernelTable.append(inputEl);
			}
		}

		this.updateHandlePositions();
	}

	shiftKernel(sizeX, sizeY)
	{
		const shiftX = Math.floor(this.attributes.kernel[0].length / 2) - Math.floor(sizeX / 2);
		const shiftY = Math.floor(this.attributes.kernel.length    / 2) - Math.floor(sizeY / 2);

		console.log(shiftX, shiftY, sizeX, sizeY);
		const newKernel = [];

		for (let iY = 0; iY < sizeY; iY++)
		{
			newKernel[iY] = [];

			for (let iX = 0; iX < sizeX; iX++)
			{
				newKernel[iY][iX] = this.attributes.kernel?.[iY + shiftY]?.[iX + shiftX] || 0;
			}
		}

		return newKernel;
	}
}