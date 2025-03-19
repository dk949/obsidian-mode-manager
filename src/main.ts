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

export default class ModeManager extends Plugin {
    settings: ModeManagerSettings;


    async run(view: MarkdownView) {
        const file = view.file;

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
        await this.setMode(mode, view);
    }

    async onload() {
        await this.loadSettings();

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "switch-to-live-preview",
            name: "Switch to live preview",
            checkCallback: this.makeCheckCB(view => this.setMode("preview", view))
        });

        this.addCommand({
            id: "switch-to-source",
            name: "Switch to source",
            checkCallback: this.makeCheckCB(view => this.setMode("source", view))
        });

        this.addCommand({
            id: "switch-to-edit",
            name: "Switch to edit",
            checkCallback: this.makeCheckCB(view => this.setMode("edit", view))
        });

        this.addCommand({
            id: "switch-to-reading",
            name: "Switch to reading",
            checkCallback: this.makeCheckCB(view => this.setMode("reading", view))
        });

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", leaf => {
                const view = leaf?.view;
                if (!view) return;
                if (!(view instanceof MarkdownView)) return;
                return this.run(view);
            })
        );

        this.addSettingTab(new ModeManagerTab(this.app, this));
    }

    onunload() {

    }

    async setMode(mode: ModeValue, view: MarkdownView) {
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
        this.app.workspace.trigger("layout-change");
    }

    getView() {
        return this.app.workspace.getActiveViewOfType(MarkdownView);
    }

    makeCheckCB(cb: (view: MarkdownView) => any) {
        return (checking: boolean) => {
            const view = this.getView();
            if (view) {
                if (!checking) {
                    cb(view);
                }
                return true;
            }
            return false;

        };
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
