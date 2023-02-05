import * as _path from 'path';
import { _TYPE_HTML_TOKEN, _TYPE_INJECTION_TOKEN, _TYPE_BLANK_TOKEN, _TYPE_CONTROL_GENERIC_TOKEN, _TOKEN_TYPES_MAP } from './tokenData';
const localdir = process.cwd();
// strings
export const _COMPONENTS_DIRECTORY = ['D:', 'galgar-cms', 'user_components'].join(_path.sep);
export const COMPONENT_FILE_PATH = [localdir, 'user_components', ''].join(_path.sep);
export const RENDERED_FILE_PATH = [localdir, 'public', 'rendered', ''].join(_path.sep);
export const FILE_EXTENSION_GGD = '.ggd';
export const FILE_EXTENSION_HTML = '.html';
export const ALGEBRAIC_AND = '&';
export const ALGEBRAIC_OR = '|';
export const ALGEBRAIC_NOT = 'NOT';
// arrays
export const SELF_CLOSING_TAG_TYPES = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export const CLOSING_EXEMPT_TAGS = ['meta'];
// rules
export const BLANK_RULE = { type: _TYPE_BLANK_TOKEN, start: '_$BLANK_RULE$_', end: '_$BLANK_RULE$_' };
export const HTML_RULE = { type: _TYPE_HTML_TOKEN, start: '<', end: '>' };
export const INJECT_RULE = { type: _TYPE_INJECTION_TOKEN, start: '{{', end: '}}' };
export const CONTROL_RULE = { type: _TYPE_CONTROL_GENERIC_TOKEN, start: '[[', end: ']]' };
export const CONTROL_IF_RULE = { type: _TOKEN_TYPES_MAP.IF, start: '#', end: 'IF' };
export const CONTROL_ELSEIF_RULE = { type: _TOKEN_TYPES_MAP.IF, start: '#', end: 'ELSEIF' };
export const CONTROL_ELSE_RULE = { type: _TOKEN_TYPES_MAP.IF, start: '#', end: 'ELSE' };
export const CONTROL_FOR_RULE = { type: _TOKEN_TYPES_MAP.FOR, start: '#', end: 'FOR' };
export const CONTROL_END_RULE = { type: _TOKEN_TYPES_MAP.FOR, start: '#', end: 'END' };
export const CONTROL_COMPONENT_RULE = { type: _TOKEN_TYPES_MAP.COMPONENT, start: '#', end: 'COMPONENT' };
export const CONTROL_PROPS_RULE = { type: _TOKEN_TYPES_MAP.PROPS, start: '#', end: 'PROPS' };
// tokens
export const BLANK_TOKEN = { type: _TOKEN_TYPES_MAP.BLANK, raw: '_$BLANK_TOKEN$$_', value: '_$BLANK_TOKEN$$_', name: '_$BLANK_TOKEN$_', enumerationMap: {} };
export const BAD_TOKEN = { type: _TOKEN_TYPES_MAP.BAD, raw: '_$BLANK_TOKEN$$_', value: '_$BAD_TOKEN$_', name: '_$BAD_TOKEN$_', enumerationMap: {} };
export const EOF_TOKEN = { type: _TOKEN_TYPES_MAP.EOF, raw: '_$BLANK_TOKEN$$_', value: '_$EOF_TOKEN$_', name: '_$EOF_TOKEN$_', enumerationMap: {} };
export const INVALID_INPUT_TOKEN = { type: _TOKEN_TYPES_MAP.INVALID, raw: '_$BLANK_TOKEN$$_', value: '_$INVALID_TOKEN$_', name: '_$INVALID_TOKEN$_', enumerationMap: {} };
// lex positions
export const INVALID_POSITION = { start: -1, end: -1, next: -1 };
// numbers
export const CONTROL_FOR_ALIAS_INDEX = 1;
export const CONTROL_FOR_PREPOSITION_INDEX = 2;
export const CONTROL_FOR_SYMBOL_INDEX = 3;
// functions
export const FN_CLONE_TOKEN = (t) => {
    const clone = Object.assign({}, t);
    clone.enumerationMap = Object.assign({}, t.enumerationMap);
    return clone;
};
export const FN_MAKE_PATH_ABSOLUTE = (absoluteBasePath, path, relativeTo) => {
    if (relativeTo == undefined)
        relativeTo = '';
    const absoluteTokens = [];
    const pathTokens = path.replaceAll('/', _path.sep).split(_path.sep).map((s) => s.trim());
    let targetResourceToken = pathTokens[pathTokens.length - 1];
    const expectedExtensionIndex = targetResourceToken.length - FILE_EXTENSION_GGD.length - 1;
    if (targetResourceToken.indexOf(FILE_EXTENSION_GGD) != expectedExtensionIndex)
        targetResourceToken += '.ggd';
    for (let i = 0; i < pathTokens.length; i++) {
        const tok = pathTokens[i];
        if (tok == '@' && i > 0)
            throw new Error('[ GALGAR ERROR ] makePathAbsolute(): found invalid directory base reference ("@")');
        else if (tok == '..' && absoluteTokens.length == 0)
            throw new Error('[ GALGAR ERROR ] makePathAbsolute(): invalid parent directory; check your path references and try again');
        else if (tok == '@')
            absoluteBasePath.split(_path.sep).forEach((t) => {
                absoluteTokens.push(t);
            });
        else if (tok == '.' && i == 0)
            relativeTo.split(_path.sep).forEach((t) => absoluteTokens.push(t));
        else if (tok == '..')
            absoluteTokens.shift();
        else if (tok != '.')
            absoluteTokens.push(tok);
    }
    return absoluteTokens.join(_path.sep);
};
export const FN_GET_PROPS_ARRAY = (propsToken) => {
    const temp = propsToken.value.split(' '); // [[ #PROPS msg1,msg2, data ]]
    temp.shift();
    temp.shift();
    temp.pop();
    const props = temp.join('').split(',').map((s) => s.trim()); // [ msg1,msg2 ]
    return props;
};
export const _DEV_SYMBOLTABLE = {
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
