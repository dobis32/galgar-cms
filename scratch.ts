import * as fs from 'fs';
import { ValueInjector } from './src/injector';
import { iTestPackage, iEnumerationMap, iRule, iLexPosition, iToken, iSymbolTable, iComponentReference, iSymbolContext } from './src/interfaces/interfaces';
import { _TYPE_CONTROL_IF_TOKEN, CONTROLIF_ELSE_TOKEN, CONTROLIF_IF_TOKEN, CONTROLIF_ENDIF_TOKEN, _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, CONTROL_PROPS_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
import Lexer from './src/lexer';
import Grammar from './src/grammar';
import { ALGEBRAIC_OR, ALGEBRAIC_AND, ALGEBRAIC_NOT, HTML_RULE, CONTROL_RULE, INTERMEDIATE_CONTENT, BAD_TOKEN, INVALID_TOKEN_NAME, INVALID_INPUT_TOKEN } from './src/const/const';
import { AlgebraSolver } from './src/booleanSolver';
import { TokenIdentifier } from './src/tokenIdentifier';
import { fileURLToPath } from 'url';
import * as _path from 'path';
import { Galgar } from './src/galgar';
import * as _fs from 'fs';
import TokenParser from './src/tokenParser';
// const ALIAS_1_1_VALUE: string = '';
// const ALIAS_1_1_NAME: string = 'alias1';
// const ALIAS_1_2_VALUE: number = 456;
// const ALIAS_1_2_NAME: string = 'alias2';
// const ALIAS_2_1_VALUE: string = 'asdf';
// const ALIAS_2_1_NAME: string = 'alias1';
// const ALIAS_2_2_VALUE: number = 123;
// const ALIAS_2_2_NAME: string = 'alias2';
// const PROPS_2_1_VALUE: boolean = true;
// const PROPS_2_1_NAME: string = 'props1';
// const PROPS_2_2_VALUE: boolean = false;
// const PROPS_2_2_NAME: string = 'props2';
// const ctx1Aliases: { [key: string]: any } = {};
// const ctx1Props: { [key: string]: any } = {};
// const ctx2Aliases: { [key: string]: any } = {};
// const ctx2Props: { [key: string]: any } = {};
// let initialSymbolContext1: iSymbolContext;
// let initialSymbolContext2: iSymbolContext;
// let initialSymbolTable: SymbolTable;
// let enumMap: iEnumerationMap;
// let solver: AlgebraSolver;
// let simpleTruthyExpression: string = `${PROPS_2_1_NAME}`;
// let complexTruthyExpression: string = `${PROPS_2_1_NAME} ${ALGEBRAIC_OR} ${PROPS_2_2_NAME}`;
// let simpleFalsyExpression: string = `${PROPS_2_2_NAME}`;
// let complexFalsyExpression: string = `${PROPS_2_1_NAME} ${ALGEBRAIC_AND} ${PROPS_2_2_NAME}`;
// ctx2Aliases[ALIAS_2_1_NAME] = ALIAS_2_1_VALUE;
// ctx2Aliases[ALIAS_2_2_NAME] = ALIAS_2_2_VALUE;
// ctx2Props[PROPS_2_1_NAME] = PROPS_2_1_VALUE;
// ctx2Props[PROPS_2_2_NAME] = PROPS_2_2_VALUE;
// ctx1Aliases[ALIAS_1_1_NAME] = ALIAS_1_1_VALUE;
// ctx1Aliases[ALIAS_1_2_NAME] = ALIAS_1_2_VALUE;
// enumMap = {};
// initialSymbolContext1 = { aliases: ctx1Aliases, props: ctx1Props };
// initialSymbolContext2 = { aliases: ctx2Aliases, props: ctx2Props };
// initialSymbolTable = new SymbolTable([ initialSymbolContext1, initialSymbolContext2 ]);
// solver = new AlgebraSolver(initialSymbolTable, enumMap);
//const result: boolean = solver.solveSimpleExpression(truthyExpression1);

export const TEST_TOKENS_NESTED_IF: Array<iToken> = [
    {
        type: _TYPE_CONTROL_PROPS_TOKEN,
        value: '[[ #PROPS bool1, bool2, bool3 ]]',
        raw: '[[ #PROPS bool1, bool2, bool3 ]]',
        name: CONTROL_PROPS_TOKEN,
        enumerationMap: {}
    }, 
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #IF bool1 ]]',
        raw: '[[ #IF bool1 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTENT_TOKEN,
        value: 'Bool1True',
        raw: 'Bool1True',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #IF bool2 ]]',
        raw: '[[ #IF bool2 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTENT_TOKEN,
        value: 'Bool2True',
        raw: 'Bool2True',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #ELSE ]]',
        raw: '[[ #ELSE ]]',
        name: CONTROLIF_ELSE_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: 'Bool2False',
        raw: 'Bool2False',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #IF bool3 ]]',
        raw: '[[ #IF bool3 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: 'Bool3True',
        raw: 'Bool3True',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTROL_IF_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    }
]

