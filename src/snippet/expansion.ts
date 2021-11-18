import { Editor, EditorPosition } from "obsidian";
import { Section, SnippetResult, TabstopSection } from "./snippet"
import { evalInContext, evalTemplate } from "./template";

export class SnippetExpansion {
	editor: Editor;
	start: EditorPosition;
	startOffset: number;

	sections: Section[];
	match: RegExpMatchArray | undefined;

	/**
	 * Ordered list of the tabstop keys.
	 * We need this because it's possible that the user would add a gap between the
	 * numbers.
	 */
	tabstopKeys: number[] = [];

	/**
	 * Current tabstop index.
	 * Refers to the index into the tabstopKeys.
	 */
	currentTabstopIndex: number;

	/**
	 * The index of the section corresponding to the first occurence of this tabstop.
	 */
	currentTabstopSectionIndex: number;

	// TODO: Recursive tabstops
	/**
	 * A map of the current tabstop values.
	 */
	tabstopValues: { [key: number]: string } = {};

	_sectionValues: string[];
	_value: string;

	constructor(result: SnippetResult, editor: Editor) {
		this.editor = editor;
		this.startOffset = editor.posToOffset(editor.getCursor('head')) - result.consume;
		this.start = editor.offsetToPos(this.startOffset);

		this.sections = result.sections;
		this.match = result.match;

		const tabstopSections: TabstopSection[] = this.sections.filter(sec => { return sec['type'] == 'tabstop' }) as TabstopSection[];
		
		tabstopSections.forEach((sec: TabstopSection) => {
			// Tabstop 0 has no placeholder or value
			if (sec.index != 0) {
				this.tabstopValues[sec.index] = sec.placeholder;
			}
		});

		this.tabstopKeys = Object.keys(this.tabstopValues).map(key => parseInt(key));

		// Set the first tabstop
		this.currentTabstopIndex = 0;
		const tabIndexMap = this.sections.map((sec: Section) => {
			return sec.type === 'tabstop' ? sec.index : -1
		});
		console.log("tab index map: ", tabIndexMap);
		this.currentTabstopSectionIndex = tabIndexMap.indexOf(this.tabstopKeys[this.currentTabstopIndex]);

		// Replace the editor with the current value
		editor.replaceRange(this.value(), this.start, editor.getCursor('head'));

		console.log(`Snip start: ${this.startOffset}`)
		console.log(this.start);

		console.log(`Tabstop index: ${this.currentTabstopSectionIndex}`);
		console.log(`Sec start: ${this.sectionStart(this.currentTabstopSectionIndex)}`);

		console.log(this);

		// Move cursor to first tabstop
		editor.setCursor(this.sectionStart(this.currentTabstopSectionIndex));
	}

	value(): string {
		if (this._value != null) {
			return this._value;
		}

		this._sectionValues = this.sections.map((sec: Section): string => {
			switch (sec.type) {
				case 'text':
					return sec.text;
				case 'template':
					return evalInContext(sec.template, this).toString();
				case 'tabstop':
					return this.tabstopValues[sec.index];
			}
		});
		this._value = this._sectionValues.reduce((acc, sec) => { return acc.concat(sec); }, '');
		return this._value;
	}

	sectionValue(index: number): string {
		if (this._sectionValues == null) {
			this.value();
		}

		return this._sectionValues[index];
	}

	sectionStart(sectionIndex: number): EditorPosition {
		let offset = 0;
		for (let i = 0; i < sectionIndex; ++i) {
			offset += this.sectionValue(i).length;
		}
		const sectionOffset = this.startOffset + offset;
		return this.editor.offsetToPos(sectionOffset);
	}
}


