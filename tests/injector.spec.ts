import { ValueInjector } from '../src/injector';
import { iSymbolTable, iToken, iLexPosition, iSymbolContext } from '../src/interfaces/interfaces';
import { INJECT_RULE, INVALID_POSITION } from '../src/const/const';
import { _TYPE_HTML_TOKEN } from '../src/const/tokenTypes';

import { SymbolTable } from '../src/symbolTable';
describe('injector.ts', () => {
    let st: iSymbolTable;
    let symbolTable: SymbolTable;
    let testToken: iToken;
    let testCompRefToken: iToken;
    let testCompRefProps: Array<string>;
    let badTestToken1: iToken;
    let badTestToken2: iToken;
    let initCtx: iSymbolContext;
    let ctxStack: Array<iSymbolContext>;
    const WHITE_SPACING: string = '   ';
    beforeEach(() => {

        st = {
            data: {
                HeaderStyle: 'color: #f00;',
                Content: 'This is a test',
                ComponentStyle: 'color: #0f0',
                ComponentData: '{ \"foobar\": \"this is some data\" }'
            }
        } 
        initCtx = { aliases: {}, props: st };
        ctxStack = [ initCtx ];
        symbolTable = new SymbolTable(ctxStack);

        testToken = {
            type: _TYPE_HTML_TOKEN,
            value: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
            raw: WHITE_SPACING + '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>' + WHITE_SPACING,
            name: 'h3',
            enumerationMap: {}
        };

        testCompRefToken = {
            type: _TYPE_HTML_TOKEN,
            value: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
            raw: '<myComponent style={{ data.ComponentStyle }} data={{ data.ComponentData }}/>',
            name: 'h3',
            enumerationMap: {}
        };

        testCompRefProps = ['style', 'data'];

        badTestToken1 = {
            type: _TYPE_HTML_TOKEN,
            value: '<h3> data.Content }}</h3>',
            raw: WHITE_SPACING + '<h3> data.Content }}</h3>' + WHITE_SPACING,
            name: 'h3',
            enumerationMap: {}
        };
        badTestToken2 = {
            type: _TYPE_HTML_TOKEN,
            value: '<h3>{{ data.Content</h3>',
            raw: WHITE_SPACING + '<h3>{{ data.Content</h3>' + WHITE_SPACING,
            name: 'h3',
            enumerationMap: {}
        };
    });

    it('should have a function to detect the position of the next injection in a given string', () => {
        const pos: iLexPosition = ValueInjector.getInjectPositioning(testToken.value);
        const invalidPos1: iLexPosition = ValueInjector.getInjectPositioning(badTestToken1.value);
        const invalidPos2: iLexPosition = ValueInjector.getInjectPositioning(badTestToken2.value);
        expect(ValueInjector.getInjectPositioning).toBeDefined();
        expect(typeof ValueInjector.getInjectPositioning).toEqual('function');
        expect(pos.start).toEqual(testToken.value.indexOf(INJECT_RULE.start));
        expect(pos.end).toEqual(testToken.value.indexOf(INJECT_RULE.end));
        expect(pos.next).toEqual(testToken.value.substring(pos.start + INJECT_RULE.start.length).indexOf(INJECT_RULE.start) + pos.start);
        expect(invalidPos1).toEqual(INVALID_POSITION);
        expect(invalidPos2).toEqual(INVALID_POSITION);
    });

    it('should have a function to inject all symbols in a given token', () => {
        const injected: iToken = ValueInjector.injectTokenSymbols(testToken, symbolTable);
        const pos: iLexPosition = ValueInjector.getInjectPositioning(injected.value);
        expect(ValueInjector.injectTokenSymbols).toBeDefined();
        expect(typeof ValueInjector.injectTokenSymbols).toEqual('function');
        expect(pos).toEqual(INVALID_POSITION); // there shouldn't be any more injection positions in the token returned from injectTokenSymbols()
        expect(injected === testToken).toEqual(false);
    });

    it('should have a function for cloning tokens', () => {
        const clone: iToken = ValueInjector.cloneToken(testToken);
        expect(typeof ValueInjector.cloneToken).toEqual('function');
        expect(ValueInjector.cloneToken).toBeDefined();
        expect(clone).toEqual(testToken);
        expect(clone === testToken).toEqual(false);
    });

    it('should have a function for injecting a value from a provided symbol table into a predefined position in a provided token', () => {
        const tokenValue: string = '<h3>{{ data.Content }}</h3>'
        const Content: string = 'hello world';
        ctxStack = [ { aliases: {}, props: { data: { Content } } } ];
        symbolTable = new SymbolTable(ctxStack);
        testToken.value = tokenValue;
        testToken.raw = WHITE_SPACING + tokenValue + WHITE_SPACING;
        const expectedTokenValue: string = '<h3>hello world</h3>'
        const expectedRawTokenValue: string = WHITE_SPACING + expectedTokenValue + WHITE_SPACING;
        const injectPosition: iLexPosition = ValueInjector.getInjectPositioning(testToken.raw);
        const resultantToken: iToken =  ValueInjector.injectSymbol(testToken, symbolTable, injectPosition);
        expect(typeof ValueInjector.injectSymbol).toEqual('function');
        expect(ValueInjector.injectSymbol).toBeDefined();
        expect(resultantToken.value).toEqual(expectedTokenValue);
        expect(resultantToken.raw).toEqual(expectedRawTokenValue);
        expect(testToken === resultantToken).toEqual(true);
    });

    it('should have a function for getting the symbol name of a provided injection', () => {
        const expectedSymbolName = 'foo.bar';
        const tokenStr: string = '<h3>{{ ' + expectedSymbolName + ' }}</h3>';
        testToken.value = tokenStr;
        testToken.raw = WHITE_SPACING + tokenStr + WHITE_SPACING;
        const pos: iLexPosition = ValueInjector.getInjectPositioning(testToken.value);
        const symbolName = ValueInjector.getSymbolNameFromInjection(testToken.value, pos);
        expect(ValueInjector.getSymbolNameFromInjection).toBeDefined();
        expect(typeof ValueInjector.getSymbolNameFromInjection).toEqual('function');
        expect(symbolName).toEqual(expectedSymbolName);
    });

    it('should have a function for getting a map of properties being assigned to a component reference', () => {
        const propMap: iSymbolTable = ValueInjector.getPropMapForComponentRef(testCompRefToken, testCompRefProps, symbolTable);
        const diff: Array<string> = [];
        Object.keys(propMap).forEach((key: string) => { if (testCompRefProps.indexOf(key) == -1) diff.push(key)});
        expect(ValueInjector.getPropMapForComponentRef).toBeDefined();
        expect(typeof ValueInjector.getPropMapForComponentRef).toEqual('function');
        expect(diff.length).toEqual(0);
        expect(Object.keys(propMap).length == testCompRefProps.length);
    });
});