import { createElement, createNodeTree, unixToStr } from "../Utils.js";

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

	private dirsListBox: HTMLDivElement;
	private filesListBox: HTMLDivElement;
	private pathEl: HTMLDivElement;

	private createFileBox: HTMLDivElement;
	private nameInput: HTMLInputElement;

	private path: string;

	constructor()
	{
		super();

		this.dirsListBox = <HTMLDivElement>createElement("div", { class: "dirsListBox" } );
		this.filesListBox = <HTMLDivElement>createElement("div", { class: "filesListBox" } );
		this.pathEl = <HTMLDivElement>createElement("div", { class: "path" } );
		this.nameInput = <HTMLInputElement>createElement("input", { placeholder: "New file name" });
		this.createFileBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes: { class: "createFileBox" },
				childNodes:
				[
					this.nameInput,
					".json",
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
		);
		
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
								name: "h1",
								childNodes: [ "Image Analysis Tool" ]
							},
							{
								name: "div",
								attributes: { class: "header" },
								childNodes:
								[
									this.pathEl
								]
							},
							this.dirsListBox,
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
		console.log(`File Picker: Loading path "${ path }"`);
		this.path = path;
		this.dirsListBox.innerHTML = "";
		this.filesListBox.innerHTML = "";

		const resp = await (await fetch(`/api/files?path=${ path }`)).json();

		let pathUrl = "";

		this.pathEl.innerHTML = "";
		this.pathEl.append(createNodeTree(
			{
				name: "a",
				attributes: { class: "dir", href: `#` },
				listeners: {
					click: e =>
					{
						e.preventDefault();
						this.loadPath("");
					}
				},
				childNodes: [ "Root" ]
			}
		));

		for (const pathPart of path.split("/"))
		{
			if (!pathPart)
				continue;

			pathUrl += (pathUrl ? "/" : "" ) + pathPart;
			const dirUrl = pathUrl;

			this.pathEl.append(createNodeTree(
				{
					name: "a",
					attributes: { class: "dir", href: `#${ dirUrl }` },
					listeners: {
						click: e =>
						{
							e.preventDefault();
							this.loadPath(dirUrl);
						}
					},
					childNodes: [ pathPart ]
				}
			));
		}

		for (const dir of resp.dirs)
		{
			this.dirsListBox.append(createNodeTree(
				{
					name: "button",
					attributes: { class: "file dir" },
					childNodes: [ dir.name ],
					listeners:
					{
						click: () => this.loadPath(dir.path)
					}
				}
			));
		}
		
		for (const file of resp.files)
		{
			this.filesListBox.append(createNodeTree(
				{
					name: "button",
					attributes: { class: "file" },
					childNodes:
					[
						{
							name: "div",
							childNodes:
							[
								{ name: "div", attributes: { class: "tile" }, childNodes: [ file.title ] },
								{ name: "div", attributes: { class: "name" }, childNodes: [ file.name ] }
							]
						},
						{
							name: "div",
							childNodes:
							[
								{ name: "div", attributes: { class: "utime" }, childNodes: [ "Last update: " + unixToStr(file.updateTime) ] },
								{ name: "div", attributes: { class: "ctime" }, childNodes: [ "Created: ", unixToStr(file.creationTime) ] }
							]
						}
					],
					listeners:
					{
						click: () =>
						{
							this.dispatchEvent(new FileOpenEvent(file.path));
							this.close();
						}
					}
				}
			));
		}

		this.filesListBox.append(this.createFileBox);
	}

	async createFile()
	{
		const fileName = this.nameInput.value;
		this.nameInput.value = "";

		if (!fileName)
			return;

		const resp = await fetch(`/api/files/${ this.path }/${ fileName }.json`, { method: "CREATE" });

		if (resp.status == 200)
			this.loadPath(this.path);
	}
}
