export class SymbolTable {
    contextStack;
    constructor(contextStack) {
        this.contextStack = contextStack;
    }
    pushContext(context) {
        this.contextStack.push(context);
        return this;
    }
    addContextualSymbol(value, symbol, contextIndex) {
        let result = false;
        const context = this.getContext(contextIndex);
        if (context.props[symbol] === undefined && context.aliases[symbol] === undefined) {
            context.aliases[symbol] = value;
            result = true;
        }
        return result;
    }
    popContext() {
        const context = this.contextStack.pop();
        return context;
    }
    removeSymbol(alias) {
        const context = this.getContext();
        let ret = false;
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
    resolveEnumerableSymbol(symbolName, enumerationMap) {
        let ret;
        let symbol;
        symbol = this.resolveSymbol(symbolName, enumerationMap);
        if (!Array.isArray(symbol)) {
            const errMsg = `[ SYMBOL TABLE ERROR ] resolveEnumerableSymbol(): enumerable token referenced non-enumerable symbol (symbol name: ${symbolName}) ${symbol}`;
            throw new Error(errMsg);
        }
        ;
        ret = symbol;
        return ret;
    }
    resolveSymbol(symbolName, enumerationMap) {
        let ret;
        try {
            const symbolTokens = symbolName.split('.').map((s) => s.trim());
            const rootToken = symbolTokens.shift();
            const iteration = enumerationMap ? enumerationMap[rootToken] : -1;
            let rootSymbol = this.lookupSymbol(rootToken, iteration);
            if (symbolTokens.length > 0) {
                const context = rootSymbol;
                ret = this.walkToValue(symbolTokens, context);
            }
            else
                ret = rootSymbol;
            if (ret == undefined) {
                /* const currentContext: iSymbolContext = this.getContext();
                console.log('[ SYMBOL TABLE ] Undefined symbol found:', symbolName, iteration);
                Object.keys(currentContext.aliases).forEach((key: string) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.aliases[key]));
                Object.keys(currentContext.props).forEach((key: string) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.props[key]));
                */
                throw new Error('[ SYMBOL TABLE ] resolveSymbol(): failed to resolve symbol: ' + symbolName);
            }
        }
        catch (error) {
            console.log('[ SYMBOL TABLE ERROR ]' + error);
        }
        return ret;
    }
    resolveTruthySymbol(symbolName, enumerationMap) {
        let ret = false;
        const symbol = this.resolveSymbol(symbolName, enumerationMap);
        if (typeof symbol == 'function') {
            const result = symbol();
            ret = result ? true : false;
        }
        else
            ret = symbol ? true : false;
        return ret;
    }
    getContext(index) {
        let lastIndex = this.contextStack.length - 1;
        let context;
        if (index != undefined && index >= 0)
            context = this.contextStack[index];
        else
            context = this.contextStack[lastIndex];
        if (context == undefined)
            throw new Error('[ SYMBOL TABLE ERROR ] getContext(): Tried to get any context, but none was found');
        return context;
    }
    setContextProps(props, index) {
        const context = this.getContext(index);
        context.props = props;
    }
    walkToValue(pathTokens, initContext) {
        let resolved = initContext;
        let token;
        let context;
        while (pathTokens.length) {
            context = resolved;
            token = pathTokens.shift();
            resolved = context[token];
        }
        const value = resolved;
        return value;
    }
    lookupSymbol(symbol, enumeration) {
        /* algorithm summary:
            1. try to get a value from the context stack
                1a. try to get a value from props
                1b. try to get a value from aliases */
        let ret = undefined;
        let context = this.getContext();
        ret = context.props[symbol];
        if (ret == undefined && (enumeration != undefined && enumeration >= 0))
            ret = context.aliases[symbol][enumeration];
        return ret;
    }
}
