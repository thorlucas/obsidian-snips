import { App, Editor, EditorPosition, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Snippet, SnippetLambda, Trigger, snippetLambda } from './snippet';

interface MyPluginSettings {
	mySetting: string;
	snippets: Snippet[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	snippets: [
		//{
			//trigger: Trigger('foo', { word: true }),
			//sections: 'bar',
		//},
		//{
			//trigger: Trigger('fizzbuzz', { auto: true }),
			//sections: 'blah'
		//},
		//{
			//trigger: Trigger('([A-Za-z])(\\d)', { auto: true, word: true, regex: true }),
			//sections: '${this.match[1]}_${this.match[2]}'
		//},
	]
}

declare global {
	interface Window {
		workspace: any;
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	snippets: {
		auto: SnippetLambda[],
		tab: SnippetLambda[]
	};

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.snippets = { auto: [], tab: [] };
		this.settings.snippets
			.map(snip => { return { lambda: snippetLambda(snip), opts: snip.trigger.opts } })
			.forEach(snip => {
				snip.opts.auto
				? this.snippets.auto.push(snip.lambda)
				: this.snippets.tab.push(snip.lambda)
			});


		this.addCommand({
			id: 'snip-expand',
			name: 'Expand Snippet',
			editorCallback: this.expandTab.bind(this),
			hotkeys: [{
				key: 'tab',
				modifiers: [],
			}],
		});

		this.app.workspace.on('editor-change', this.expandAuto.bind(this));
	}

	expandTab(editor: Editor) {
		if (!this.expandSnippets(editor, this.snippets.tab)) {
			editor.replaceRange("\t", editor.getCursor('head'));
		}
	}

	expandAuto(editor: Editor) {
		this.expandSnippets(editor, this.snippets.auto);
	}

	expandSnippets(editor: Editor, snippets: SnippetLambda[]): boolean {
		//const cursor: EditorPosition = editor.getCursor('head');
		//const line: string = editor.getLine(cursor.line);
		//for (let snip of snippets) {
			//let result = snip(line, cursor.ch);
			//if (result) {
				//editor.replaceRange(result.replace, {
					//line: cursor.line,
					//ch: cursor.ch - result.consume,
				//}, cursor);
				//// TODO: Do we want to recurse snippets?
				//return true;
			//}
		//}
		return false;
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

