import { App, Editor, EditorPosition, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
	snips: Snippet[];
}

type NormalTrigger = {
	type: 'normal',
	trigger: string,
}

type RegexTrigger = {
	type: 'regex',
	regex: RegExp,
}

type Trigger =
	| NormalTrigger
	| RegexTrigger;

type TriggerMatch = {
	length: number,
	groups?: RegExpMatchArray,
}

function matchNormalTrigger(trigger: NormalTrigger, line: string, end?: number): TriggerMatch | null {
	if (line.endsWith(trigger.trigger, end)) {
		return { length: trigger.trigger.length };
	}
}

function matchRegexTrigger(trigger: RegexTrigger, line: string, end?: number): TriggerMatch | null {
	const found = line.match(trigger.regex);
	if (found) {
		return { length: found.first().length };
	}
}


function matchTrigger(trigger: Trigger, line: string, end?: number): TriggerMatch | null {
	switch (trigger.type) {
		case 'normal':
			return matchNormalTrigger(trigger, line, end);
		case 'regex':
			return matchRegexTrigger(trigger, line, end);
	}
}

interface Snippet {
	trigger: Trigger;
	replace: string;
}

type SnippetExpansion = {
	length: number,
	replace: string,
}

function expandSnippet(snippet: Snippet, line: string, end?: number): SnippetExpansion | null {
	const match = matchTrigger(snippet.trigger, line, end);
	if (match) {
		return {
			length: match.length,
			replace: snippet.replace,
		}
	}
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	snips: [
		{ trigger: { type: 'normal', trigger: 'foo' }, replace: 'bar' },
		{ trigger: { type: 'normal', trigger: 'fizzbuzz' }, replace: 'blah' },
		{ trigger: { type: 'regex', regex: /\b([A-Za-z])(\d)$/ }, replace: 'az' },
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
				let exp = expandSnippet(snip, line, cursor.ch);
				if (exp) {
					editor.replaceRange(exp.replace, { line: cursor.line, ch: cursor.ch - exp.length }, cursor);
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

