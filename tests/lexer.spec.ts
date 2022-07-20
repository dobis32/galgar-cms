import Lexer from '../src/lexer';
import Grammar from '../src/grammar';
import { HTML_RULE, CONTROL_RULE, CONTROL_IF_RULE, INTERMEDIATE_CONTENT, INVALID_INPUT_TOKEN, INVALID_POSITION } from '../src/const/const';
import { iToken, iLexPosition, iRule } from '../src/interfaces/interfaces';
import { TESTING_HTML_TABLE_AS_STRING, TESTING_HTML_TABLE_AS_TOKENS, HEADING_WITH_CONTENT_AS_STRING, HEADING_WITH_CONTENT_AS_TOKENS } from './helpers/lexer_inputs';
import { _TYPE_CONTROL_IF_TOKEN, _TYPE_CONTROL_FOR_TOKEN, _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, _TYPE_CONTENT_TOKEN, _TYPE_CONTROL_IMPORT_TOKEN, _TYPE_WHITESPACE_TOKEN, CONTROLIF_ELSEIF_TOKEN, CONTROLIF_IF_TOKEN, CONTROLFOR_FOR_TOKEN, CONTROL_IMPORT_TOKEN, CONTROL_COMPONENT_TOKEN, CONTROL_PROPS_TOKEN, CONTROLIF_ELSE_TOKEN, _TYPE_HTML_TOKEN, CONTROLIF_ENDIF_TOKEN, CONTROLFOR_ENDFOR_TOKEN } from '../src/const/tokenTypes';
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
        lexer.setInput(HEADING_WITH_CONTENT_AS_STRING);
        lexer.validateToken = jest.fn(lexer.validateToken);
        lexer.tokenizeIntermediateContent = jest.fn(lexer.tokenizeIntermediateContent);
        const input: string = lexer.getInput();
        const grammar: Grammar = lexer.getGrammar();
        const rules: Array<iRule> = grammar.getRules();
        const match1: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(input, rules);
        const tok1: iToken = lexer.generateToken(match1.position, input, match1.matchedRule);
        const adjustedInput: string = input.substring(tok1.raw.length);
        const match2: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(adjustedInput, rules);
        const tok2: iToken = lexer.generateToken(match2.position, adjustedInput, match2.matchedRule);
        expect(lexer.generateToken).toBeDefined();
        expect(typeof lexer.generateToken).toEqual('function');
        expect(tok1).toEqual(HEADING_WITH_CONTENT_AS_TOKENS[0]);
        expect(tok2).toEqual(HEADING_WITH_CONTENT_AS_TOKENS[1]);
        expect(lexer.tokenizeIntermediateContent).toHaveBeenCalled();
        expect(lexer.validateToken).toHaveBeenCalled();

    });

    it('should have a function that can tokenize intermediate content', () => {
        const intermediateValue: string = 'hello world!   ';
        const nextToken: string = '</h4>';
        const testInput: string = intermediateValue + nextToken;
        const grammar: Grammar = lexer.getGrammar();
        const positionReult: { position: iLexPosition, matchedRule: iRule } = lexer.getNextLexPosition(testInput, grammar.getRules());
        const resultTok: iToken = lexer.tokenizeIntermediateContent(positionReult.position.start, testInput);
        expect(lexer.tokenizeIntermediateContent).toBeDefined();
        expect(typeof lexer.tokenizeIntermediateContent).toEqual('function');
        expect(resultTok.raw).toEqual(intermediateValue);
        expect(resultTok.value).toEqual(intermediateValue.trim());
        expect(resultTok.type).toEqual(_TYPE_CONTENT_TOKEN);
        expect(resultTok.name).toEqual(INTERMEDIATE_CONTENT);
       
    });

    it('should have a function that can tokenize whitespace', () => {
        const whiteSpaceInput: string = '     \r\n';
        const resultTok: iToken = lexer.tokenizeIntermediateContent(whiteSpaceInput.length, whiteSpaceInput);
        expect(lexer.tokenizeIntermediateContent).toBeDefined();
        expect(typeof lexer.tokenizeIntermediateContent).toEqual('function');
        expect(resultTok.raw).toEqual(whiteSpaceInput);
        expect(resultTok.value).toEqual(whiteSpaceInput.trim());
        expect(resultTok.type).toEqual(_TYPE_WHITESPACE_TOKEN);
        expect(resultTok.name).toEqual(INTERMEDIATE_CONTENT);
    });

    it('should have a function to get the name of a given token input as a string', () => {
        const controlTokValue: string = '[[ #IF value ]]';
        const controlTokName: string = CONTROLIF_IF_TOKEN;
        lexer.getMappedControlTokenName = jest.fn(lexer.getMappedControlTokenName);
        const result: string = lexer.getControlTokenName(controlTokValue);
        expect(lexer.getControlTokenName).toBeDefined();
        expect(typeof lexer.getControlTokenName).toEqual('function');
        expect(result).toEqual(controlTokName);

    });

    it('should have a functinon to get the name of a given control token name', () => {
        const ifString: string = '#IF';
        const forString: string = '#FOR';
        const importString: string = '#IMPORT';
        const componentString: string = '#COMPONENT';
        const propsString: string = '#PROPS';
        const ifResult: string = lexer.getMappedControlTokenName(ifString);
        const forResult: string = lexer.getMappedControlTokenName(forString);
        const importResult: string = lexer.getMappedControlTokenName(importString);
        const componentResult: string = lexer.getMappedControlTokenName(componentString);
        const propsResult: string = lexer.getMappedControlTokenName(propsString);
        expect(ifResult).toEqual(CONTROLIF_IF_TOKEN);
        expect(forResult).toEqual(CONTROLFOR_FOR_TOKEN);
        expect(importResult).toEqual(CONTROL_IMPORT_TOKEN);
        expect(componentResult).toEqual(CONTROL_COMPONENT_TOKEN);
        expect(propsResult).toEqual(CONTROL_PROPS_TOKEN);

    });

    it('should have a function to validate a token', () => {
        lexer.getTokenName = jest.fn(lexer.getTokenName);
        lexer.identifyControlType = jest.fn(lexer.identifyControlType);
        const grammar: Grammar = lexer.getGrammar();
        const invalidLexPosition: iLexPosition = INVALID_POSITION;
        const inputToValidate1: string = '<h4>';
        const inputToValidate2: string = '[[ #FOR x IN y ]]';
        const lexInputResult1: { position: iLexPosition, matchedRule: iRule} = lexer.getNextLexPosition(inputToValidate1, grammar.getRules());
        const lexInputResult2: { position: iLexPosition, matchedRule: iRule} = lexer.getNextLexPosition(inputToValidate2, grammar.getRules());
        const result1: iToken = lexer.validateToken(lexInputResult1.position, lexInputResult1.matchedRule, inputToValidate1);
        const result2: iToken = lexer.validateToken(lexInputResult2.position, lexInputResult2.matchedRule, inputToValidate2);
        const result3: iToken = lexer.validateToken(invalidLexPosition, HTML_RULE, inputToValidate2);
        expect(lexer.validateToken).toBeDefined();
        expect(typeof lexer.validateToken).toEqual('function');
        expect(result1.value).toEqual(inputToValidate1);
        expect(result1.type).toEqual(_TYPE_HTML_TOKEN);
        expect(result2.value).toEqual(inputToValidate2);
        expect(result2.type).toEqual(_TYPE_CONTROL_FOR_TOKEN);
        expect(result3).toEqual(INVALID_INPUT_TOKEN);
        expect(lexer.getTokenName).toHaveBeenCalledTimes(2);
        expect(lexer.identifyControlType).toHaveBeenCalledTimes(1);
    });

    it('should have a function to identify a provided control type', () => {
        expect(lexer.identifyControlType).toBeDefined();
        expect(typeof lexer.identifyControlType).toEqual('function');
        expect(lexer.identifyControlType(CONTROLIF_IF_TOKEN)).toEqual(_TYPE_CONTROL_IF_TOKEN);
        expect(lexer.identifyControlType(CONTROLIF_ELSE_TOKEN)).toEqual(_TYPE_CONTROL_IF_TOKEN);
        expect(lexer.identifyControlType(CONTROLIF_ELSEIF_TOKEN)).toEqual(_TYPE_CONTROL_IF_TOKEN);
        expect(lexer.identifyControlType(CONTROLIF_ENDIF_TOKEN)).toEqual(_TYPE_CONTROL_IF_TOKEN);
        expect(lexer.identifyControlType(CONTROLFOR_FOR_TOKEN)).toEqual(_TYPE_CONTROL_FOR_TOKEN);
        expect(lexer.identifyControlType(CONTROLFOR_ENDFOR_TOKEN)).toEqual(_TYPE_CONTROL_FOR_TOKEN);
        expect(lexer.identifyControlType(CONTROL_IMPORT_TOKEN)).toEqual(_TYPE_CONTROL_IMPORT_TOKEN);
        expect(lexer.identifyControlType(CONTROL_COMPONENT_TOKEN)).toEqual(_TYPE_CONTROL_COMPONENT_TOKEN);
        expect(lexer.identifyControlType(CONTROL_PROPS_TOKEN)).toEqual(_TYPE_CONTROL_PROPS_TOKEN);

    });

    it('should have a function to get the name of a provided token', () => {
        lexer.getControlTokenName = jest.fn(lexer.getControlTokenName);
        lexer.getHTMLTokenName = jest.fn(lexer.getHTMLTokenName);
        const targetRule1: iRule = HTML_RULE;
        const targetName1: string = 'h4';
        const targetRawInput1: string = HTML_RULE.start + targetName1 + HTML_RULE.end;
        const targetRule2: iRule = CONTROL_RULE;
        const targetRawInput2: string = '[[ #ENDIF ]]';
        const result1: string = lexer.getTokenName(targetRawInput1, targetRule1);
        const result2: string = lexer.getTokenName(targetRawInput2, targetRule2);
        expect(lexer.getTokenName).toBeDefined();
        expect(typeof lexer.getTokenName).toEqual('function');
        expect(lexer.getControlTokenName).toHaveBeenCalledTimes(1);
        expect(lexer.getHTMLTokenName).toHaveBeenCalledTimes(1);
        expect(result1).toEqual(targetName1);
        expect(result2).toEqual(CONTROLIF_ENDIF_TOKEN);
        
    });

    it('should have a function to get the name of a provided HTML token value', () => {
        const testName: string = 'myTag';
        const testInput: string = HTML_RULE.start + testName + HTML_RULE.end;
        const name: string = lexer.getHTMLTokenName(testInput);
        expect(lexer.getHTMLTokenName).toBeDefined();
        expect(typeof lexer.getHTMLTokenName).toEqual('function');
        expect(name).toEqual(testName);
    });
});
