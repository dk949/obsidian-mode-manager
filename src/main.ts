import { App, FileView, ItemView, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile, View } from "obsidian";

interface ModeManagerSettings {
    property_name: string
}

const DEFAULT_SETTINGS: ModeManagerSettings = {
    property_name: "default-mode"
};

type ModeValue = "edit" | "preview" | "source" | "reading";
type MaybeModeValue = undefined | null | ModeValue;

function isMaybeModeValue(v: any): v is MaybeModeValue {
    if (v == null) return true;
    return isModeValue(v);
}

function isModeValue(v: any): v is ModeValue {
    switch (v) {
        case "edit":
        case "preview":
        case "source":
        case "reading": return true;
        default: return false;
    }
}


function isItemView(v: View | null | undefined): v is ItemView {
    return v != null && "contentEl" in v;
}
function isFileView(v: View | null | undefined): v is FileView {
    return isItemView(v)
        && "allowNoFile" in v
        && "file" in v
        && "navigation" in v;
}

export default class ModeManager extends Plugin {
    settings: ModeManagerSettings;


    async run(file: TFile | null) {
        if (file == null) {
            return;
        }
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata) {
            return;
        }
        const { frontmatter } = metadata;
        if (!frontmatter) {
            return;
        }
        const mode: unknown = frontmatter[this.settings.property_name];
        if (!isMaybeModeValue(mode)) {
            new Notice(`The value of the ${this.settings.property_name} property must be one of edit, preview, source or reading`);
            return;
        }
        if (mode == null) {
            return;
        }
        await this.setMode(mode);
    }

    async onload() {
        await this.loadSettings();

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "switch-to-live-preview",
            name: "Switch to live preview",
            callback: async () => {
                await this.setMode("preview");
            }
        });

        this.addCommand({
            id: "switch-to-source",
            name: "Switch to source",
            callback: async () => {
                await this.setMode("source");
            }
        });

        this.addCommand({
            id: "switch-to-edit",
            name: "Switch to edit",
            callback: async () => {
                await this.setMode("edit");
            }
        });

        this.addCommand({
            id: "switch-to-reading",
            name: "Switch to reading",
            callback: async () => {
                await this.setMode("reading");
            }
        });

        this.app.workspace.on("active-leaf-change", leaf => {
            const view = leaf?.view;
            if (!isFileView(view)) {
                return;
            }
            return this.run(view.file);
        });

        this.addSettingTab(new ModeManagerTab(this.app, this));
    }

    onunload() {

    }

    async setMode(mode: ModeValue) {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        const state = view.getState();
        switch (mode) {
            case "edit":
                state.mode = "source";
                break;
            case "preview":
                state.mode = "source";
                state.source = false;
                break;
            case "source":
                state.mode = "source";
                state.source = true;
                break;
            case "reading":
                state.mode = "preview";
                state.source = false;
                break;
        }
        await view.setState(state, { history: true });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as ModeManagerSettings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}


class ModeManagerTab extends PluginSettingTab {
    plugin: ModeManager;

    constructor(app: App, plugin: ModeManager) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        new Setting(containerEl)
            .setName("Default mode property name")
            .setDesc("The name of the property to configure a note's default mode")
            .addText(text => text
                .setPlaceholder("name")
                .setValue(this.plugin.settings.property_name)
                .onChange(async v => {
                    this.plugin.settings.property_name = v;
                    await this.plugin.saveSettings();
                })
            );
        ;
    }
}
