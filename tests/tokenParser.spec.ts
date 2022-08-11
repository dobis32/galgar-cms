import { iComponentMap, iSymbolContext, iToken } from '../src/interfaces/interfaces';
import { SymbolTable } from '../src/symbolTable';
import  TokenParser from '../src/tokenParser';
import { TESTING_HTML_TABLE_AS_TOKENS } from './helpers/lexer_inputs';
describe('tokenParser.ts', () => {
    let parser: TokenParser;
    let compMap: iComponentMap;
    let st: SymbolTable;
    let tokens: Array<iToken>;
    beforeEach(() => {
        compMap = {};
        const contextStack: Array<iSymbolContext> = [];
        st = new SymbolTable(contextStack);
        parser = new TokenParser(st, compMap);
    });

    it('should have a function to parse the input tokens when the input is valid', () => {
        const testTokens: Array<iToken> = TESTING_HTML_TABLE_AS_TOKENS;
        parser.validate = jest.fn(parser.validate);
        const parsedTokens: Array<iToken> = parser.parse(testTokens, []);
        expect(parser.parse).toBeDefined();
        expect(typeof parser.parse).toEqual('function');
        expect(parser.validate).toHaveBeenCalled();
        expect(parser.validate(testTokens)).toEqual(true);
    });
});