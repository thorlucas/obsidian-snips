import { App, Editor, EditorPosition, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Snippet, SnippetLambda, snippetLambda } from './snippet';

interface MyPluginSettings {
	mySetting: string;
	snippets: Snippet[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	snippets: [
		{ trigger: { type: 'normal', trigger: 'foo' },               template: 'bar' },
		{ trigger: { type: 'normal', trigger: 'fizzbuzz' },          template: 'blah' },
		{ trigger: { type: 'regex',  regex:   /\b([A-Za-z])(\d)$/ }, template: '${this.match[1]}_${this.match[2]}' },
	]
}

declare global {
	interface Window {
		workspace: any;
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	snippets: SnippetLambda[];

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));


		this.snippets = this.settings.snippets.map(snippet => snippetLambda(snippet));

		this.app.workspace.on('editor-change', (editor: Editor) => {
			const cursor: EditorPosition = editor.getCursor('head');
			const line: string = editor.getLine(cursor.line);
			for (let snip of this.snippets) {
				let result = snip(line, cursor.ch);
				if (result) {
					editor.replaceRange(result.replace, {
						line: cursor.line,
						ch: cursor.ch - result.consume,
					}, cursor);
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

