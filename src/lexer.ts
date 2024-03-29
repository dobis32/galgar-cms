import * as os from 'os';
import { EOF_TOKEN, BLANK_RULE, BLANK_TOKEN, CONTROL_PROPS_RULE, CONTROL_RULE, HTML_RULE, INVALID_INPUT_TOKEN } from './const/const';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP } from './const/tokenData';
import { iRule, iToken, iLexPosition } from './interfaces/interfaces';
import Grammar from './grammar';

export default class Lexer {
    private input: string;
    private grammar: Grammar;
    private position: number = 0;

    constructor(input: string, grammar: Grammar) {
        this.input = input.trim();
        this.grammar = grammar;
    }

    getGrammar(): Grammar {
        return this.grammar;
    }

    setInput(input: string) {
        this.input = input;
        this.position = 0;
    }

    getInput(): string {
        return this.input 
    }

    lex(): iToken {
        const rules = this.grammar.getRules();
        let start = this.position;
        let offsetInput = `${this.input}`.substring(start);
        let ret: iToken = Object.assign({}, BLANK_TOKEN);
        if (start ==  this.input.length - 1 || offsetInput.trim().length == 0) return ret = EOF_TOKEN; // reached EOF or nothing to lex
        const { position, matchedRule } = this.getNextLexPosition(offsetInput, rules);
        ret = this.generateToken(position, offsetInput, matchedRule);
        if (position.start == -1 || ret.type ==  _TOKEN_TYPES_MAP.INVALID) throw new Error('[ GALGAR ERROR ] lex(): failed to lex; invalid input');
        else this.position += ret.raw.length;
        return ret;
    }

    generatePropsMap(token: iToken): Array<string>{
        if (token.type != _TOKEN_TYPES_MAP.PROPS) throw new Error('[ GALGAR ERROR ] generatePropsMap(): input token was not a #PROPS token'); 
        const propsArray: Array<string> = [];
        // get token value
        const tokValue = token.value;
        // get everything in between #PROPS and ]]
        const tokRuleEnd: string = CONTROL_RULE.end;
        tokValue
            .split(tokRuleEnd)[0] // get rid of ]]
            .split(CONTROL_PROPS_RULE.start + CONTROL_PROPS_RULE.end)[1] // get rid of #PROPS
            .split(',').map((s:string) => s.trim()).forEach((s:string) => {
                if (s.trim().length > 0) propsArray.push(s);
            }); 
    
        return propsArray;
    }

    getNextLexPosition(input: string, rules: Array<iRule>, offset?: number): { position: iLexPosition, matchedRule: iRule } {
        if (offset == undefined) offset = 0;
        const offsetInput: string = input.substring(offset);
        const position: iLexPosition = { start: Number.POSITIVE_INFINITY, end: -1, next: -1 };
        let matchedRule: iRule = BLANK_RULE;
        for (let r of rules) {
            const tempPos: iLexPosition = this.getRulePosition(offsetInput, r);
            if (tempPos.start > -1 && tempPos.start < position.start) {
                matchedRule = r;
                position.start = tempPos.start + offset;
                position.end = tempPos.end + offset;
                position.next = tempPos.next + offset;
            }
        }
        return { position, matchedRule };
    }

    getRulePosition(input: string, r: iRule): iLexPosition {
        const ret: iLexPosition = { start: -1, end: -1, next: -1 };
        const s: string = r.start;
        const e: string = r.end;
        ret.start = input.indexOf(s);
        ret.end = input.indexOf(e);
        const offset: number = 1;
        const next: number = input.substring(ret.start + offset).indexOf(s);
        ret.next = next;
        if (next >= 0) ret.next += 1;
        return ret;
    }

    generateToken(pos: iLexPosition, input: string, matchedRule: iRule): iToken {
        let ret: iToken = Object.assign({}, BLANK_TOKEN);
        let { start } = pos;
        if (start == -1) ret = INVALID_INPUT_TOKEN; // no token found
        else if (start != 0) ret = this.tokenizeIntermediateContent(start, input); // white-space token or content token found
        else ret = this.validateToken(pos, matchedRule, input); // start position is zero, token found
        if (ret == BLANK_TOKEN) throw new Error('[ GALGAR ERROR ] generateToken(): failed to generate token');
        return ret;
    }

