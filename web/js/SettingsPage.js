import Settings from "./Settings.js";
import { createNodeTree } from "./Utils.js";
export default class SettingsPage {
    static init() {
        this.element = createNodeTree({
            name: "div",
            class: "settings fullscreenPage hidden",
            childNodes: [
                {
                    name: "div",
                    class: "header",
                    childNodes: [
                        {
                            name: "h1",
                            childNodes: ["Settings"]
                        },
                        {
                            name: "button",
                            class: "closeButton",
                            listeners: { click: () => this.close() },
                            childNodes: [{ name: "i", class: "icon-cancel" }]
                        }
                    ]
                },
                {
                    name: "div",
                    class: "settingsBox",
                    childNodes: [
                        {
                            name: "label",
                            childNodes: [
                                "Snap to grid ",
                                {
                                    name: "input",
                                    type: "checkbox",
                                    checked: Settings.get("editor.snapToGrid"),
                                    listeners: {
                                        input: e => Settings.set("editor.snapToGrid", e.target.checked)
                                    }
                                }
                            ]
                        },
                        {
                            name: "div",
                            childNodes: [
                                "Editor background: ",
                                {
                                    name: "select",
                                    selected: Settings.get("editor.background"),
                                    listeners: {
                                        change: e => Settings.set("editor.background", e.target.value)
                                    },
                                    childNodes: [
                                        {
                                            name: "option",
                                            value: "lines",
                                            childNodes: ["Lines"]
                                        },
                                        {
                                            name: "option",
                                            value: "dots",
                                            childNodes: ["Dots"]
                                        },
                                        {
                                            name: "option",
                                            value: "clear",
                                            childNodes: ["Clear"]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: "div",
                            childNodes: [
                                "Connections appreance: ",
                                {
                                    name: "select",
                                    selected: Settings.get("editor.connectionStyle"),
                                    listeners: {
                                        change: e => Settings.set("editor.connectionStyle", e.target.value)
                                    },
                                    childNodes: [
                                        {
                                            name: "option",
                                            value: "bezier",
                                            childNodes: ["Bezier Curves"]
                                        },
                                        {
                                            name: "option",
                                            value: "straight",
                                            childNodes: ["Straight Lines"]
                                        },
                                        {
                                            name: "option",
                                            value: "right",
                                            childNodes: ["Right Angles"]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        document.body.append(this.element);
    }
    static open() {
        this.element.classList.remove("hidden");
    }
    static close() {
        this.element.classList.add("hidden");
    }
}
//# sourceMappingURL=SettingsPage.js.map