import { ValueInjector } from './src/injector';
import { _TYPE_CONTENT_TOKEN, _TYPE_HTML_TOKEN } from './src/const/tokenTypes';
import { SymbolTable } from './src/symbolTable';
import { INTERMEDIATE_CONTENT } from './src/const/const';
const TEST_COMPONENT_DYNAMIC_HEADER = {
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
    props: ['msg']
};
const TEST_PACKAGE_DYNAMIC_HEADER = {
    component: TEST_COMPONENT_DYNAMIC_HEADER,
    symbolTableStack: [{ aliases: {}, props: { msg: 'this is a message ' } }]
};
const ctxStack = TEST_PACKAGE_DYNAMIC_HEADER.symbolTableStack;
const st = new SymbolTable(ctxStack);
const result = ValueInjector.injectTokenSymbols(TEST_COMPONENT_DYNAMIC_HEADER.tokens[1], st);
// const result: any = st.resolveSymbol('msg');
