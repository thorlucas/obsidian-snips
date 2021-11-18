import { evalTemplate, Template } from "./template";
import { matchTrigger, Trigger } from "./trigger";

export type Snippet = {
	trigger: Trigger,
	template: Template,
}

export type SnippetResult = {
	consume: number,
	replace: string,
}

export function expandSnippet(snippet: Snippet, line: string, end?: number): SnippetResult | null {
	const match = matchTrigger(snippet.trigger, line, end);
	if (match) {
		const replace: string = evalTemplate(snippet.template, { match: match.match });
		return { consume: match.length, replace: replace };
	}
}

