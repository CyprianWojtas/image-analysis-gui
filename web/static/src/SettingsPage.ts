import Settings from "./Settings.js";
import { createNodeTree } from "./Utils.js";

export default
class SettingsPage
{
	static element: HTMLDivElement;

	static init()
	{
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: "settings fullscreenPage hidden"
				},
				childNodes:
				[
					{
						name: "div",
						attributes: { class: "header" },
						childNodes:
						[
							{
								name: "h1",
								childNodes: [ "Settings" ]
							},
							{
								name: "button",
								attributes: { class: "closeButton" },
								listeners: { click: () => this.close() },
								childNodes: [ { name: "i", attributes: { class: "icon-cancel" } } ]
							}
						]
					},
					{
						name: "div",
						attributes:
						{
							class: "settingsBox"
						},
						childNodes:
						[
							{
								name: "label",
								childNodes:
								[
									"Snap to grid ",
									{
										name: "input",
										attributes: { type: "checkbox", checked: Settings.get("editor.snapToGrid") },
										listeners:
										{
											input: e => Settings.set("editor.snapToGrid", e.target.checked)
										}
									}
								]
							},
							{
								name: "div",
								childNodes:
								[
									"Editor background: ",
									{
										name: "select",
										attributes: { selected: Settings.get("editor.background") },
										listeners:
										{
											change: e => Settings.set("editor.background", e.target.value)
										},
										childNodes:
										[
											{
												name: "option",
												attributes: { value: "lines" },
												childNodes: [ "Lines" ]
											},
											{
												name: "option",
												attributes: { value: "dots" },
												childNodes: [ "Dots" ]
											},
											{
												name: "option",
												attributes: { value: "clear" },
												childNodes: [ "Clear" ]
											}
										]
									}
								]
							},
							{
								name: "div",
								childNodes:
								[
									"Connections appreance: ",
									{
										name: "select",
										attributes: { selected: Settings.get("editor.connectionStyle") },
										listeners:
										{
											change: e => Settings.set("editor.connectionStyle", e.target.value)
										},
										childNodes:
										[
											{
												name: "option",
												attributes: { value: "bezier" },
												childNodes: [ "Bezier Curves" ]
											},
											{
												name: "option",
												attributes: { value: "straight" },
												childNodes: [ "Straight Lines" ]
											},
											{
												name: "option",
												attributes: { value: "right" },
												childNodes: [ "Right Angles" ]
											}
										]
									}
								]
							}
						]
					}
				]
			}
		);

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
}
