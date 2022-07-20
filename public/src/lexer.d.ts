import { iRule, iToken, iLexPosition } from './interfaces/interfaces';
import Grammar from './grammar';
export default class Lexer {
    private input;
    private grammar;
    private position;
    constructor(input: string, grammar: Grammar);
    getGrammar(): Grammar;
    setInput(input: string): void;
    getInput(): string;
    lex(): iToken;
    getNextLexPosition(input: string, rules: Array<iRule>, offset?: number): {
        position: iLexPosition;
        matchedRule: iRule;
    };
    getRulePosition(input: string, r: iRule): iLexPosition;
    generateToken(pos: iLexPosition, input: string, matchedRule: iRule): iToken;
    tokenizeIntermediateContent(endIndex: number, input: string): iToken;
    getControlTokenName(input: string): string;
    getMappedControlTokenName(name: string): string;
    validateToken(pos: iLexPosition, rule: iRule, input: string): iToken;
    identifyControlType(tokenName: string): string;
    getTokenName(raw: string, rule: iRule): string;
    getHTMLTokenName(raw: string): string;
}
