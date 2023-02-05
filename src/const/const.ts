import * as _path from 'path';
import { iLexPosition, iRule, iSymbolTable, iToken } from '../interfaces/interfaces';
import { _TYPE_INVALID_INPUT, _TYPE_BAD_TOKEN, _TYPE_EOF_TOKEN, _TYPE_HTML_TOKEN, _TYPE_INJECTION_TOKEN, _TYPE_BLANK_TOKEN, _TYPE_WHITESPACE_TOKEN, _TYPE_CONTROL_GENERIC_TOKEN, _TOKEN_TYPES_MAP } from './tokenData';

const localdir = process.cwd();

// strings
export const _COMPONENTS_DIRECTORY: string = ['D:','galgar-cms','user_components'].join(_path.sep);
export const COMPONENT_FILE_PATH: string = [localdir, 'user_components', ''].join(_path.sep);
export const RENDERED_FILE_PATH: string = [localdir,'public', 'rendered', ''].join(_path.sep);
export const FILE_EXTENSION_GGD: string = '.ggd';
export const FILE_EXTENSION_HTML: string = '.html';
export const ALGEBRAIC_AND: string = '&';
export const ALGEBRAIC_OR: string = '|';
export const ALGEBRAIC_NOT: string = 'NOT';

// arrays
export const SELF_CLOSING_TAG_TYPES: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export const CLOSING_EXEMPT_TAGS: Array<string> = ['meta'];

// rules
export const BLANK_RULE: iRule = { type: _TYPE_BLANK_TOKEN, start: '_$BLANK_RULE$_', end: '_$BLANK_RULE$_' };
export const HTML_RULE: iRule = { type: _TYPE_HTML_TOKEN, start: '<', end: '>' };
export const INJECT_RULE: iRule = { type: _TYPE_INJECTION_TOKEN, start: '{{', end: '}}' };
export const CONTROL_RULE: iRule = { type: _TYPE_CONTROL_GENERIC_TOKEN, start: '[[', end: ']]' };
export const CONTROL_IF_RULE: iRule = { type: _TOKEN_TYPES_MAP.IF, start:'#', end: 'IF' }
export const CONTROL_ELSEIF_RULE: iRule = { type: _TOKEN_TYPES_MAP.IF, start:'#', end: 'ELSEIF' };
export const CONTROL_ELSE_RULE: iRule = { type: _TOKEN_TYPES_MAP.IF, start:'#', end: 'ELSE' };
export const CONTROL_FOR_RULE: iRule = { type: _TOKEN_TYPES_MAP.FOR, start:'#', end: 'FOR' };
export const CONTROL_END_RULE: iRule = { type: _TOKEN_TYPES_MAP.FOR, start:'#', end: 'END' };
export const CONTROL_COMPONENT_RULE: iRule = { type: _TOKEN_TYPES_MAP.COMPONENT, start:'#', end: 'COMPONENT' };
export const CONTROL_PROPS_RULE: iRule = { type: _TOKEN_TYPES_MAP.PROPS, start:'#', end: 'PROPS' };

// tokens
export const BLANK_TOKEN: iToken = { type: _TOKEN_TYPES_MAP.BLANK, raw: '_$BLANK_TOKEN$$_', value: '_$BLANK_TOKEN$$_', name: '_$BLANK_TOKEN$_', enumerationMap: {} };
export const BAD_TOKEN: iToken = { type: _TOKEN_TYPES_MAP.BAD, raw: '_$BLANK_TOKEN$$_', value: '_$BAD_TOKEN$_', name: '_$BAD_TOKEN$_', enumerationMap: {} };
export const EOF_TOKEN: iToken = { type: _TOKEN_TYPES_MAP.EOF, raw: '_$BLANK_TOKEN$$_', value: '_$EOF_TOKEN$_', name: '_$EOF_TOKEN$_', enumerationMap: {} };
export const INVALID_INPUT_TOKEN: iToken = { type: _TOKEN_TYPES_MAP.INVALID, raw: '_$BLANK_TOKEN$$_', value: '_$INVALID_TOKEN$_', name: '_$INVALID_TOKEN$_', enumerationMap: {} };

