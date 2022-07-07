import { ValueInjector } from '../src/injector';
import { iSymbolTable, iToken, iLexPosition } from '../src/interfaces/interfaces';
import { INJECT_RULE, INVALID_POSITION } from '../src/const/const';
import { _TYPE_HTML_TOKEN } from '../src/const/tokenTypes';

import { SymbolTable } from '../src/symbolTable';
describe('injector.ts', () => {
    let symbolTable: SymbolTable;
    let testToken: iToken;
    beforeEach(() => {
        const st: iSymbolTable = {
            data: {
                HeaderStyle: 'color: #f00;',
                Content: 'This is a test'
            }
        }
        symbolTable = new SymbolTable(st);
        testToken = {
            type: _TYPE_HTML_TOKEN,
            value: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
            raw: '<h3 style={{ data.HeaderStyle }}>{{ data.Content }}</h3>',
            name: 'h3',
            enumerationMap: {}
        };
    });

    it('should have a function to detect the position of the next injection in a given string', () => {
        expect(ValueInjector.getInjectPositioning).toBeDefined();
        expect(typeof ValueInjector.getInjectPositioning).toEqual('function');
        const pos: iLexPosition = ValueInjector.getInjectPositioning(testToken.value);
        expect(pos.start).toEqual(testToken.value.indexOf(INJECT_RULE.start));
        expect(pos.end).toEqual(testToken.value.indexOf(INJECT_RULE.end));
        expect(pos.next).toEqual(testToken.value.substring(pos.start + INJECT_RULE.start.length).indexOf(INJECT_RULE.start) + pos.start + INJECT_RULE.start);
    });

    it('should have a function to inject all symbols in a given token', () => {
        const injected: iToken = ValueInjector.injectTokenSymbols(testToken, symbolTable);
        const pos: iLexPosition = ValueInjector.getInjectPositioning(injected.value);
        expect(ValueInjector.injectTokenSymbols).toBeDefined();
        expect(typeof ValueInjector.injectTokenSymbols).toEqual('function');
        expect(pos).toEqual(INVALID_POSITION);
    });
});