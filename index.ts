import { ValueInjector } from './src/injector';
import { iLexPosition, iToken, iSymbolTable, iComponentReference, iSymbolContext } from './src/interfaces/interfaces';
import { _TYPE_HTML_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, CONTROL_PROPS_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';

const testToken: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
    raw: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
    name: 'h3',
    enumerationMap: {}
};

const testProps: Array<string> = [ 'style', 'data.Content' ];

const compRefToken: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
    raw: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
    name: 'h3',
    enumerationMap: {}
};
const compRefProps = ['style', 'data']

const st: iSymbolTable = {
    data: {
        HeaderStyle: 'color: #f00;',
        Content: 'This is a test',
        ComponentStyle: 'color: #0f0',
        ComponentData: '{ \"foobar\": \"this is some data\" }'
    }
};

const ctxStack: Array<iSymbolContext> = [ {aliases: {}, props: st } ];

const symbolTable: SymbolTable = new SymbolTable(ctxStack);

const result = symbolTable.addContextualSymbol('afdafdsafdsafa', Object.keys(st)[0]);
console.log(result);