import { iEnumerationMap, iSymbolContext, iSymbolTable } from "../src/interfaces/interfaces";
import { SymbolTable } from "../src/symbolTable";

describe('symbolTable.ts', () => {
    const FUNC_RETURN_VALUE: string = 'SOME_VALUE';
    const ENUM_ALIAS: string = 'SOME_ALIAS';
    const COMPLEX_ENUM_ALIAS: string = 'COMPLEX_ENUM_ALIAS';
    const COMPLEX_ENUM_KEY1: string ='COMPLEX_ENUM_KEY1';
    const COMPLEX_ENUM_KEY2: string ='COMPLEX_ENUM_KEY2';
    let symbolTable: SymbolTable;
    let enumSymbol1: Array<string>;
    let enumSymbol2: Array<string>;
    let enumSymbol3: Array<string>;
    let complexEnumSymbol: Array<{ [key: string]: any }>;
    let complexSymbol1: { [key: string]: any };
    let complexKey1: string;
    let complexKey2: string;
    let complexValue: string;
    let st1_symbolName1: string;
    let st1_symbolName2: string;
    let st1_symbolName3: string;
    let st2_symbolValue1: string;
    let st2_symbolName1: string;
    let st2_enumSymbolName: string;
    let st2_symbolName3: string;
    let st2_symbolName4: string;
    let st2_symbolName5: string;
    let st1: iSymbolTable;
    let st2: iSymbolTable;
    let ctx1: iSymbolContext;
    let ctx2: iSymbolContext;
    let ctxStack: Array<iSymbolContext>;
    beforeEach(() => {
        enumSymbol1 = ['abc', 'def', 'ghi'];
        enumSymbol2 = ['jkl', 'mno', 'pqrs'];
        enumSymbol3 = [ 'foo', 'bar', 'fizz', 'buzz'];
        complexEnumSymbol = [ { COMPLEX_ENUM_KEY1: { COMPLEX_ENUM_KEY2: 'hello :)'} }, { COMPLEX_ENUM_KEY1: { COMPLEX_ENUM_KEY2: 'hello world!'} } ]
        complexKey1 = 'complex_key1';
        complexKey2 = 'complex_key2';
        complexValue = 'value_of_some_complex_symbol';
        complexSymbol1 = {}
        complexSymbol1[complexKey1] = {};
        complexSymbol1[complexKey1][complexKey2] = complexValue;

        st1_symbolName1 = 'foo';
        st1_symbolName2 = 'bar';
        st1_symbolName3 = 'myFunc';
        st1 = {};
        st1[st1_symbolName1] = 'foobar';
        st1[st1_symbolName2] = 'fizzbuzz';
        st1[st1_symbolName3] = () => { return FUNC_RETURN_VALUE };

        ctx1 = {
            aliases: { },
            props: st1
        }
        st2_symbolValue1 = 'fizz';
        st2_symbolName1 = st2_symbolValue1;
        st2_enumSymbolName = 'ENUM_SYMBOL';
        st2_symbolName3 = 'someComplex';
        st2_symbolName4 = 'truthy_symbol';
        st2_symbolName5 = 'falsy_symbol';

        st2 = {};
        st2[st2_symbolName1] = 'more_data';
        st2[st2_enumSymbolName] = enumSymbol1;
        st2[st2_symbolName3] = complexSymbol1;
        st2[st2_symbolName4] = 'truthy_value';
        st2[st2_symbolName5] = NaN; // falsy symbol
        const ctx2_aliases: { [key: string]: any } = {};
        ctx2_aliases[ENUM_ALIAS] = enumSymbol2;
        ctx2_aliases[COMPLEX_ENUM_ALIAS] = complexEnumSymbol;
        ctx2 = {
            aliases: ctx2_aliases,
            props: st2
        }
        ctxStack = [ ctx1, ctx2 ];
        symbolTable = new SymbolTable(ctxStack);
        ctxStack.push = jest.fn(ctxStack.push);
    });

    it('should have a function to push a context onto the context stack', () => {
        const newCtx: iSymbolContext = { aliases: {}, props: {} };
        const initStackHeight: number = ctxStack.length;
        symbolTable.pushContext(newCtx);
        expect(symbolTable.pushContext).toBeDefined();
        expect(typeof symbolTable.pushContext).toEqual('function');
        expect(ctxStack.push).toHaveBeenCalled();
        expect(ctxStack.length).toEqual(initStackHeight + 1);
    });

    it('should have a function for adding a contextual symbol to the target/default context', () => {
        const v1: string = 'hello_world';
        const v2: number = 1234;
        const s1: string =  'new_symbol1';
        const s2: string = 'new_symbol2';
        const redunant_symbol: string = Object.keys(st2)[0];
        const targetIndex: number = 0;
        const result1: boolean = symbolTable.addContextualSymbol(v1, s1);
        const result2: boolean = symbolTable.addContextualSymbol(v2, s2, targetIndex);
        const result3: boolean = symbolTable.addContextualSymbol(v1, redunant_symbol);
        const result4: boolean = symbolTable.addContextualSymbol(v1, s1);
        expect(symbolTable.addContextualSymbol).toBeDefined();
        expect(typeof symbolTable.addContextualSymbol).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(true);
        expect(result3).toEqual(false);
        expect(result4).toEqual(false);
    });

    it('should have a function to pop the top-level context off of the context stack', () => {
        ctxStack.pop = jest.fn(ctxStack.pop);
        const result: iSymbolContext = symbolTable.popContext();
        while (ctxStack.length) symbolTable.popContext();
        const undefinedResult: iSymbolContext = symbolTable.popContext();
        expect(symbolTable.popContext).toBeDefined();
        expect(typeof symbolTable.popContext).toEqual('function');
        expect(result === ctx2).toEqual(true);
        expect(undefinedResult).toBeUndefined();
    });

    it('should have a function for removing a symbol from the top level context', () => {
        const topLevelCtx: iSymbolContext = ctxStack[ctxStack.length - 1];
        const symbolToRemove: string = Object.keys(topLevelCtx.props)[0];
        const result: boolean = symbolTable.removeSymbol(symbolToRemove);
        expect(symbolTable.removeSymbol).toBeDefined();
        expect(typeof symbolTable.removeSymbol).toEqual('function');
        expect(result).toEqual(true);
        expect(topLevelCtx.aliases[symbolToRemove]).toBeUndefined();
        expect(topLevelCtx.props[symbolToRemove]).toBeUndefined();
    });

    it('should have a function to resolve an enumerable symbol from the top-level symbol context', () => {
        symbolTable.resolveSymbol = jest.fn(symbolTable.resolveSymbol);
        const targetEnumSymbol: string = st2_enumSymbolName;
        const topLevelContext: iSymbolContext = symbolTable.getContext();
        const epxectedEnum: Array<any> = topLevelContext.props[targetEnumSymbol];
        const result1: Array<any> = symbolTable.resolveEnumerableSymbol(targetEnumSymbol);
        expect(symbolTable.resolveEnumerableSymbol).toBeDefined();
        expect(typeof symbolTable.resolveEnumerableSymbol).toEqual('function');
        expect(symbolTable.resolveSymbol).toHaveBeenCalledWith(targetEnumSymbol, undefined);
        expect(Array.isArray(result1)).toEqual(true);
        expect(result1 === epxectedEnum).toEqual(true);
    });

    it('should have a function to resolve a symbol in the top-level symbol context', () => {
        symbolTable.lookupSymbol = jest.fn(symbolTable.lookupSymbol);
        const result: any = symbolTable.resolveSymbol(st2_symbolName1);
        expect(symbolTable.resolveSymbol).toBeDefined();
        expect(typeof symbolTable.resolveSymbol).toEqual('function');
        expect(symbolTable.lookupSymbol).toHaveBeenCalled();
        expect(result).toEqual(ctx2.props[st2_symbolName1]);
    });

    it('should be able to resolve complex symbols', () => {
        symbolTable.walkToValue = jest.fn(symbolTable.walkToValue);
        symbolTable.lookupSymbol = jest.fn(symbolTable.lookupSymbol);
        const complexSymbol: string = [st2_symbolName3, complexKey1, complexKey2].join('.');
        const result: any = symbolTable.resolveSymbol(complexSymbol);
        expect(symbolTable.walkToValue).toHaveBeenCalled();
        expect(symbolTable.lookupSymbol).toHaveBeenCalled();
        expect(result).toEqual(ctx2.props[st2_symbolName3][complexKey1][complexKey2]);
    });

    it('should be able to resolve a specific enumeration value of a given alias', () => {
        const targetEnumerationIndex: number = 1;
        const enumMap: iEnumerationMap = {};
        enumMap[ENUM_ALIAS] = targetEnumerationIndex;
        const expected: string = enumSymbol2[targetEnumerationIndex];
        const result: any = symbolTable.resolveSymbol(ENUM_ALIAS, enumMap);
        expect(result).toEqual(expected);
    });

    it('should be able to resolve a complex value of a specific enumeration value of a given alias', () => {
        const targetEnumerationIndex: number = 1;
        const enumMap: iEnumerationMap = {};
        const expected: string = complexEnumSymbol[targetEnumerationIndex][COMPLEX_ENUM_KEY1][COMPLEX_ENUM_KEY2];
        enumMap[COMPLEX_ENUM_ALIAS] = targetEnumerationIndex;
        const complexSymbol: string = [ COMPLEX_ENUM_ALIAS, COMPLEX_ENUM_KEY1, COMPLEX_ENUM_KEY2 ].join('.');
        const result: any = symbolTable.resolveSymbol(complexSymbol, enumMap);
        expect(result).toEqual(expected);
    });

    it('should have a function to resolve a truthy symbol', () => {
        symbolTable.resolveTruthySymbol = jest.fn(symbolTable.resolveTruthySymbol);
        const truthySymbolName: string = st2_symbolName4;
        const falsySymbolname: string= st2_symbolName5;
        const expectedValue1: boolean = true;
        const result1 = symbolTable.resolveTruthySymbol(truthySymbolName);
        const result2 = symbolTable.resolveTruthySymbol(falsySymbolname);
        expect(symbolTable.resolveTruthySymbol).toBeDefined();
        expect(typeof symbolTable.resolveTruthySymbol).toEqual('function');
        expect(symbolTable.resolveSymbol(truthySymbolName)).toBeTruthy();
        expect(symbolTable.resolveSymbol(falsySymbolname)).toBeFalsy();
        expect(typeof result1).toEqual('boolean');
        expect(typeof result2).toEqual('boolean');
        expect(result1).toBeTruthy();
        expect(result2).toBeFalsy();
    });

    it('should have a function to get the top-level symbol context', () => {
        const result: iSymbolContext = symbolTable.getContext();
        expect(symbolTable.getContext).toBeDefined();
        expect(typeof symbolTable.getContext).toEqual('function');
        expect(result).toEqual(ctx2);

    });

    it('should have a function to get a symbol context at the specified level', () => {
        const targetIndex: number = 0;
        const result: iSymbolContext = symbolTable.getContext(targetIndex);
        expect(symbolTable.getContext).toBeDefined();
        expect(typeof symbolTable.getContext).toEqual('function');
        expect(result).toEqual(ctx1);
    });

    it('should have a function to set the props of the top-level symboltable', () => {
        const testST: iSymbolTable = {
            'this_test_value': 1234567
        };
        symbolTable.setContextProps(testST);
        const topLevelcontext: iSymbolContext = symbolTable.getContext();
        expect(symbolTable.setContextProps).toBeDefined();
        expect(typeof symbolTable.setContextProps).toEqual('function');
        expect(topLevelcontext.props).toEqual(testST);
    });

    it('should have a function to set the props of a symboltable at the specified level', () => {
        const testST: iSymbolTable = {
            'this_test_value': 1234567
        };
        const targetIndex: number = 0;
        symbolTable.setContextProps(testST, targetIndex);
        const targetLevelContext: iSymbolContext = symbolTable.getContext(targetIndex);
        expect(symbolTable.setContextProps).toBeDefined();
        expect(typeof symbolTable.setContextProps).toEqual('function');
        expect(targetLevelContext.props).toEqual(testST);
    });

    it('should have a function to walk to a deep value', () => {
        const complexRoot: string = st2_symbolName3;
        const complexSymbolTokens: Array<string> = [complexRoot, complexKey1, complexKey2];
        const result: any = symbolTable.walkToValue(complexSymbolTokens, st2);
        expect(symbolTable.setContextProps).toBeDefined();
        expect(typeof symbolTable.setContextProps).toEqual('function');
        expect(result).toEqual(complexValue);
    });

    it('should have a function to lookup a symbol from the top-level context', () => {
        const topLevelContext: iSymbolContext = symbolTable.getContext();
        const targetSymbol: string = st2_symbolName1;
        const expectedValue: string = topLevelContext.props[st2_symbolName1];
        const result: any = symbolTable.lookupSymbol(targetSymbol);
        expect(symbolTable.lookupSymbol).toBeDefined();
        expect(typeof symbolTable.lookupSymbol).toEqual('function');
        expect(result).toEqual(expectedValue);
    
    });

    it('should have a function to look up a specified enumeration of a top-level aliased symbol', () => {
        const targetSymbol: string = COMPLEX_ENUM_ALIAS;
        const targetEnum: number = 1;
        const topLevelContext: iSymbolContext = symbolTable.getContext();
        const expectedValue: string = topLevelContext.aliases[COMPLEX_ENUM_ALIAS][targetEnum];
        const result: any = symbolTable.lookupSymbol(targetSymbol, targetEnum);
        expect(symbolTable.lookupSymbol).toBeDefined();
        expect(typeof symbolTable.lookupSymbol).toEqual('function');
        expect(result).toEqual(expectedValue);

    });

});