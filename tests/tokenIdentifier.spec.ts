import { TokenIdentifier } from '../src/tokenIdentifier';
import { iToken } from '../src/interfaces/interfaces';
import { CLOSING_EXEMPT_TAGS } from '../src/const/const';

import { TEST_TOKEN_H1, TEST_TOKEN_INPUT, TEST_TOKEN_H1_CLOSING, TEST_TOKEN_META } from './helpers/testValues';
describe('tokenIdentifier.ts', () => {
    const identifier: any = TokenIdentifier;
    let test_h1_token: iToken;
    let test_h1_closing_token: iToken;
    let test_input_token: iToken;
    let closingExemptTag: iToken;
    beforeEach(() => {
        test_h1_token = Object.assign({}, TEST_TOKEN_H1);
        test_h1_closing_token = Object.assign({}, TEST_TOKEN_H1_CLOSING);
        test_input_token = Object.assign({}, TEST_TOKEN_INPUT);
        closingExemptTag = TEST_TOKEN_META;
    });

    it('should have a function to determine if a provided token is a self-closing tag', () => { 
        const result1: boolean = identifier.isSelfClosingTag(test_input_token);
        const result2: boolean = identifier.isSelfClosingTag(test_h1_token);

        expect(identifier.isSelfClosingTag).toBeDefined();
        expect(typeof identifier.isSelfClosingTag).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });

    it('should have a function to determine if a provided token requires a closing tag', () => {
        const result1: boolean = identifier.tagMustBeClosed(test_h1_token);
        const result2: boolean = identifier.tagMustBeClosed(closingExemptTag);
        const result3: boolean = identifier.tagMustBeClosed(test_input_token);

        expect(identifier.tagMustBeClosed).toBeDefined();
        expect(typeof identifier.tagMustBeClosed).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
        expect(result3).toEqual(true);

    });

    it('should have a function to determine if a provided token is a closing tag', () => {
        const result1: boolean = identifier.isClosingTag(test_h1_closing_token);
        const result2: boolean = identifier.isClosingTag(test_input_token);

        expect(identifier.isClosingTag).toBeDefined();
        expect(typeof identifier.isClosingTag).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });
});