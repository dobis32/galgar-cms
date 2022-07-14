import { _TYPE_HTML_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
const testToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
    raw: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
    name: 'h3',
    enumerationMap: {}
};
const testProps = ['style', 'data.Content'];
const compRefToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
    raw: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
    name: 'h3',
    enumerationMap: {}
};
const compRefProps = ['style', 'data'];
const st = {
    data: {
        HeaderStyle: 'color: #f00;',
        Content: 'This is a test',
        ComponentStyle: 'color: #0f0',
        ComponentData: '{ \"foobar\": \"this is some data\" }'
    }
};
const ctxStack = [{ aliases: {}, props: st }];
const symbolTable = new SymbolTable(ctxStack);
const result = symbolTable.addContextualSymbol('afdafdsafdsafa', Object.keys(st)[0]);
console.log(result);
