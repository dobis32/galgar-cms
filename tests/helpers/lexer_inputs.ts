import { iToken } from '../../src/interfaces/interfaces';
import { _TYPE_HTML_TOKEN, _TYPE_CONTENT_TOKEN, _TYPE_WHITESPACE_TOKEN } from '../../src/const/tokenTypes';
import { INTERMEDIATE_CONTENT } from '../../src/const/const';
export const TESTING_HTML_TABLE_AS_STRING: string = `<table><tr><td><h2>hello world!</h2></td></tr></table>`;
export const TESTING_HTML_TABLE_AS_TOKENS: Array<iToken> = [
    {
        type: _TYPE_HTML_TOKEN,
        value: '<table>',
        raw: '<table>',
        name: 'table',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '<tr>',
        raw: '<tr>',
        name: 'tr',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '<td>',
        raw: '<td>',
        name: 'td',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '<h2>',
        raw: '<h2>',
        name: 'h2',
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTENT_TOKEN,
        value: 'hello world!',
        raw: 'hello world!',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</h2>',
        raw: '</h2>',
        name: 'h2',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</td>',
        raw: '</td>',
        name: 'td',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</tr>',
        raw: '</tr>',
        name: 'tr',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</table>',
        raw: '</table>',
        name: 'table',
        enumerationMap: {}
    }
]
export const HEADING_WITH_CONTENT_AS_STRING: string = '<h1>Hello world!</h1>';
export const HEADING_WITH_CONTENT_AS_TOKENS: Array<iToken>  = [
    {
        type: _TYPE_HTML_TOKEN,
        value: '<h1>',
        raw: '<h1>',
        name: 'h1',
        enumerationMap: {}
    },{
        type: _TYPE_CONTENT_TOKEN,
        value: 'Hello world!',
        raw: 'Hello world!',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },{
        type: _TYPE_HTML_TOKEN,
        value: '</h1>',
        raw: '</h1>',
        name: 'h1',
        enumerationMap: {}
    },
];
