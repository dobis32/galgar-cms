import { iSymbolContext, iSymbolTable } from "./interfaces/interfaces";
export declare class SymbolTable {
    private contextStack;
    constructor(st: iSymbolTable);
    pushContext(context: iSymbolContext): SymbolTable;
    addContextualSymbol(value: any, alias: string, contextIndex?: number): boolean;
    popContext(): boolean;
    removeSymbol(alias: string): boolean;
    resolveEnumerableSymbol(symbolName: string, enumerationMap?: {
        [key: string]: number;
    }): Array<any>;
    resolveSymbol(symbolName: string, enumerationMap?: {
        [key: string]: number;
    }): any;
    resolveTruthySymbol(symbolName: string, iterationMap: {
        [key: string]: number;
    }): boolean;
    getContext(index?: number): iSymbolContext;
    setContextProps(props: iSymbolTable, index?: number): void;
    private walkToValue;
    private lookupSymbol;
}