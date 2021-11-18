export type Template = string;

function doEval(func: string): string {
	return eval(func);
}

export function evalTemplate(template: Template, context: any): string {
	return doEval.call(context, '`'+template+'`');
}

export function evalInContext(expr: string, context: any): any {
	return doEval.call(context, expr);
}
