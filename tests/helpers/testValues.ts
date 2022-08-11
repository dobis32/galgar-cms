import { iToken } from '../../src/interfaces/interfaces';
import { _TYPE_HTML_TOKEN } from '../../src/const/tokenTypes';

export const TEST_TOKEN_H1: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<h1>',
    raw: '<h1>',
    name: 'h1',
    enumerationMap: {}
};

export const TEST_TOKEN_H1_CLOSING: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '</h1>',
    raw: '</h1>',
    name: 'h1',
    enumerationMap: {}
};

export const TEST_TOKEN_INPUT: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<input />',
    raw: '<input />',
    name: 'input',
    enumerationMap: {}
};

export const TEST_TOKEN_META: iToken = {
    type: _TYPE_HTML_TOKEN,
    value: '<meta >',
    raw: '<meta >',
    name: 'meta',
    enumerationMap: {}
};