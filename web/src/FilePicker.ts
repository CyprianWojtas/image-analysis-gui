import { createElement, createNodeTree, unixToStr } from "./Utils.js";
import { FilesSerialisable } from "./apiTypes/Files.js";

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
	private fileNameInput: HTMLInputElement;
	private createDirBox: HTMLDivElement;
	private dirNameInput: HTMLInputElement;

	private path: string;

	constructor()
	{
		super();

		this.dirsListBox = <HTMLDivElement>createElement("div", { class: "dirsListBox" } );
		this.filesListBox = <HTMLDivElement>createElement("div", { class: "filesListBox" } );
		this.pathEl = <HTMLDivElement>createElement("div", { class: "path" } );
		this.fileNameInput = <HTMLInputElement>createElement("input", { placeholder: "New file name" });
		this.dirNameInput = <HTMLInputElement>createElement("input", { placeholder: "Directory name" });
		this.createFileBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "createFileBox",
				childNodes:
				[
					this.fileNameInput,
					".iaf",
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
		this.createDirBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "createDirBox",
				childNodes:
				[
					this.dirNameInput,
					{
						name: "button",
						childNodes: [ "Create" ],
						listeners:
						{
							click: () => this.createDir()
						}
					}
				]
			}
		);
		
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "filePicker fullscreenPage hidden",
				childNodes:
				[
					{
						name: "div",
						class: "files",
						childNodes:
						[
							{
								name: "h1",
								childNodes: [ "Image Analysis Tool" ]
							},
							{
								name: "div",
								class: "header",
								childNodes:
								[
									this.pathEl
								]
							},
							this.dirsListBox,
							this.filesListBox,
							{
								name: "div",
								class: "about",
								childNodes:
								[
									{
										name: "a",
										href: "/about/",
										target: "_blank",
										childNodes: [ "About" ]
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

		const resp: FilesSerialisable = await (await fetch(`/api/files?path=${ path }`)).json();

		let pathUrl = "";

		this.pathEl.innerHTML = "";
		this.pathEl.append(createNodeTree(
			{
				name: "a",
				href: `#`,
				class: "dir",
				listeners: {
					click: e =>
					{
						e.preventDefault();
						this.loadPath("");
					}
				},
				childNodes: [ resp.rootPath ]
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
					href: `#${ dirUrl }`,
					class: "dir",
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
					class: "file dir",
					childNodes: [ dir.name ],
					listeners:
					{
						click: () => this.loadPath(dir.path)
					}
				}
			));
		}

		this.dirsListBox.append(this.createDirBox);
		
		for (const file of resp.files)
		{
			this.filesListBox.append(createNodeTree(
				{
					name: "button",
					class: "file" + (file.active ? " active" : ""),
					childNodes:
					[
						{
							name: "div",
							childNodes:
							[
								{ name: "div", class: "title", childNodes: [ file.title ] },
								{ name: "div", class: "name", childNodes: [ file.name ] }
							]
						},
						{
							name: "div",
							childNodes:
							[
								{ name: "div", class: "utime", childNodes: [ "Last update: " + unixToStr(file.updateTime) ] },
								{ name: "div", class: "ctime", childNodes: [ "Created: ", unixToStr(file.creationTime) ] }
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
		const fileName = this.fileNameInput.value;
		this.fileNameInput.value = "";

		if (!fileName)
			return;

		const resp = await fetch(`/api/files/${ this.path }/${ fileName }.iaf`, { method: "CREATE" });

		if (resp.status == 200)
			this.loadPath(this.path);
	}

	async createDir()
	{
		const dirName = this.dirNameInput.value;
		this.dirNameInput.value = "";

		if (!dirName)
			return;

		const resp = await fetch(`/api/files/${ this.path }/${ dirName }?type=dir`, { method: "CREATE" });

		if (resp.status == 200)
			this.loadPath(this.path);
	}
}