    tokenizeIntermediateContent(endIndex: number, input: string): iToken {
        let ret: iToken = Object.assign({}, BLANK_TOKEN);
        const token: string = input.substring(0, endIndex);
        const trimmed = token.split('\t').filter((t) => t.length > 0).join('').trim();
        if (trimmed.length == 0) { // is it just white space?
            ret.value = trimmed; // be sure to preserve length of whitespace
            ret.type = _TOKEN_TYPES_MAP.WHITESPACE; 
            ret.name = _TOKEN_NAMES_MAP.WHITESPACE;
        } else {
            ret.value = trimmed;
            ret.type = _TOKEN_TYPES_MAP.CONTENT;
            ret.name = _TOKEN_NAMES_MAP.CONTENT;
        };
        ret.raw = token;
        return ret;
    }

    getControlTokenName(input: string): string {
        const trimmed: string = input.trim();
        const name: string = trimmed.substring(CONTROL_RULE.start.length, trimmed.length - CONTROL_RULE.end.length).trim().split(' ')[0].toLowerCase();
        return this.getMappedControlTokenName(name);
    }

    getMappedControlTokenName(name: string): string {
        let ret: string = '';
        switch (name.toLowerCase()) {
            case '#if':
                ret = _TOKEN_NAMES_MAP.IF;
                break;
            case '#elseif':
                ret = _TOKEN_NAMES_MAP.ELSEIF;
                break;
            case '#else':
                ret = _TOKEN_NAMES_MAP.ELSE;
                break;
            case '#endif':
                ret = _TOKEN_NAMES_MAP.ENDIF;
                break;
            case '#for':
                ret = _TOKEN_NAMES_MAP.FOR;
                break;
            case '#endfor':
                ret = _TOKEN_NAMES_MAP.ENDFOR;
                break;
            case '#import':
                ret = _TOKEN_NAMES_MAP.IMPORT;
                break;
            case '#component':
                ret = _TOKEN_NAMES_MAP.COMPONENT;
                break;
            case '#props':
                ret = _TOKEN_NAMES_MAP.PROPS;
                break;
        }

        return `${ret}`;
    }

    validateToken(pos: iLexPosition, rule: iRule, input: string): iToken {
        let { start, end, next } = pos;
        let ret: iToken = Object.assign({}, BLANK_TOKEN);
        // determine validity of token:
        // 1. should have non-zero token end position
        // 2. and the next token start should come after said token end position
        if (end < 0 || (next < end && next != -1)) { // token is invalid
            ret = INVALID_INPUT_TOKEN;
        } else { // token is valid
            const raw: string = input.substring(start, end + (rule.end.length));
            const value: string = raw.trim();
            const name: string = this.getTokenName(raw, rule);
            const type: string = rule == CONTROL_RULE ? this.identifyControlType(name) : rule.type;
            const token: iToken = {
                value,
                raw,
                type,
                name,
                enumerationMap: {}
            };
            // get type according to matched rule
            ret = token;
        }
        return ret;
    }

    identifyControlType(tokenName: string): string {
        let ret: string = '';
        switch (tokenName) {
            case _TOKEN_NAMES_MAP.IF:
                ret = _TOKEN_TYPES_MAP.IF;
                break;
            case _TOKEN_NAMES_MAP.ELSEIF:
                ret = _TOKEN_TYPES_MAP.IF;;
                break;
            case _TOKEN_NAMES_MAP.ELSE:
                ret = _TOKEN_TYPES_MAP.IF;;
                break;
            case _TOKEN_NAMES_MAP.ENDIF:
                ret = _TOKEN_TYPES_MAP.IF;;
                break;
            case _TOKEN_NAMES_MAP.FOR:
                ret = _TOKEN_TYPES_MAP.FOR;
                break;
            case _TOKEN_NAMES_MAP.ENDFOR:
                ret = _TOKEN_TYPES_MAP.FOR;
                break;
            case _TOKEN_NAMES_MAP.IMPORT:
                ret = _TOKEN_TYPES_MAP.IMPORT;
                break;
            case _TOKEN_NAMES_MAP.COMPONENT:
                ret = _TOKEN_TYPES_MAP.COMPONENT;
                break;
            case _TOKEN_NAMES_MAP.PROPS:
                ret = _TOKEN_TYPES_MAP.PROPS;
                break;
        }
        return `${ret}`;
    }

    getTokenName(raw: string, rule: iRule): string {
        return rule.type == _TOKEN_TYPES_MAP.GENERIC ? this.getControlTokenName(raw) : this.getHTMLTokenName(raw)
    }

    getHTMLTokenName(raw: string): string {
        const startLength = HTML_RULE.start.length;
        const endLength = HTML_RULE.end.length;
        const stripped: string = raw.substring(startLength, raw.length - endLength).trim().replace('/', '');
        const splitString: Array<string> = stripped.split(' ');
        const name = splitString? splitString[0] : Object.assign({}, _TOKEN_NAMES_MAP.INVALID);
        return name;
    }
}