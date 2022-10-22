import { iSymbolContext, iToken, iComponentReference, iComponentMap } from '../../src/interfaces/interfaces';
import { CONTROLIF_ELSE_TOKEN, CONTROLIF_IF_TOKEN, CONTROLIF_ENDIF_TOKEN, CONTROL_PROPS_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTENT_TOKEN } from '../../src/const/tokenTypes';
import { INTERMEDIATE_CONTENT } from '../../src/const/const';

export interface iTestPackage {
    component: iComponentReference;
    symbolTableStack: Array<iSymbolContext>;
    expectedResult?: Array<iToken>
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
    symbolTableStack: [{ aliases: {}, props: { msg: 'this is a message' } }]
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

export const TEST_TOKENS_NESTED_IF: Array<iToken> = [
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #PROPS bool1, bool2, bool3 ]]',
        raw: '[[ #PROPS bool1, bool2, bool3 ]]',
        name: CONTROL_PROPS_TOKEN,
        enumerationMap: {}
    }, 
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #IF bool1 ]]',
        raw: '[[ #IF bool1 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTENT_TOKEN,
        value: 'Bool1True',
        raw: 'Bool1True',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #IF bool2 ]]',
        raw: '[[ #IF bool2 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_CONTENT_TOKEN,
        value: 'Bool2True',
        raw: 'Bool2True',
        name: INTERMEDIATE_CONTENT,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #ELSE ]]',
        raw: '[[ #ELSE ]]',
        name: CONTROLIF_ELSE_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: 'Bool2False',
        raw: 'Bool2False',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #IF bool3 ]]',
        raw: '[[ #IF bool3 ]]',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: 'Bool3True',
        raw: 'Bool3True',
        name: CONTROLIF_IF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    },
    {
        type: _TYPE_HTML_TOKEN,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: CONTROLIF_ENDIF_TOKEN,
        enumerationMap: {}
    }
]

export const TEST_COMPONENT_NESTED_IF: iComponentReference = {
    name: "TEST_COMPONENT_NESTED_IF",
    raw: "",
    props: [ 'bool1', 'bool2', 'bool3'],
    tokens: TEST_TOKENS_NESTED_IF,
}

export const TEST_PACKAGE_NESTED_IF: iTestPackage = {
    component: TEST_COMPONENT_NESTED_IF,
    symbolTableStack: [ { aliases: {}, props: { bool1: true, bool2: false, bool3: true } } ],
    expectedResult: [
        {
            type: _TYPE_CONTENT_TOKEN,
            value: 'Bool1True',
            raw: 'Bool1True',
            name: INTERMEDIATE_CONTENT,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: 'Bool2False',
            raw: 'Bool2False',
            name: CONTROLIF_IF_TOKEN,
            enumerationMap: {}
        },
        {
            type: _TYPE_HTML_TOKEN,
            value: 'Bool3True',
            raw: 'Bool3True',
            name: CONTROLIF_IF_TOKEN,
            enumerationMap: {}
        }
    ]
}