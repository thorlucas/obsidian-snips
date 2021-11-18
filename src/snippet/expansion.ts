import { Editor, EditorPosition, EditorRange, MarkdownView } from "obsidian";
import { Section, SnippetResult, TabstopSection } from "./snippet"
import { evalInContext, evalTemplate } from "./template";
import * as CodeMirror from 'codemirror';

declare module 'obsidian' {
	interface Editor {
		cm: CodeMirror.Editor;
	}
}

type Marker = CodeMirror.TextMarker<CodeMirror.Position>;

type MarkedRange = {
	expansion: SnippetExpansion,
	from: Marker,
	to: Marker,
}

function getMarkedRange(range: MarkedRange): string {
	return range.expansion.editor.getRange(
		range.from.find(),
		range.to.find(),
	);
}

class TabstopExpansion {
	expansion: SnippetExpansion;
	source: MarkedRange;
	destinations: MarkedRange[];
	value: string;

	constructor(expansion: SnippetExpansion, from: Marker, to: Marker) {
	}
}



type SectionData = {
	section: Section,
	value?: string,
	begin?: CodeMirror.TextMarker<CodeMirror.Position>,
	end?: CodeMirror.TextMarker<CodeMirror.Position>,
}



export class SnippetExpansion {
	editor: Editor;
	start: EditorPosition;
	startOffset: number;

	sections: SectionData[];
	match: RegExpMatchArray | undefined;

	tabstop: {
		// Ordered list of the unique tabstop keys
		keys: number[],
		// Current index into the keys
		index: number,
		// Map from key to first occuring section
		firstMap: { [key: number]: SectionData },
		// Current tabstop
		current: SectionData,
	} = { keys: [], index: 0, firstMap: {}, current: null };

	_value: string;

	contentEl?: Element;

	constructor(result: SnippetResult, editor: Editor, mv?: MarkdownView) {
		this.editor = editor;
		this.startOffset = editor.posToOffset(editor.getCursor('head')) - result.consume;
		this.start = editor.offsetToPos(this.startOffset);

		this.match = result.match;
		this.sections = result.sections.map((sec: Section) => {
			return {
				section: sec,
			};
		});

		if (mv) {
			this.contentEl = mv.contentEl;
		}

		// The tabstop index at the section index
		const tabstopIndexAtSection: number[] = this.sections.map(sec => sec.section.type == 'tabstop' ? sec.section.index : -1);

		// Figure out unique tabstop keys
		tabstopIndexAtSection
			.filter(idx => idx > 0)
			.forEach(idx => this.tabstop.keys.indexOf(idx) == -1 ? this.tabstop.keys.push(idx) : null);
		this.tabstop.keys.sort();

		// Set the first tabstop
		this.tabstop.keys.forEach(key => {
			this.tabstop.firstMap[key] = this.sections[tabstopIndexAtSection.indexOf(key)];
		});
		this.tabstop.current = this.tabstop.firstMap[this.tabstop.keys[this.tabstop.index]];

		// Replace the editor with the current value
		this.editor.replaceRange(this.value(), this.start, editor.getCursor('head'));

		// Move cursor to first tabstop
		let range = this.sectionRange(this.tabstop.current);
		this.editor.setSelection(range.from, range.to);

		this.editor.cm.on('change', this.update.bind(this));

		console.log(this);
	}

	value(): string {
		if (this._value == null) {
			this._value = this.sections
				.map((sec: SectionData): string => this.sectionValue(sec))
				.reduce((acc, sec) => { return acc.concat(sec); }, '');
		}
		return this._value;
	}

	sectionValue(sec: SectionData): string {
		if (sec.value == null) {
			switch (sec.section.type) {
				case 'text':
					sec.value = sec.section.text;
					break;
				case 'template':
					sec.value = evalInContext(sec.section.template, this).toString();
					break;
				case 'tabstop':
					sec.value = sec.section.placeholder;
					break;
			}
		}

		return sec.value;
	}

	sectionRange(sec: SectionData): EditorRange {
		if (sec.begin == null || sec.end == null) {
			// Should create a linked sort of thing
			// So that if we change one, it changes the others
			let start_offset: number = this.startOffset;
			//for (let i = 0; i < this.sections.length; ++i) {
				//let sec = this.sections[i];

				//let start =  this.editor.cm.getDoc().setBookmark(this.editor.offsetToPos(start_offset), { widget: this.makeMarkerEl(), insertLeft: false });

				//let end_offset = start_offset + this.sectionValue(sec).length;
				//let end = this.editor.cm.getDoc().setBookmark(this.editor.offsetToPos(end_offset), { widget: this.makeMarkerEl(), insertLeft: true });

				//sec.begin = start;
				//sec.end = end;

				//start_offset = end_offset;
			//}

			const doc = this.editor.cm.getDoc();
			doc.setBookmark(this.editor.offsetToPos(start_offset), { widget: this.makeMarkerEl() });
			doc.setBookmark(this.editor.offsetToPos(start_offset + 3), { widget: this.makeMarkerEl(), insertLeft: false});
			doc.setBookmark(this.editor.offsetToPos(start_offset + 8), { widget: this.makeMarkerEl(), insertLeft: true});
			doc.setBookmark(this.editor.offsetToPos(start_offset + 12), { widget: this.makeMarkerEl()});
		}
		// TODO: Check if the lengths are correct

		//let range = {
			//from: sec.begin.find(),
			//to: sec.end.find(),
		//};

		//return range;
		return null;
	}

	update(cm: CodeMirror.Editor, change: CodeMirror.EditorChange) {
		let range = this.sectionRange(this.tabstop.current);
		console.log(this.editor.getRange(range.from, range.to));
	}

	makeMarkerEl(): HTMLElement {
		let el = this.contentEl.createSpan('span');
		el.addClass('snipmark');
		return el;
	}
}


