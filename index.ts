import * as fs from 'fs';
import { ValueInjector } from './src/injector';
import { iEnumerationMap, iRule, iLexPosition, iToken, iSymbolTable, iComponentReference, iSymbolContext } from './src/interfaces/interfaces';
import { _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, CONTROL_PROPS_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
import Lexer from './src/lexer';
import Grammar from './src/grammar';
import { ALGEBRAIC_OR, ALGEBRAIC_AND, ALGEBRAIC_NOT, HTML_RULE, CONTROL_RULE, INTERMEDIATE_CONTENT, BAD_TOKEN, INVALID_TOKEN_NAME, INVALID_INPUT_TOKEN } from './src/const/const';
import { AlgebraSolver } from './src/bool';

interface iTestPackage {
    component: iComponentReference;
    symbolTableStack: Array<iSymbolContext>;
}

const TEST_COMPONENT_DYNAMIC_HEADER: iComponentReference = {
    name: 'TEST COMPONENT DYNAMIC HEADER',
    raw: '<h1>{{ msg }}</h1>',
    tokens: [
        {
            type: _TYPE_HTML_TOKEN,
            value: '<h1>',
            raw: '<h1>',
            name: 'h1',
            enumerationMap: {}
        },
        {
            type: _TYPE_CONTENT_TOKEN,
            value: '{{ msg }}',
            raw: '{{ msg }}',
            name: INTERMEDIATE_CONTENT,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: '</h1>',
            raw: '</h1>',
            name: 'h1',
            enumerationMap: {}
        }
    ],
    props: [ 'msg' ]
}

const TEST_PACKAGE_DYNAMIC_HEADER: iTestPackage = {
    component: TEST_COMPONENT_DYNAMIC_HEADER,
    symbolTableStack: [{ aliases: {}, props: { msg: 'this is a message ' } }]
}

const ctxStack: Array<iSymbolContext> = TEST_PACKAGE_DYNAMIC_HEADER.symbolTableStack;
const st: SymbolTable = new SymbolTable(ctxStack);

const result: iToken = ValueInjector.injectTokenSymbols(TEST_COMPONENT_DYNAMIC_HEADER.tokens[1], st);

// const result: any = st.resolveSymbol('msg');
