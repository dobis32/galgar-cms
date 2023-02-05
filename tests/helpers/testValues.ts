import { iSymbolContext, iToken, iComponentReference, iComponentMap } from '../../src/interfaces/interfaces';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP } from '../../src/const/tokenData';

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
            type: _TOKEN_TYPES_MAP.HTML,
            value: '<h1>',
            raw: '<h1>',
            name: 'h1',
            enumerationMap: {}
        },
        {
            type: _TOKEN_TYPES_MAP.CONTENT,
            value: '{{ msg }}',
            raw: '{{ msg }}',
            name: _TOKEN_NAMES_MAP.CONTENT,
            enumerationMap: {}
        },
        {
            type: _TOKEN_TYPES_MAP.HTML,
            value: '</h1>',
            raw: '</h1>',
            name: 'h1',
            enumerationMap: {}
        }
    ],
    path: 'SOME_PATH',
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
            type: _TOKEN_TYPES_MAP.HTML,
            value: '<input value="{{ val }}">',
            raw: '<input value="{{ val }}">',
            name: 'input',
            enumerationMap: {}
        }
    ],
    path: 'SOME_PATH',
    props: [ 'val' ]
}

export const TESTING_COMPONENT_REF_MAP: iComponentMap = {
    TEST_INPUT: TEST_COMPONENT_DYNAMIC_INPUT,
    TEST_HEADER: TEST_COMPONENT_DYNAMIC_HEADER
}

export const TEST_TOKEN_H1: iToken = {
    type: _TOKEN_TYPES_MAP.HTML,
    value: '<h1>',
    raw: '<h1>',
    name: 'h1',
    enumerationMap: {}
};

export const TEST_TOKEN_H1_CLOSING: iToken = {
    type: _TOKEN_TYPES_MAP.HTML,
    value: '</h1>',
    raw: '</h1>',
    name: 'h1',
    enumerationMap: {}
};

export const TEST_TOKEN_INPUT: iToken = {
    type: _TOKEN_TYPES_MAP.HTML,
    value: '<input />',
    raw: '<input />',
    name: 'input',
    enumerationMap: {}
};

export const TEST_TOKEN_META: iToken = {
    type: _TOKEN_TYPES_MAP.HTML,
    value: '<meta >',
    raw: '<meta >',
    name: 'meta',
    enumerationMap: {}
};

export const TEST_TOKENS_NESTED_IF: Array<iToken> = [
    {
        type: _TOKEN_TYPES_MAP.PROPS,
        value: '[[ #PROPS bool1, bool2, bool3 ]]',
        raw: '[[ #PROPS bool1, bool2, bool3 ]]',
        name: _TOKEN_NAMES_MAP.PROPS,
        enumerationMap: {}
    }, 
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #IF bool1 ]]',
        raw: '[[ #IF bool1 ]]',
        name: _TOKEN_NAMES_MAP.IF,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'Bool1True',
        raw: 'Bool1True',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #IF bool2 ]]',
        raw: '[[ #IF bool2 ]]',
        name: _TOKEN_NAMES_MAP.IF,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'Bool2True',
        raw: 'Bool2True',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #ELSE ]]',
        raw: '[[ #ELSE ]]',
        name: _TOKEN_NAMES_MAP.ELSE,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'Bool2False',
        raw: 'Bool2False',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #IF bool3 ]]',
        raw: '[[ #IF bool3 ]]',
        name: _TOKEN_NAMES_MAP.IF,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.CONTENT,
        value: 'Bool3True',
        raw: 'Bool3True',
        name: _TOKEN_NAMES_MAP.CONTENT,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: _TOKEN_NAMES_MAP.ENDIF,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: _TOKEN_NAMES_MAP.ENDIF,
        enumerationMap: {}
    },
    {
        type: _TOKEN_TYPES_MAP.IF,
        value: '[[ #ENDIF ]]',
        raw: '[[ #ENDIF ]]',
        name: _TOKEN_NAMES_MAP.ENDIF,
        enumerationMap: {}
    }
]

export const TEST_COMPONENT_NESTED_IF: iComponentReference = {
    name: "TEST_COMPONENT_NESTED_IF",
    raw: "",
    path: 'SOME_PATH',
    props: [ 'bool1', 'bool2', 'bool3'],
    tokens: TEST_TOKENS_NESTED_IF,
}

export const TEST_PACKAGE_NESTED_IF: iTestPackage = {
    component: TEST_COMPONENT_NESTED_IF,
    symbolTableStack: [ { aliases: {}, props: { bool1: true, bool2: false, bool3: true } } ],
    expectedResult: [
        {
            type: _TOKEN_TYPES_MAP.CONTENT,
            value: 'Bool1True',
            raw: 'Bool1True',
            name: _TOKEN_NAMES_MAP.CONTENT,
            enumerationMap: {}
        },
        {
            type: _TOKEN_TYPES_MAP.CONTENT,
            value: 'Bool2False',
            raw: 'Bool2False',
            name: _TOKEN_NAMES_MAP.CONTENT,
            enumerationMap: {}
        },
        {
            type: _TOKEN_TYPES_MAP.CONTENT,
            value: 'Bool3True',
            raw: 'Bool3True',
            name: _TOKEN_NAMES_MAP.CONTENT,
            enumerationMap: {}
        }
    ]
}