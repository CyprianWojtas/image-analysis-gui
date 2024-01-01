export interface FilesSerialisable
{
	dirs: {
		name: string;
		path: string;
		type: "dir";
	}[];
	files: {
		name: string;
		path: string;
		type: "file";
		title: string;
		creationTime: number;
		updateTime: number;
		active: boolean;
	}[];
	rootPath: string;
	fullPath: string;
}
