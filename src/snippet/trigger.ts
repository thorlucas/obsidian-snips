import escapeStringRegexp from 'escape-string-regexp';

export interface TriggerOptions {
	regex?: boolean; // Use a regex trigger
	auto?: boolean; // Expand automatically without tab
	word?: boolean; // Expand only on word boundaries
}

export type NormalTrigger = {
	type: 'normal',
	trigger: string,
	opts: TriggerOptions,
};

export type RegexTrigger = {
	type: 'regex',
	regex: RegExp,
	opts: TriggerOptions,
};

export type Trigger =
	| NormalTrigger
	| RegexTrigger;

export type Match = {
	length: number,
	match?: RegExpMatchArray,
}

export type MatchLambda = (line: string, end?: number) => Match | null;

export function Trigger(trigger: string | string, opts?: TriggerOptions): Trigger {
	// In these conditions, we need to use a regex trigger
	if (opts.regex || opts.word) {
		// We assume that if regex is specified, it's already escaped
		const escaped: string = opts.regex ? trigger : escapeStringRegexp(trigger);
		const pattern: string = `${opts.word ? '\\b' : ''}${escaped}\$`;

		return {
			type: 'regex',
			regex: new RegExp(pattern),
			opts: opts,
		}
	} else {
		return {
			type: 'normal',
			trigger: trigger,
			opts: opts,
		}
	}
}

export function matchNormalTrigger(trigger: NormalTrigger, line: string, end?: number): Match | null {
	if (line.endsWith(trigger.trigger, end)) {
		return { length: trigger.trigger.length };
	}
}

export function matchRegexTrigger(trigger: RegexTrigger, line: string, end?: number): Match | null {
	const found = line.slice(0, end).match(trigger.regex);
	if (found) {
		return { length: found.first().length, match: found };
	}
}

export function matchTrigger(trigger: Trigger, line: string, end?: number): Match | null {
	switch (trigger.type) {
		case 'normal':
			return matchNormalTrigger(trigger, line, end);
		case 'regex':
			return matchRegexTrigger(trigger, line, end);
	}
}

export function matchLambda(trigger: Trigger): MatchLambda {
	switch (trigger.type) {
		case 'normal':
			return (line, end) => matchNormalTrigger(trigger, line, end);
		case 'regex':
			return (line, end) => matchRegexTrigger(trigger, line, end);
	}
}
