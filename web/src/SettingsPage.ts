import Settings from "./Settings.js";
import { createElement, createNodeTree } from "./Utils.js";

export default
class SettingsPage
{
	static element: HTMLDivElement;
	static settingsBox: HTMLDivElement;

	static init()
	{
		this.settingsBox = <HTMLDivElement>createElement("div", { class: "settingsBox" } );

		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "settings fullscreenPage hidden",
				childNodes:
				[
					{
						name: "div",
						class: "header",
						childNodes:
						[
							{
								name: "h1",
								childNodes: [ "Settings" ]
							},
							{
								name: "button",
								class: "closeButton",
								listeners: { click: () => this.close() },
								childNodes: [ { name: "i", class: "icon-cancel" } ]
							}
						]
					},
					this.settingsBox
				]
			}
		);

		this.addToggleSetting("Snap to grid", "editor.snapToGrid");
		this.addToggleSetting("Light mode", "editor.lightMode");

		this.addSelectSetting(
			"Editor background",
			"editor.background",
			[
				[ "lines", "Lines" ],
				[ "dots", "Dots" ],
				[ "clear", "Clear" ]
			]
		);

		this.addSelectSetting(
			"Connections appreance",
			"editor.connectionStyle",
			[
				[ "bezier", "Bezier Curves" ],
				[ "straight", "Straight Lines" ],
				[ "right", "Right Angles" ]
			]
		);

		this.addToggleSetting("Show the node code", "wiki.showCode");

		document.body.append(this.element);
	}

	static open()
	{
		this.element.classList.remove("hidden");
	}

	static close()
	{
		this.element.classList.add("hidden");
	}

	static addToggleSetting(text: string, settingName: string)
	{
		const input = <HTMLInputElement>createElement(
			"input",
			{ type: "checkbox" },
			{
				change: e => Settings.set(settingName, e.target.checked)
			}
		);
		
		input.checked = Settings.get(settingName);

		const element = createNodeTree(
			{
				name: "label",
				class: "settingOption toggle",
				childNodes:
				[
					text,
					input
				]
			}
		);

		this.settingsBox.append(element);
	}

	static addSelectSetting(text: string, settingName: string, options: string[] | string[][])
	{
		const selectEl = <HTMLSelectElement>createElement("select", {}, { change: e => Settings.set(settingName, e.target.value) });

		for (const option of options)
		{
			const optionEl = createElement(
				"option",
				{
					value: typeof(option) == "string" ? option : option[0]
				}
			);

			optionEl.append(typeof(option) == "string" ? option : option[1]);
			selectEl.append(optionEl);
		}

		selectEl.value = Settings.get(settingName);

		const element = createNodeTree(
			{
				name: "label",
				class: "settingOption select",
				childNodes:
				[
					text,
					selectEl
				]
			}
		);

		this.settingsBox.append(element);
	}
}
