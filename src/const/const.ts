import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { iLexPosition, iRule, iSymbolTable, iToken } from '../interfaces/interfaces';
import { _TYPE_WHITESPACE_TOKEN, _TYPE_CONTROL_GENERIC_TOKEN, CONTROLFOR_FOR_TOKEN, CONTROL_PROPS_TOKEN, CONTROLFOR_ENDFOR_TOKEN, CONTROLIF_ELSE_TOKEN, CONTROLIF_ELSEIF_TOKEN, CONTROLIF_IF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_BAD_TOKEN, _TYPE_EOF_TOKEN, _TYPE_HTML_TOKEN, _TYPE_INJECTION_TOKEN, CONTROL_COMPONENT_TOKEN } from '../const/tokenTypes';
import { _TYPE_BLANK_TOKEN } from './tokenTypes';

const localdir = process.cwd();

export const COMPONENT_FILE_PATH: string = localdir + '\\user_components\\';
export const RENDERED_FILE_PATH: string = localdir + '\\rendered\\';
export const SELF_CLOSING_TAG_TYPES: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export const CLOSING_EXEMPT_TAGS: Array<string> = ['meta'];
export const BLANK_RULE: iRule = { type: _TYPE_BLANK_TOKEN, start: '_$BLANK_RULE$_', end: '_$BLANK_RULE$_' };
export const HTML_RULE: iRule = { type: _TYPE_HTML_TOKEN, start: '<', end: '>' };
export const INJECT_RULE: iRule = { type: _TYPE_INJECTION_TOKEN, start: '{{', end: '}}' };
export const CONTROL_RULE: iRule = { type: _TYPE_CONTROL_GENERIC_TOKEN, start: '[[', end: ']]' };
export const CONTROL_IF_RULE: iRule = { type: CONTROLIF_IF_TOKEN, start:'#', end: 'IF' }
export const CONTROL_ELSEIF_RULE: iRule = { type: CONTROLIF_ELSEIF_TOKEN, start:'#', end: 'ELSEIF' };
export const CONTROL_ELSE_RULE: iRule = { type: CONTROLIF_ELSE_TOKEN, start:'#', end: 'ELSE' };
export const CONTROL_FOR_RULE: iRule = { type: CONTROLFOR_FOR_TOKEN, start:'#', end: 'FOR' };
export const CONTROL_END_RULE: iRule = { type: CONTROLFOR_ENDFOR_TOKEN, start:'#', end: 'END' };
export const CONTROL_COMPONENT_RULE: iRule = { type: CONTROL_COMPONENT_TOKEN, start:'#', end: 'COMPONENT' };
export const CONTROL_PROPS_RULE: iRule = { type: CONTROL_PROPS_TOKEN, start:'#', end: 'PROPS' };
export const BLANK_TOKEN: iToken = { type: _TYPE_BLANK_TOKEN, raw: '_$BLANK_TOKEN$$_', value: '_$BLANK_TOKEN$$_', name: '_$BLANK_TOKEN$_', enumerationMap: {} };
export const BAD_TOKEN: iToken = { type: _TYPE_BAD_TOKEN, raw: '_$BLANK_TOKEN$$_', value: '_$BAD_TOKEN$_', name: '_$BAD_TOKEN$_', enumerationMap: {} };
export const EOF_TOKEN: iToken = { type: _TYPE_EOF_TOKEN, raw: '_$BLANK_TOKEN$$_', value: '_$EOF_TOKEN$_', name: '_$EOF_TOKEN$_', enumerationMap: {} };
export const INVALID_POSITION: iLexPosition = { start: -1, end: -1, next: -1 }
export const INVALID_INPUT_TOKEN: iToken = { type: _TYPE_INVALID_INPUT, raw: '_$BLANK_TOKEN$$_', value: '_$INVALID_TOKEN$_', name: '_$INVALID_TOKEN$_', enumerationMap: {} };
export const INTERMEDIATE_CONTENT: string = '_$INTERMEDIATE_CONTENT$_';
export const WHITESPACE_CONTENT: string = '_$WHITESPACE_CONTENT$_';
export const INVALID_TOKEN_NAME: string = '_$INVALID_TOKEN_NAME$_';
export const FILE_EXTENSION_GGD: string = '.ggd';
export const FILE_EXTENSION_HTML: string = '.html';
export const ALGEBRAIC_AND: string = '&';
export const ALGEBRAIC_OR: string = '|';
export const ALGEBRAIC_NOT: string = 'NOT';
export const CONTROL_FOR_ALIAS_INDEX: number = 1;
export const CONTROL_FOR_PREPOSITION_INDEX: number = 2;
export const CONTROL_FOR_SYMBOL_INDEX: number = 3;
export const FN_CLONE_TOKEN = (t: iToken) => {
    const clone = Object.assign({}, t);
    clone.enumerationMap = Object.assign({}, t.enumerationMap);
    return clone;
}
export const FN_GET_PROPS_ARRAY = (propsToken: iToken) => {
    const temp: Array<string> = propsToken.value.split(' '); // [[ #PROPS msg1,msg2, data ]]
    temp.shift();
    temp.shift();
    temp.pop();
    const props: Array<string> = temp.join('').split(',').map((s: string) => s.trim()); // [ msg1,msg2 ]
    return props;
}
// export const FN_SORT_BY_REF_QTY = (a: iComponentReference, b: iComponentReference, ) => {
//     if ( a.referenceQuantity < b.referenceQuantity ) {
//       return -1;
//     } else if ( a.referenceQuantity > b.referenceQuantity ) {
//       return 1;
//     } else return 0;
// }
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