import Lexer from '../src/lexer';
import Grammar from '../src/grammar';
import { HTML_RULE, CONTROL_RULE } from '../src/const/const';
import { iToken, iLexPosition, iRule } from '../src/interfaces/interfaces';
import { TESTING_HTML_TABLE_AS_STRING, TESTING_HTML_TABLE_AS_TOKENS, HEADING_WITH_CONTENT_AS_STRING, HEADING_WITH_CONTENT_AS_TOKENS } from './helpers/lexer_inputs';
describe ('lexer.ts', () => {
    let lexer: Lexer;
    const grammar: Grammar = new Grammar([ HTML_RULE, CONTROL_RULE ]);
    const ORIGINAL_INPUT = TESTING_HTML_TABLE_AS_STRING;
    beforeEach(() => {
        lexer = new Lexer(ORIGINAL_INPUT, grammar);
    });

    it('should have a function to get the "grammar" class member', () => {
        expect(lexer.getGrammar).toBeDefined();
        expect(typeof lexer.getGrammar).toEqual('function');
        expect(lexer.getGrammar()).toEqual(grammar);
    });

    it('should have a function to set the "input" class member', () => {
        const NEW_INPUT = 'some-new-value';
        lexer.setInput(NEW_INPUT);
        expect(lexer.setInput).toBeDefined();
        expect(typeof lexer.setInput).toEqual('function');
        expect(lexer.getInput()).toEqual(NEW_INPUT);

    });
    it('should have a function to lex the next token of the input', () => {
        lexer.setInput(TESTING_HTML_TABLE_AS_STRING);
        const token: iToken = lexer.lex();
        const token2: iToken = lexer.lex();
        const token3: iToken = lexer.lex();
        expect(lexer.lex).toBeDefined();
        expect(typeof lexer.lex).toEqual('function');
        expect(token).toEqual(TESTING_HTML_TABLE_AS_TOKENS[0]);
        expect(token2).toEqual(TESTING_HTML_TABLE_AS_TOKENS[1]);
        expect(token3).toEqual(TESTING_HTML_TABLE_AS_TOKENS[2]);

    });
    it('should have a function to get the next lex position', () => {
        const input: string = TESTING_HTML_TABLE_AS_STRING;
        const exptectedStart1: number = 0;
        const expectedEnd1: number = TESTING_HTML_TABLE_AS_TOKENS[0].raw.length - 1;
        const expectedNext1: number = TESTING_HTML_TABLE_AS_TOKENS[0].raw.length;
        const expectedPosition1: iLexPosition = { start: exptectedStart1, end: expectedEnd1, next: expectedNext1 };
        const offset: number = expectedEnd1 + 1;
        const exptectedStart2: number = expectedNext1;
        const expectedEnd2: number = TESTING_HTML_TABLE_AS_TOKENS[1].raw.length + offset - 1;
        const expectedNext2: number = TESTING_HTML_TABLE_AS_TOKENS[1].raw.length + offset;
        const expectedPosition2: iLexPosition = { start: exptectedStart2, end: expectedEnd2, next: expectedNext2 };
        const expectedMatchedRule: iRule = HTML_RULE;
        const grammar: Grammar = lexer.getGrammar();
        const rules: Array<iRule> = grammar.getRules();
        const result1: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules);
        const result2: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules, offset);
        expect(lexer.getNextLexPosition).toBeDefined();
        expect(typeof lexer.getNextLexPosition).toEqual('function');
        expect(result1.matchedRule).toEqual(expectedMatchedRule);
        expect(result1.position).toEqual(expectedPosition1);
        expect(result2.matchedRule).toEqual(expectedMatchedRule);
        expect(result2.position).toEqual(expectedPosition2);
    });

    it('should have a function to get the next rule position', () => {
        const pos: iLexPosition = lexer.getRulePosition(lexer.getInput(), HTML_RULE);
        expect(lexer.getRulePosition).toBeDefined();
        expect(typeof lexer.getRulePosition).toEqual('function');
        expect(pos.start).toBeGreaterThan(-1);
        expect(pos.end).toBeGreaterThan(-1);
        expect(pos.next).toBeGreaterThan(-1);

    });

    it('should have a function to generate a token based on a provided lex position', () => {
        lexer.processIntermediateContent = jest.fn(lexer.processIntermediateContent);
        lexer.validateToken = jest.fn(lexer.validateToken);
        lexer.setInput(HEADING_WITH_CONTENT_AS_STRING);
        const input: string = lexer.getInput();
        const grammar: Grammar = lexer.getGrammar();
        const rules: Array<iRule> = grammar.getRules();
        const prelimPositionResult: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules);
        const adjustedInput: string = input.substring(prelimPositionResult.position.next);
        const positionResult: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules);
        const pos: iLexPosition = positionResult.position;
        const matchedRule: iRule = positionResult.matchedRule;
        const token1: iToken = lexer.generateToken(pos, adjustedInput, matchedRule);
        const token2: iToken = lexer.generateToken(pos, adjustedInput, matchedRule);
        expect(lexer.generateToken).toBeDefined();
        expect(typeof lexer.generateToken).toEqual('function');
        expect(token1).toEqual(HEADING_WITH_CONTENT_AS_TOKENS[0]);
        expect(token2).toEqual(HEADING_WITH_CONTENT_AS_TOKENS[1]);
        expect(lexer.processIntermediateContent).toHaveBeenCalledTimes(1);
        expect(lexer.validateToken).toHaveBeenCalledTimes(1);
    });

});
