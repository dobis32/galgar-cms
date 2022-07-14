import { iSymbolContext, iSymbolTable } from "./interfaces/interfaces";
export declare class SymbolTable {
    private contextStack;
    constructor(contextStack: Array<iSymbolContext>);
    pushContext(context: iSymbolContext): SymbolTable;
    addContextualSymbol(value: any, symbol: string, contextIndex?: number): boolean;
    popContext(): iSymbolContext;
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
    walkToValue(pathTokens: Array<string>, initContext: iSymbolTable): any;
    lookupSymbol(symbol: string, enumeration?: number): any;
}