export const TEST_COMPONENT_NESTED_IF: iComponentReference = {
    name: "TEST_COMPONENT_NESTED_IF",
    raw: "",
    path: 'SOME_PATH',
    props: [ 'bool1', 'bool2', 'bool3'],
    tokens: TEST_TOKENS_NESTED_IF,
}

export const TEST_PACKAGE_NESTED_IF: iTestPackage = {
    component: TEST_COMPONENT_NESTED_IF,
    symbolTableStack: [ { aliases: {}, props: { bool1: true, bool2: false, bool3: true } } ],
    expectedResult: [
        {
            type: _TYPE_CONTENT_TOKEN,
            value: 'Bool1True',
            raw: 'Bool1True',
            name: INTERMEDIATE_CONTENT,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: 'Bool2False',
            raw: 'Bool2False',
            name: CONTROLIF_IF_TOKEN,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: 'Bool3True',
            raw: 'Bool3True',
            name: CONTROLIF_IF_TOKEN,
            enumerationMap: {}
        }
    ]
}



const __filename = fileURLToPath(import.meta.url);
const __dirname = _path.dirname(__filename);
//const directoryTokens = ['C:', 'code', 'galgar-cms', 'user_components']; // lappy
const directoryTokens = ['D:', 'galgar-cms', 'user_components']; // desktop
const _COMPONENTS_DIRECTORY: string = directoryTokens.join(_path.sep);
const grammar: Grammar = new Grammar([ HTML_RULE, CONTROL_RULE ]);
const _galgar: Galgar = new Galgar(grammar, _COMPONENTS_DIRECTORY);


const stData: { [key:string]: any } = {
    "foo": "fizzbuzz",
    "bar": 123,
    "fizz": "mystring",
    "buzz": "otherstring"
};

TEST_PACKAGE_NESTED_IF

const testPack: iTestPackage = TEST_PACKAGE_NESTED_IF;
const tokens: Array<iToken> = testPack.component.tokens.map((t:iToken)=> t);
console.log('TEST IF STATEMENT....');
const props: Array<string> = testPack.component.props.map((s:string) => s);
const st: SymbolTable = new SymbolTable(testPack.symbolTableStack);
const parser: TokenParser = new TokenParser(tokens, st, props, {});
const isControl: boolean = parser.tokenIsControlToken({
    type: _TYPE_HTML_TOKEN,
    value: '[[ #PROPS bool1, bool2, bool3 ]]',
    raw: '[[ #PROPS bool1, bool2, bool3 ]]',
    name: CONTROL_PROPS_TOKEN,
    enumerationMap: {}
});
console.log(isControl);
// const result: Array<iToken> = parser.parse();


// async function app() {
//     const output: string = await _galgar.parse(_COMPONENTS_DIRECTORY + _path.sep + 'myComponent.ggd', stData);
//     console.log(output);
// }
// app();

// const contents = _fs.readFileSync('C:\\code\\galgar-cms\\user_components\\myComponent.ggd', {encoding:'utf8', flag:'rs'});
// const path = _galgar.makePathAbsolute('.' + _path.sep + 'ComponentB');
