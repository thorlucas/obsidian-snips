import { App, Editor, EditorPosition, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
	snips: Snippet[];
}

interface Snippet {
	trigger: string,
	replace: string,
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	snips: [
		{ trigger: 'foo', replace: 'bar' },
		{ trigger: 'fizzbuzz', replace: 'blah' },
	]
}

declare global {
	interface Window {
		workspace: any;
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		window.workspace = this.app.workspace;

		this.app.workspace.on('editor-change', (editor: Editor, markdownView: MarkdownView) => {
			const cursor: EditorPosition = editor.getCursor('head');
			const line: string = editor.getLine(cursor.line);
			for (let snip of this.settings.snips) {
				if (line.endsWith(snip.trigger)) {
					editor.replaceRange(snip.replace, { line: cursor.line, ch: cursor.ch - snip.trigger.length }, cursor, snip.trigger);
				}
			}
		});
	}

	onunload() {
		console.log('unloading plugin');
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
function EditorPosition(EditorPosition: any, arg1: void) {
    throw new Error('Function not implemented.');
}

