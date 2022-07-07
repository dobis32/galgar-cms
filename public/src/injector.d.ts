import { iToken, iLexPosition, iSymbolTable } from "./interfaces/interfaces";
import { SymbolTable } from './symbolTable';
export declare const ValueInjector: {
    injectTokenSymbols(token: iToken, st: SymbolTable): iToken;
    injectSymbol(token: iToken, controlPosition: iLexPosition, symbolTable: SymbolTable): iToken;
    getPropMapForComponentRef(componentToken: iToken, props: Array<string>, st: SymbolTable): iSymbolTable;
    getSymbolNameFromRawInjection(rawToken: string, controlPosition: iLexPosition): string;
    cloneToken(t: iToken): iToken;
    getInjectPositioning(input: string): iLexPosition;
};
