export class SettingsChangedEvent extends Event {
    constructor(settingName, value) {
        super(settingName);
        this.value = value;
    }
}
class Settings {
    static get(settingName) {
        if (this.settings[settingName] !== undefined)
            return this.settings[settingName];
        let value = localStorage.getItem(`settings_${settingName}`);
        if (value === null) {
            value = this.defaults[settingName];
            if (value !== undefined)
                localStorage.setItem(`settings_${settingName}`, JSON.stringify(value));
        }
        else
            value = JSON.parse(value);
        this.settings[settingName] = value;
        return this.settings[settingName];
    }
    static set(settingName, value) {
        this.settings[settingName] = value;
        localStorage.setItem(`settings_${settingName}`, JSON.stringify(value));
        this.eventObject.dispatchEvent(new SettingsChangedEvent(settingName, value));
    }
    static addSettingsChangedListener(settingName, callback) {
        this.eventObject.addEventListener(settingName, callback);
    }
}
Settings.defaults = {
    "editor.snapToGrid": true,
    "editor.background": "lines",
    "editor.connectionStyle": "bezier"
};
Settings.settings = {};
Settings.eventObject = new EventTarget();
export default Settings;
//# sourceMappingURL=Settings.js.map