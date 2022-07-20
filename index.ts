import * as fs from 'fs';
import { ValueInjector } from './src/injector';
import { iRule, iLexPosition, iToken, iSymbolTable, iComponentReference, iSymbolContext } from './src/interfaces/interfaces';
import { _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, CONTROL_PROPS_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
import Lexer from './src/lexer';
import Grammar from './src/grammar';
import { HTML_RULE, CONTROL_RULE, INTERMEDIATE_CONTENT, BAD_TOKEN, INVALID_TOKEN_NAME, INVALID_INPUT_TOKEN } from './src/const/const';
const TESTING_HTML_TABLE_AS_STRING: string = `<table><tr><td><h2>hello world!</h2></td></tr></table>`;
const TESTING_HTML_TABLE_AS_TOKENS: Array<iToken> = [
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

const HEADING_WITH_CONTENT_AS_STRING: string = '<h1>Hello world!</h1>';
const grammar: Grammar = new Grammar([ HTML_RULE, CONTROL_RULE ]);
const lexer = new Lexer(HEADING_WITH_CONTENT_AS_STRING, grammar);
const input: string = lexer.getInput();
const rules: Array<iRule> = grammar.getRules();
const match1: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules);
const tok1: iToken = lexer.generateToken(match1.position, input, match1.matchedRule);
const adjustedInput: string = input.substring(tok1.raw.length);
const match2: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(adjustedInput, rules);
const tok2: iToken = lexer.generateToken(match2.position, adjustedInput, match2.matchedRule);
console.log(tok1);
console.log(tok2);