import { EOF_TOKEN, BLANK_RULE, BLANK_TOKEN, CONTROL_PROPS_RULE, CONTROL_RULE, HTML_RULE, INVALID_INPUT_TOKEN } from './const/const';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP } from './const/tokenData';
export default class Lexer {
    input;
    grammar;
    position = 0;
    constructor(input, grammar) {
        this.input = input.trim();
        this.grammar = grammar;
    }
    getGrammar() {
        return this.grammar;
    }
    setInput(input) {
        this.input = input;
        this.position = 0;
    }
    getInput() {
        return this.input;
    }
    lex() {
        const rules = this.grammar.getRules();
        let start = this.position;
        let offsetInput = `${this.input}`.substring(start);
        let ret = Object.assign({}, BLANK_TOKEN);
        if (start == this.input.length - 1 || offsetInput.trim().length == 0)
            return ret = EOF_TOKEN; // reached EOF or nothing to lex
        const { position, matchedRule } = this.getNextLexPosition(offsetInput, rules);
        ret = this.generateToken(position, offsetInput, matchedRule);
        if (position.start == -1 || ret.type == _TOKEN_TYPES_MAP.INVALID)
            throw new Error('[ GALGAR ERROR ] lex(): failed to lex; invalid input');
        else
            this.position += ret.raw.length;
        return ret;
    }
    generatePropsMap(token) {
        if (token.type != _TOKEN_TYPES_MAP.PROPS)
            throw new Error('[ GALGAR ERROR ] generatePropsMap(): input token was not a #PROPS token');
        const propsArray = [];
        // get token value
        const tokValue = token.value;
        // get everything in between #PROPS and ]]
        const tokRuleEnd = CONTROL_RULE.end;
        tokValue
            .split(tokRuleEnd)[0] // get rid of ]]
            .split(CONTROL_PROPS_RULE.start + CONTROL_PROPS_RULE.end)[1] // get rid of #PROPS
            .split(',').map((s) => s.trim()).forEach((s) => {
            if (s.trim().length > 0)
                propsArray.push(s);
        });
        return propsArray;
    }
    getNextLexPosition(input, rules, offset) {
        if (offset == undefined)
            offset = 0;
        const offsetInput = input.substring(offset);
        const position = { start: Number.POSITIVE_INFINITY, end: -1, next: -1 };
        let matchedRule = BLANK_RULE;
        for (let r of rules) {
            const tempPos = this.getRulePosition(offsetInput, r);
            if (tempPos.start > -1 && tempPos.start < position.start) {
                matchedRule = r;
                position.start = tempPos.start + offset;
                position.end = tempPos.end + offset;
                position.next = tempPos.next + offset;
            }
        }
        return { position, matchedRule };
    }
    getRulePosition(input, r) {
        const ret = { start: -1, end: -1, next: -1 };
        const s = r.start;
        const e = r.end;
        ret.start = input.indexOf(s);
        ret.end = input.indexOf(e);
        const offset = 1;
        const next = input.substring(ret.start + offset).indexOf(s);
        ret.next = next;
        if (next >= 0)
            ret.next += 1;
        return ret;
    }
    generateToken(pos, input, matchedRule) {
        let ret = Object.assign({}, BLANK_TOKEN);
        let { start } = pos;
        if (start == -1)
            ret = INVALID_INPUT_TOKEN; // no token found
        else if (start != 0)
            ret = this.tokenizeIntermediateContent(start, input); // white-space token or content token found
        else
            ret = this.validateToken(pos, matchedRule, input); // start position is zero, token found
        if (ret == BLANK_TOKEN)
            throw new Error('[ GALGAR ERROR ] generateToken(): failed to generate token');
        return ret;
    }
    tokenizeIntermediateContent(endIndex, input) {
        let ret = Object.assign({}, BLANK_TOKEN);
        const token = input.substring(0, endIndex);
        const trimmed = token.split('\t').filter((t) => t.length > 0).join('').trim();
        if (trimmed.length == 0) { // is it just white space?
            ret.value = trimmed; // be sure to preserve length of whitespace
            ret.type = _TOKEN_TYPES_MAP.WHITESPACE;
            ret.name = _TOKEN_NAMES_MAP.WHITESPACE;
        }
        else {
            ret.value = trimmed;
            ret.type = _TOKEN_TYPES_MAP.CONTENT;
            ret.name = _TOKEN_NAMES_MAP.CONTENT;
        }
        ;
        ret.raw = token;
        return ret;
    }
    getControlTokenName(input) {
        const trimmed = input.trim();
        const name = trimmed.substring(CONTROL_RULE.start.length, trimmed.length - CONTROL_RULE.end.length).trim().split(' ')[0].toLowerCase();
        return this.getMappedControlTokenName(name);
    }
    getMappedControlTokenName(name) {
        let ret = '';
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
    validateToken(pos, rule, input) {
        let { start, end, next } = pos;
        let ret = Object.assign({}, BLANK_TOKEN);
        // determine validity of token:
        // 1. should have non-zero token end position
        // 2. and the next token start should come after said token end position
        if (end < 0 || (next < end && next != -1)) { // token is invalid
            ret = INVALID_INPUT_TOKEN;
        }
        else { // token is valid
            const raw = input.substring(start, end + (rule.end.length));
            const value = raw.trim();
            const name = this.getTokenName(raw, rule);
            const type = rule == CONTROL_RULE ? this.identifyControlType(name) : rule.type;
            const token = {
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
    identifyControlType(tokenName) {
        let ret = '';
        switch (tokenName) {
            case _TOKEN_NAMES_MAP.IF:
                ret = _TOKEN_TYPES_MAP.IF;
                break;
            case _TOKEN_NAMES_MAP.ELSEIF:
                ret = _TOKEN_TYPES_MAP.IF;
                ;
                break;
            case _TOKEN_NAMES_MAP.ELSE:
                ret = _TOKEN_TYPES_MAP.IF;
                ;
                break;
            case _TOKEN_NAMES_MAP.ENDIF:
                ret = _TOKEN_TYPES_MAP.IF;
                ;
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
    getTokenName(raw, rule) {
        return rule.type == _TOKEN_TYPES_MAP.GENERIC ? this.getControlTokenName(raw) : this.getHTMLTokenName(raw);
    }
    getHTMLTokenName(raw) {
        const startLength = HTML_RULE.start.length;
        const endLength = HTML_RULE.end.length;
        const stripped = raw.substring(startLength, raw.length - endLength).trim().replace('/', '');
        const splitString = stripped.split(' ');
        const name = splitString ? splitString[0] : Object.assign({}, _TOKEN_NAMES_MAP.INVALID);
        return name;
    }
}
