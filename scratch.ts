import { iTestPackage, iToken,  iComponentReference } from './src/interfaces/interfaces';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP } from './src/const/tokenData';
import { SymbolTable } from './src/symbolTable';
import Grammar from './src/grammar';
import { HTML_RULE, CONTROL_RULE, } from './src/const/const';
import { fileURLToPath } from 'url';
import * as _path from 'path';
import { Galgar } from './src/galgar';
import * as _fs from 'fs';
import TokenParser from './src/tokenParser';


// const testPack: iTestPackage = TEST_PACKAGE_NESTED_IF;
// const tokens: Array<iToken> = testPack.component.tokens.map((t:iToken)=> t);
// console.log('TEST IF STATEMENT....');
// const props: Array<string> = testPack.component.props.map((s:string) => s);
// const st: SymbolTable = new SymbolTable(testPack.symbolTableStack);
// const parser: TokenParser = new TokenParser(tokens, st, props, {});
// const isControl: boolean = parser.tokenIsControlToken({
//     type: _TOKEN_TYPES_MAP.HTML,
//     value: '[[ #PROPS bool1, bool2, bool3 ]]',
//     raw: '[[ #PROPS bool1, bool2, bool3 ]]',
//     name: _TOKEN_NAMES_MAP.PROPS,
//     enumerationMap: {}
// });
// console.log(isControl);
// const result: Array<iToken> = parser.parse();


// async function app() {
//     const output: string = await _galgar.parse(_COMPONENTS_DIRECTORY + _path.sep + 'myComponent.ggd', stData);
//     console.log(output);
// }
// app();

// const contents = _fs.readFileSync('C:\\code\\galgar-cms\\user_components\\myComponent.ggd', {encoding:'utf8', flag:'rs'});
// const path = _galgar.makePathAbsolute('.' + _path.sep + 'ComponentB');
