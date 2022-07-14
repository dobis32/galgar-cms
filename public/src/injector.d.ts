import { iToken, iLexPosition, iSymbolTable } from "./interfaces/interfaces";
import { SymbolTable } from './symbolTable';
export declare const ValueInjector: {
    injectTokenSymbols(token: iToken, st: SymbolTable): iToken;
    injectSymbol(token: iToken, symbolTable: SymbolTable, controlPosition?: iLexPosition): iToken;
    getPropMapForComponentRef(componentToken: iToken, expectedProps: Array<string>, st: SymbolTable): iSymbolTable;
    getSymbolNameFromInjection(injectionString: string, controlPosition: iLexPosition): string;
    cloneToken(t: iToken): iToken;
    getInjectPositioning(input: string): iLexPosition;
};
