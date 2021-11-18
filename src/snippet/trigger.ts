export type NormalTrigger = {
	type: 'normal',
	trigger: string,
};

export type RegexTrigger = {
	type: 'regex',
	regex: RegExp,
};

export type Trigger =
	| NormalTrigger
	| RegexTrigger;


export type Match = {
	length: number,
	match?: RegExpMatchArray,
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
