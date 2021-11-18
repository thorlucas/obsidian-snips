export type Template = string;

export interface TemplateContext {
	match?: RegExpMatchArray;
}

function evalInContext(func: string): string {
	return eval(func);
}

export function evalTemplate(template: Template, context: TemplateContext): string {
	return evalInContext.call(context, '`'+template+'`');
}
