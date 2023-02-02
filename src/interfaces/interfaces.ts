export interface iRule {
    type: string,
    start: string,
    end: string
}

export interface iTestPackage {
    component: iComponentReference;
    symbolTableStack: Array<iSymbolContext>;
    expectedResult?: Array<iToken>
}

export interface iHTMLAttribute {
    name: string;
    value: string;
}

export interface iToken {
    type: string;
    value: string;
    raw: string;
    name: string;
    enumerationMap: iEnumerationMap;
}

export interface iLexPosition {
    start: number;
    end: number;
    next: number;
}

export interface iSymbolTable {
    [key: string]: any
}

export interface iEnumerationMap { 
    [key: string]: number
}

export interface iComponentReference {
    name: string,
    raw: string,
    props: Array<string>,
    tokens: Array<iToken>,
    path: string
}

export interface iComponentMap {
    [key: string] : iComponentReference
}

export interface iSymbolContext {
    aliases: iSymbolTable;
    props: iSymbolTable;
}
