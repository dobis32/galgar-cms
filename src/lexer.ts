import * as os from 'os';
import { EOF_TOKEN, BLANK_RULE, BLANK_TOKEN, CONTROL_RULE, HTML_RULE, INVALID_TOKEN_NAME, INTERMEDIATE_CONTENT, INVALID_INPUT_TOKEN } from './const/const';
import { _TYPE_CONTROL_PROPS_TOKEN, _TYPE_CONTROL_GENERIC_TOKEN, _TYPE_CONTROL_FOR_TOKEN, _TYPE_CONTROL_COMPONENT_TOKEN, CONTROLFOR_ENDFOR_TOKEN, CONTROLIF_ENDIF_TOKEN, CONTROLIF_ELSE_TOKEN, CONTROLIF_ELSEIF_TOKEN, CONTROLIF_IF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_EOF_TOKEN, _TYPE_BAD_TOKEN, _TYPE_HTML_TOKEN, _TYPE_BLANK_TOKEN, _TYPE_CONTENT_TOKEN, _TYPE_WHITESPACE_TOKEN, CONTROLFOR_FOR_TOKEN, _TYPE_CONTROL_IF_TOKEN, CONTROL_IMPORT_TOKEN, _TYPE_CONTROL_IMPORT_TOKEN, CONTROL_COMPONENT_TOKEN, CONTROL_PROPS_TOKEN } from './const/tokenTypes';
import { iRule, iToken, iLexPosition } from './interfaces/interfaces';
import Grammar from './grammar';

export default class Lexer {
    private input: string;
    private grammar: Grammar;
    private position: number = 0;

    constructor(input: string, grammar: Grammar) {
        this.input = input.replace(os.EOL, '');
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
        let start = this.position;
        let ret: iToken = BLANK_TOKEN;
        const rules = this.grammar.getRules();
        if (start ==  this.input.length - 1) ret = EOF_TOKEN; // reached EOF
        let offsetInput = `${this.input}`.trim().substring(start);
        if (offsetInput.length == 0) ret = EOF_TOKEN; // nothing to lex
        else {
            const { position, matchedRule }= this.getNextLexPosition(offsetInput, rules);
            const token = this.generateToken(position, offsetInput, matchedRule);
            ret = token;
        }
        if (ret.type == _TYPE_EOF_TOKEN || ret.type == _TYPE_INVALID_INPUT) ret = INVALID_INPUT_TOKEN;
        else this.position += ret.raw.length;
        return ret;
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
        ret.next = input.substring(ret.start + 1).indexOf(s) + 1;

        return ret;
    }

    generateToken(pos: iLexPosition, input: string, matchedRule: iRule): iToken {
        let ret: iToken = BLANK_TOKEN;
        let { start } = pos;
        if (start == -1) ret = INVALID_INPUT_TOKEN; // no token found
        else if (start != 0) ret = this.processIntermediateContent(start, input); // white-space token or content token found
        else ret = this.validateToken(pos, matchedRule, input); // start position is zero, token found
        return ret;
    }

    processIntermediateContent(endIndex: number, input: string): iToken {
        let ret: iToken = BLANK_TOKEN;
        const token: string = input.substring(0, endIndex);
        const trimmed = token.split('\t').filter((t) => t.length > 0).join('').trim();
        if (trimmed.length == 0) { // is it just white space?
            ret.value = token; // be sure to preserve length of whitespace
            ret.type = _TYPE_WHITESPACE_TOKEN; 
            ret.name = INTERMEDIATE_CONTENT;
        } else {
            ret.value = trimmed;
            ret.type = _TYPE_CONTENT_TOKEN;
            ret.name = INTERMEDIATE_CONTENT;
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
                ret = CONTROLIF_IF_TOKEN;
                break;
            case '#elseif':
                ret = CONTROLIF_ELSEIF_TOKEN;
                break;
            case '#else':
                ret = CONTROLIF_ELSE_TOKEN;
                break;
            case '#endif':
                ret = CONTROLIF_ENDIF_TOKEN;
                break;
            case '#for':
                ret = CONTROLFOR_FOR_TOKEN;
                break;
            case '#endfor':
                ret = CONTROLFOR_ENDFOR_TOKEN;
                break;
            case '#import':
                ret = CONTROL_IMPORT_TOKEN;
                break;
            case '#component':
                ret = CONTROL_COMPONENT_TOKEN;
                break;
            case '#props':
                ret = CONTROL_PROPS_TOKEN;
                break;
        }

        return ret;
    }

    validateToken(pos: iLexPosition, rule: iRule, input: string): iToken {
        let { start, end, next } = pos;
        let ret: iToken = Object.assign({}, BLANK_TOKEN);
        // determine validity of token:
        // 1. should have non-zero  token end position
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
            case CONTROLIF_IF_TOKEN:
                ret = _TYPE_CONTROL_IF_TOKEN;
                break;
            case CONTROLIF_ELSEIF_TOKEN:
                ret = _TYPE_CONTROL_IF_TOKEN;
                break;
            case CONTROLIF_ELSE_TOKEN:
                ret = _TYPE_CONTROL_IF_TOKEN;
                break;
            case CONTROLIF_ENDIF_TOKEN:
                ret = _TYPE_CONTROL_IF_TOKEN;
                break;
            case CONTROLFOR_FOR_TOKEN:
                ret = _TYPE_CONTROL_FOR_TOKEN;
                break;
            case CONTROLFOR_ENDFOR_TOKEN:
                ret = _TYPE_CONTROL_FOR_TOKEN;
                break;
            case CONTROL_IMPORT_TOKEN:
                ret = _TYPE_CONTROL_IMPORT_TOKEN;
                break;
            case CONTROL_COMPONENT_TOKEN:
                ret = _TYPE_CONTROL_COMPONENT_TOKEN;
                break;
            case CONTROL_PROPS_TOKEN:
                ret = _TYPE_CONTROL_PROPS_TOKEN;
                break;
        }
        return ret;
    }

    getTokenName(raw: string, rule: iRule): string {
        return rule.type == _TYPE_CONTROL_GENERIC_TOKEN ? this.getControlTokenName(raw) : this.getHTMLTokenName(raw)
    }

    getHTMLTokenName(raw: string): string {
        const startLength = HTML_RULE.start.length;
        const endLength = HTML_RULE.end.length;
        const stripped: string = raw.substring(startLength, raw.length - endLength).trim().replace('/', '');
        const splitString: Array<string> = stripped.split(' ');
        const name = splitString? splitString[0] : INVALID_TOKEN_NAME;
        return name;
    }
}