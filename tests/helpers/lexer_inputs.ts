import { iToken } from '../../src/interfaces/interfaces';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP } from '../../src/const/tokenData';
export const TESTING_HTML_TABLE_AS_STRING: string = `<table><tr><td><h2>hello world!</h2></td></tr></table>`;
export const TESTING_HTML_TABLE_AS_TOKENS: Array<iToken> = [
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '<table>',
        raw: '<table>',
        name: 'table',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '<tr>',
        raw: '<tr>',
        name: 'tr',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '<td>',
        raw: '<td>',
        name: 'td',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '<h2>',
        raw: '<h2>',
        name: 'h2',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'hello world!',
        raw: 'hello world!',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '</h2>',
        raw: '</h2>',
        name: 'h2',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '</td>',
        raw: '</td>',
        name: 'td',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '</tr>',
        raw: '</tr>',
        name: 'tr',
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '</table>',
        raw: '</table>',
        name: 'table',
        enumerationMap: {}
    }
]
export const HEADING_WITH_CONTENT_AS_STRING: string = '<h1>Hello world!</h1>';
export const HEADING_WITH_CONTENT_AS_TOKENS: Array<iToken>  = [
    {
        type: _TOKEN_TYPES_MAP.HTML,
        value: '<h1>',
        raw: '<h1>',
        name: 'h1',
        enumerationMap: {}
    },{
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'Hello world!',
        raw: 'Hello world!',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },{
        type: _TOKEN_TYPES_MAP.HTML,
        value: '</h1>',
        raw: '</h1>',
        name: 'h1',
        enumerationMap: {}
    },
];
