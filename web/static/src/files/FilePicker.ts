import { createElement, createNodeTree } from "../Utils.js";

export
class FileOpenEvent extends Event
{
	path: string;

	constructor(path: string)
	{
		super("file_open", { bubbles: true });
		this.path = path;
	}
}

export default
class FilePicker extends EventTarget
{
	element: HTMLDivElement;

	private filesListBox: HTMLDivElement;
	private titleEl: HTMLDivElement;
	private nameInput: HTMLInputElement;

	private path: string;

	constructor()
	{
		super();

		this.filesListBox = <HTMLDivElement>createElement("div", { class: "filesListBox" } );
		this.titleEl = <HTMLDivElement>createElement("div", { class: "title" } );
		this.nameInput = <HTMLInputElement>createElement("input");
		
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes: { class: "filePicker hidden" },
				childNodes:
				[
					{
						name: "div",
						attributes: { class: "files" },
						childNodes:
						[
							{
								name: "div",
								attributes: { class: "header" },
								childNodes:
								[
									this.titleEl,
									{
										name: "div",
										attributes: { class: "createBox" },
										childNodes:
										[
											this.nameInput,
											{
												name: "button",
												childNodes: [ "Create" ],
												listeners:
												{
													click: () => this.createFile()
												}
											}
										]
									}
								]
							},
							this.filesListBox
						]
					}
				]
			}
		);

		document.body.append(this.element);
	}

	open()
	{
		this.element.classList.remove("hidden");
		this.loadPath();
	}

	close()
	{
		this.element.classList.add("hidden");
	}

	async loadPath(path: string = "")
	{
		this.path = path;
		this.filesListBox.innerHTML = "";

		const resp = await (await fetch(`/api/files?path=${ path }`)).json();
		
		for (const file of resp)
		{
			this.filesListBox.append(createNodeTree(
				{
					name: "button",
					attributes: { class: "file" },
					childNodes: [ file.name ],
					listeners:
					{
						click: () =>
						{
							if (file.type == "dir")
								this.loadPath(file.path);
							else if (file.type == "file")
							{
								this.dispatchEvent(new FileOpenEvent(file.path));
								this.close();
							}
						}
					}
				}
			));
		}
	}

	async createFile()
	{
		const fileName = this.nameInput.value;
		this.nameInput.value = "";

		if (!fileName)
			return;

		const resp = await fetch(`/api/files/${ this.path }/${ fileName }`, { method: "CREATE" });

		if (resp.status == 200)
			this.loadPath(this.path);
	}
}