// lex positions
export const INVALID_POSITION: iLexPosition = { start: -1, end: -1, next: -1 }

// numbers
export const CONTROL_FOR_ALIAS_INDEX: number = 1;
export const CONTROL_FOR_PREPOSITION_INDEX: number = 2;
export const CONTROL_FOR_SYMBOL_INDEX: number = 3;

// functions
export const FN_CLONE_TOKEN = (t: iToken) => {
    const clone = Object.assign({}, t);
    clone.enumerationMap = Object.assign({}, t.enumerationMap);
    return clone;
}

export const FN_MAKE_PATH_ABSOLUTE = (absoluteBasePath: string, path: string, relativeTo?: string) => {
    if (relativeTo == undefined) relativeTo = '';
    const absoluteTokens: Array<string> = [];
    const pathTokens: Array<string> = path.replaceAll('/', _path.sep).split(_path.sep).map((s:string) => s.trim());
    let targetResourceToken: string = pathTokens[pathTokens.length - 1];
    const expectedExtensionIndex: number = targetResourceToken.length - FILE_EXTENSION_GGD.length - 1;
    if (targetResourceToken.indexOf(FILE_EXTENSION_GGD) != expectedExtensionIndex) targetResourceToken += '.ggd';
    for (let i = 0; i < pathTokens.length; i++) {
        const tok: string = pathTokens[i];
        if (tok == '@' && i > 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): found invalid directory base reference ("@")');
        else if (tok == '..' && absoluteTokens.length == 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): invalid parent directory; check your path references and try again');
        else if (tok == '@') absoluteBasePath.split(_path.sep).forEach((t: string) => {
            absoluteTokens.push(t);
        });
        else if (tok == '.' && i == 0) relativeTo.split(_path.sep).forEach((t:string) => absoluteTokens.push(t));
        else if (tok == '..') absoluteTokens.shift();
        else if (tok != '.') absoluteTokens.push(tok);
    }
    return absoluteTokens.join(_path.sep);
}

export const FN_GET_PROPS_ARRAY = (propsToken: iToken) => {
    const temp: Array<string> = propsToken.value.split(' '); // [[ #PROPS msg1,msg2, data ]]
    temp.shift();
    temp.shift();
    temp.pop();
    const props: Array<string> = temp.join('').split(',').map((s: string) => s.trim()); // [ msg1,msg2 ]
    return props;
}

export const _DEV_SYMBOLTABLE: iSymbolTable = {
    document: {
        doctype: 'html',
        language: 'en',
        metaAttributes: [
           'charset="UTF-8"',
           'http-equiv="X-UA-Compatible" content="IE=edge"',
           'name="viewport" content="width=device-width, initial-scale=1.0"'
        ],
        title: 'my webpage template'
    },
    styles: {
        inboxWrapper: 'style="border: 2px solid #000; margin: 30px auto; padding: 20px 40px; width: 800px;"'
    },
    inboxes: [
        {
            inboxName: 'inbox1',
            messages: [
                { from: 'foo1@bar.com', recipients: ['hank.hill@stricklandpropane.com', 'spongebob.squarepants@bikinibottom.gov'], subject: 'some topic' },
                { from: 'foo2@bar.com', recipients: ['hank.hill@stricklandpropane.com'], subject: 'some other topic' }
            ],
            private: true
        },
        {
            inboxName: 'inbox2',
            messages: [
                { from: 'fizz1@buzz.com', recipients: ['hank.hill@stricklandpropane.com'], subject: 'messageA' },
                { from: 'fizz2@buzz.com', recipients: ['hank.hill@stricklandpropane.com'], subject: 'messageB' }
            ],
            private: false
        }
    ]
};