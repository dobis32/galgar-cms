import { iComponentMap, iComponentReference, iSymbolContext, iToken } from '../src/interfaces/interfaces';
import { SymbolTable } from '../src/symbolTable';
import  TokenParser from '../src/tokenParser';
import { TESTING_HTML_TABLE_AS_TOKENS } from './helpers/lexer_inputs';
import { TEST_PACKAGE_DYNAMIC_HEADER, TESTING_COMPONENT_REF_MAP } from './helpers/testValues';
describe('tokenParser.ts', () => {
    let componentMapStack : Array<iComponentMap>;
    let parser: TokenParser;
    let st: SymbolTable;
    let tokens: Array<iToken>;
    beforeEach(() => {
        componentMapStack = [ TESTING_COMPONENT_REF_MAP ];
        const contextStack: Array<iSymbolContext> = TEST_PACKAGE_DYNAMIC_HEADER.symbolTableStack;
        const initProps: Array<string> = TEST_PACKAGE_DYNAMIC_HEADER.component.props;
        st = new SymbolTable(contextStack);
        const tokens: Array<iToken> = TEST_PACKAGE_DYNAMIC_HEADER.component.tokens;
        parser = new TokenParser(tokens, st, initProps, componentMapStack);
    });

    it('should have a function to parse the input tokens when the input is valid', () => {
        const testTokens: Array<iToken> = TEST_PACKAGE_DYNAMIC_HEADER.component.tokens;
        const initProps: Array<string> = TEST_PACKAGE_DYNAMIC_HEADER.component.props;
        parser.validate = jest.fn(parser.validate);
        parser.initParse = jest.fn(parser.initParse);
        const parsedTokens: Array<iToken> = parser.parse(initProps);
        expect(parser.parse).toBeDefined();
        expect(typeof parser.parse).toEqual('function');
        expect(parser.validate).toHaveBeenCalled();
        expect(parser.validate(testTokens)).toEqual(true);
        expect(parser.initParse).toHaveBeenCalled();
        expect(parsedTokens.length).toEqual(testTokens.length);
    });

    it('should not attempt to parse when the provided input tokens are invalid', () => {
        const invalidTokens: Array<iToken> = [ TESTING_HTML_TABLE_AS_TOKENS[0] ];
        parser = new TokenParser(invalidTokens, st, [], componentMapStack);
        expect(() => { parser.parse([]) }).toThrow();
    });

    it('should have a function to return the top-level map from component-reference stack', () => {
        
        parser.getAliasComponentMap();

    });
});