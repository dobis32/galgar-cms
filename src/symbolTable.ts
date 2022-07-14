import { iSymbolContext, iSymbolTable, iToken } from "./interfaces/interfaces";

export class SymbolTable {
    private contextStack: Array<iSymbolContext>;
    constructor(contextStack: Array<iSymbolContext>) {
        this.contextStack = contextStack;
    }

    pushContext(context: iSymbolContext): SymbolTable {
        this.contextStack.push(context);
        return this;
    }

    addContextualSymbol(value: any, symbol: string, contextIndex?: number): boolean {
        let result: boolean = false;
        const context: iSymbolContext = this.getContext(contextIndex);
        if (context.props[symbol] === undefined && context.aliases[symbol] === undefined) {
            context.aliases[symbol] = value;
            result = true;
        }
        return result;
    }

    popContext(): iSymbolContext {
        const context: iSymbolContext = this.contextStack.pop() as iSymbolContext;
        return context;
    }

    removeSymbol(alias: string): boolean {
        const context: iSymbolContext = this.getContext();
        let ret: boolean = false;
        if (context.aliases[alias] !== undefined) {
            ret = true;
            delete context.aliases[alias];
        }
        if (context.props[alias] !== undefined) {
            ret = true;
            delete context.props[alias];
        }
        return ret;
    }

    resolveEnumerableSymbol(symbolName: string, enumerationMap?: { [key: string ]: number }): Array<any> {
        let ret: Array<any>;
        let symbol: any;
        symbol = this.resolveSymbol(symbolName, enumerationMap);
        if (!Array.isArray(symbol)) {
            const errMsg = `[ SYMBOL TABLE ERROR ] resolveEnumerableSymbol(): enumerable token referenced non-enumerable symbol (symbol name: ${symbolName}) ${symbol}`;
            throw new Error(errMsg);
        };
        ret = symbol;
        return ret;
    }

    resolveSymbol(symbolName: string, enumerationMap?: { [key: string]: number }): any {
        let ret: any;
        try {
            const symbolTokens = symbolName.split('.').map((s: string) => s.trim());
            const rootToken: string = symbolTokens.shift() as string;
            const iteration: number = enumerationMap ? enumerationMap[rootToken] : -1;
            let rootSymbol: any = this.lookupSymbol(rootToken, iteration);
            if (symbolTokens.length > 0) {
                const context: iSymbolTable = rootSymbol;
                ret = this.walkToValue(symbolTokens, context);
            }
            else ret = rootSymbol;
            if (ret == undefined) {
                /* const currentContext: iSymbolContext = this.getContext();
                console.log('[ SYMBOL TABLE ] Undefined symbol found:', symbolName, iteration);
                Object.keys(currentContext.aliases).forEach((key: string) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.aliases[key]));
                Object.keys(currentContext.props).forEach((key: string) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.props[key]));
                */
                throw new Error('[ SYMBOL TABLE ] resolveSymbol(): failed to resolve symbol: ' + symbolName);
            }
        } catch(error) {
            console.log('[ SYMBOL TABLE ERROR ]' + error)
        }
        return ret;
    }

    resolveTruthySymbol(symbolName: string, iterationMap: { [key: string]: number }): boolean {
        let ret: boolean = false;
        const symbol = this.resolveSymbol(symbolName, iterationMap);
        if (typeof symbol == 'function') {
            const result = symbol() as Function;
            ret = result ? true : false;
        }
        else ret = symbol ? true : false;
        return ret;
    }

    getContext(index?: number): iSymbolContext {
        let lastIndex: number = this.contextStack.length - 1;
        let context: iSymbolContext;
        if (index != undefined && index >= 0) context = this.contextStack[index];
        else context = this.contextStack[lastIndex];
        if (context == undefined) throw new Error('[ SYMBOL TABLE ERROR ] getContext(): Tried to get any context, but none was found');
        return context;
    }

    setContextProps(props: iSymbolTable, index?: number): void {
        const context: iSymbolContext = this.getContext(index);
        context.props = props;
    }

    walkToValue(pathTokens: Array<string>, initContext: iSymbolTable): any {
        let resolved: any = initContext;
        let token: string;
        let context: iSymbolTable;
        while (pathTokens.length) {
            context = resolved;
            token = pathTokens.shift() as string;
            resolved = context[token];
        }
        const value = resolved;
        return value;
    }

    lookupSymbol(symbol: string, enumeration?: number): any {
        /* algorithm summary:
            1. try to get a value from the context stack
                1a. try to get a value from props
                1b. try to get a value from aliases */
        let ret: any = undefined;
        let context: iSymbolContext = this.getContext();
        ret = context.props[symbol];
        if ( ret == undefined && (enumeration != undefined && enumeration >= 0)) ret = context.aliases[symbol][enumeration];
        return ret;
    }
}
