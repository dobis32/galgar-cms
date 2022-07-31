import * as fs from 'fs';
import { ValueInjector } from './src/injector';
import { iRule, iLexPosition, iToken, iSymbolTable, iComponentReference, iSymbolContext } from './src/interfaces/interfaces';
import { _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, CONTROL_PROPS_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
import Lexer from './src/lexer';
import Grammar from './src/grammar';
import { HTML_RULE, CONTROL_RULE, INTERMEDIATE_CONTENT, BAD_TOKEN, INVALID_TOKEN_NAME, INVALID_INPUT_TOKEN } from './src/const/const';
import { AlgebraSolver } from './src/bool';
const ctx1: iSymbolContext = {
    aliases: {
        foo: 'bar',
        fizz: false
    },
    props: {
        bar: 456,
        buzz: -123
    }
};
const truthyExpression: string = `foo`;
const st: SymbolTable = new SymbolTable([ ctx1 ]);
const solver: AlgebraSolver = new AlgebraSolver(st, {});
console.log(solver.solveSimpleExpression(truthyExpression))