import { evalTemplate, Template } from "./template";
import { matchLambda, matchTrigger, Trigger } from "./trigger";

export type Snippet = {
	trigger: Trigger,
	template: Template,
}

export type SnippetResult = {
	consume: number,
	replace: string,
}

export type SnippetLambda = (line: string, end?: number) => SnippetResult | null;

export function expandSnippet(snippet: Snippet, line: string, end?: number): SnippetResult | null {
	const match = matchTrigger(snippet.trigger, line, end);
	if (match) {
		const replace: string = evalTemplate(snippet.template, { match: match.match });
		return { consume: match.length, replace: replace };
	}
}

export function snippetLambda(snippet: Snippet): SnippetLambda {
	const matchFunc = matchLambda(snippet.trigger);
	return (line, end) => {
		const match = matchFunc(line, end);
		if (match) {
			const replace: string = evalTemplate(snippet.template, { match: match.match });
			return { consume: match.length, replace: replace };	
		}
	}
}
