import { _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN } from './src/const/tokenTypes';
import Lexer from './src/lexer';
import Grammar from './src/grammar';
import { HTML_RULE, CONTROL_RULE, INTERMEDIATE_CONTENT } from './src/const/const';
const TESTING_HTML_TABLE_AS_STRING = `<table><tr><td><h2>hello world!</h2></td></tr></table>`;
const TESTING_HTML_TABLE_AS_TOKENS = [
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
        name: '',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</td>',
        raw: '</td>',
        name: '',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</tr>',
        raw: '</tr>',
        name: '',
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '</table>',
        raw: '</table>',
        name: '',
        enumerationMap: {}
    }
];
const grammar = new Grammar([HTML_RULE, CONTROL_RULE]);
const ORIGINAL_INPUT = TESTING_HTML_TABLE_AS_STRING;
const lexer = new Lexer(ORIGINAL_INPUT, grammar);
const input = TESTING_HTML_TABLE_AS_STRING;
const rules = grammar.getRules();
const result1 = lexer.getNextLexPosition(input, rules);
const result2 = lexer.getNextLexPosition(input, rules, result1.position.next - 1);
const pos = lexer.getRulePosition(input.substring(result1.position.next), HTML_RULE);
