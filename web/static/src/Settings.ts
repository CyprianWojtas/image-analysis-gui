export
class SettingsChangedEvent extends Event
{
	value: any;

	constructor(settingName: string, value: any)
	{
		super(settingName);
		this.value = value;
	}
}

export default
class Settings
{
	private static defaults =
	{
		"editor.snapToGrid": true,
		"editor.background": "lines",
		"editor.connectionStyle": "bezier"
	};

	private static settings = {};

	private static eventObject = new EventTarget();

	static get(settingName: string)
	{
		if (this.settings[settingName] !== undefined)
			return this.settings[settingName];

		let value = localStorage.getItem(`settings_${ settingName }`);

		if (value === null)
		{
			value = this.defaults[settingName];
			if (value !== undefined)
				localStorage.setItem(`settings_${ settingName }`, JSON.stringify(value));
		}
		else
			value = JSON.parse(value);

		this.settings[settingName] = value;

		return this.settings[settingName];
	}

	static set(settingName: string, value: any)
	{
		this.settings[settingName] = value;
		localStorage.setItem(`settings_${ settingName }`, JSON.stringify(value));
		this.eventObject.dispatchEvent(new SettingsChangedEvent(settingName, value));
	}

	static addSettingsChangedListener(settingName: string, callback: (e: SettingsChangedEvent) => any)
	{
		this.eventObject.addEventListener(settingName, callback);
	}
}
