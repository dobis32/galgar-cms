import { iSymbolContext, iToken, iComponentReference, iComponentMap } from '../../src/interfaces/interfaces';
import { _TYPE_HTML_TOKEN, _TYPE_CONTENT_TOKEN } from '../../src/const/tokenTypes';
import { INTERMEDIATE_CONTENT } from '../../src/const/const';

export interface iTestPackage {
    component: iComponentReference;
    symbolTableStack: Array<iSymbolContext>;
}

export const TEST_COMPONENT_DYNAMIC_HEADER: iComponentReference = {
    name: 'TEST COMPONENT DYNAMIC HEADER',
    raw: '<h1>{{ msg }}</h1>',
    tokens: [
        {
            type: _TYPE_HTML_TOKEN,
            value: '<h1>',
            raw: '<h1>',
            name: 'h1',
            enumerationMap: {}
        },
        {
            type: _TYPE_CONTENT_TOKEN,
            value: '{{ msg }}',
            raw: '{{ msg }}',
            name: INTERMEDIATE_CONTENT,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: '</h1>',
            raw: '</h1>',
            name: 'h1',
            enumerationMap: {}
        }
    ],
    props: [ 'msg' ]
}

export const TEST_PACKAGE_DYNAMIC_HEADER: iTestPackage = {
    component: TEST_COMPONENT_DYNAMIC_HEADER,
    symbolTableStack: [{ aliases: {}, props: { msg: 'this is a message ' } }]
}

export const TEST_COMPONENT_DYNAMIC_INPUT: iComponentReference = {
    name: 'TEST COMPONENT DYNAMIC INPUT',
    raw: '<input value="{{ val }}">',
    tokens: [
        {
            type: _TYPE_HTML_TOKEN,
            value: '<input value="{{ val }}">',
            raw: '<input value="{{ val }}">',
            name: 'input',
            enumerationMap: {}
        }
    ],
    props: [ 'val' ]
}

export const TESTING_COMPONENT_REF_MAP: iComponentMap = {
    TEST_INPUT: TEST_COMPONENT_DYNAMIC_INPUT,
    TEST_HEADER: TEST_COMPONENT_DYNAMIC_HEADER
}

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