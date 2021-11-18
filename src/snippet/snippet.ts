import { EditorPosition } from "obsidian";
import { evalTemplate, Template } from "./template";
import { matchLambda, matchTrigger, Trigger } from "./trigger";

export type Snippet = {
	trigger: Trigger,
	sections: Section[],
}

export type TextSection = {
	type: 'text',
	text: string,
}

export type TemplateSection = {
	type: 'template',
	template: string,
}

export type TabstopSection = {
	type: 'tabstop',
	index: number,
	// TODO: Recursive tabstops
	placeholder: string,
}

export type Section =
	| TextSection
	| TemplateSection
	| TabstopSection;

export type SnippetResult = {
	/**
	 * The number of characters to remove initially.
	 */
	consume: number,
	sections: Section[],
	match?: RegExpMatchArray,
}

export type SnippetLambda = (line: string, end?: number) => SnippetResult | null;

export function expandSnippet(snippet: Snippet, line: string, end?: number): SnippetResult | null {
	//const match = matchTrigger(snippet.trigger, line, end);
	//if (match) {
		//const replace: string = evalTemplate(snippet.sections, { match: match.match });
		//return { consume: match.length, replace: replace };
	//}
	return null;
}

export function snippetLambda(snippet: Snippet): SnippetLambda {
	//const matchFunc = matchLambda(snippet.trigger);
	//return (line, end) => {
		//const match = matchFunc(line, end);
		//if (match) {
			//const replace: string = evalTemplate(snippet.sections, { match: match.match });
			//return { consume: match.length, replace: replace };	
		//}
	//}
	return null;
}
