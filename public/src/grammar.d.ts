import { iRule } from './interfaces/interfaces';
export default class Grammar {
    private rules;
    constructor(rules: Array<iRule>);
    getRules(): Array<iRule>;
}
