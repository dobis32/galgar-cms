import { iComponentMap, iComponentReference, iSymbolContext, iToken } from '../src/interfaces/interfaces';
import { SymbolTable } from '../src/symbolTable';
import  TokenParser from '../src/tokenParser';
import { _TYPE_HTML_TOKEN } from '../src/const/tokenTypes';
import { TESTING_HTML_TABLE_AS_TOKENS } from './helpers/lexer_inputs';
import { TEST_PACKAGE_NESTED_IF, TEST_PACKAGE_DYNAMIC_HEADER, TESTING_COMPONENT_REF_MAP, iTestPackage } from './helpers/testValues';


describe('tokenParser.ts', () => {
    let componentMapStack : Array<iComponentMap>;
    let parser: TokenParser;
    let compMap: iComponentMap;
    let st: SymbolTable;
    let tokens: Array<iToken>;
    beforeEach(() => {
        compMap = {};
        componentMapStack = [ TESTING_COMPONENT_REF_MAP ];
        const contextStack: Array<iSymbolContext> = TEST_PACKAGE_DYNAMIC_HEADER.symbolTableStack;
        const initProps: Array<string> = TEST_PACKAGE_DYNAMIC_HEADER.component.props;
        st = new SymbolTable(contextStack);
        const tokens: Array<iToken> = TEST_PACKAGE_DYNAMIC_HEADER.component.tokens;
    });

    it('should have a function to parse the input tokens when the input is valid', () => {
        const testTokens: Array<iToken> = TEST_PACKAGE_DYNAMIC_HEADER.component.tokens;
        const testProps: Array<string> = TEST_PACKAGE_DYNAMIC_HEADER.component.props;
        parser.validate = jest.fn(parser.validate);
        parser = new TokenParser(tokens, st, testProps, componentMapStack);
        const parsedTokens: Array<iToken> = parser.parse();
        expect(parser.parse).toBeDefined();
        expect(typeof parser.parse).toEqual('function');
        expect(parser.validate).toHaveBeenCalled();
        expect(parser.validate()).toEqual(true);
        expect(parsedTokens.length).toEqual(testTokens.length);
    });

    it('should not attempt to parse when the provided input tokens are invalid', () => {
        parser.validate = jest.fn(parser.validate);
        const invalidTokens: Array<iToken> = [ {
            type: _TYPE_HTML_TOKEN,
            value: '<table>',
            raw: '<table>',
            name: 'table',
            enumerationMap: {}
        } ]; // incomplete/invalid token set
        parser = new TokenParser(invalidTokens, st, [], componentMapStack);
        expect(() => { parser.parse(); }).toThrow();
    });

    it('should be able to parse nested IF statements correctly', () => {
        const testPack: iTestPackage = TEST_PACKAGE_NESTED_IF;
        const tokens: Array<iToken> = testPack.component.tokens;
        const props: Array<string> = testPack.component.props;
        const st: SymbolTable = new SymbolTable(testPack.symbolTableStack);
        const parser: TokenParser = new TokenParser(tokens, st, props);
        const result: Array<iToken> = parser.parse();
        expect(result).toEqual(testPack.expectedResult);
    });
});