import { iRule } from './interfaces/interfaces';
export default class Grammar {
    private rules: Array<iRule>;
    constructor(rules: Array<iRule>) {
        this.rules = rules;
    }

    getRules(): Array<iRule> {
        return this.rules;
    }
}