export class SymbolTable {
    contextStack;
    constructor(st) {
        this.contextStack = [{ aliases: {}, props: st }];
    }
    pushContext(context) {
        this.contextStack.push(context);
        return this;
    }
    addContextualSymbol(value, alias, contextIndex) {
        let result = true;
        const context = this.getContext(contextIndex);
        if (context.props[alias] === undefined && context.aliases[alias] === undefined) {
            context.aliases[alias] = value;
            result = true;
        }
        return result;
    }
    popContext() {
        const context = this.contextStack.pop();
        let result = false;
        if (context != undefined)
            result = true;
        return result;
    }
    removeSymbol(alias) {
        const context = this.getContext();
        let ret = false;
        if (context[alias] !== undefined) {
            ret = true;
            delete context[alias];
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
                const currentContext = this.getContext();
                console.log('[ SYMBOL TABLE ] Undefined symbol found:', symbolName, iteration);
                Object.keys(currentContext.aliases).forEach((key) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.aliases[key]));
                Object.keys(currentContext.props).forEach((key) => console.log('[ SYMBOL TABLE ] ' + key + ': ' + currentContext.props[key]));
            }
        }
        catch (error) {
            console.log('[ SYMBOL TABLE ERROR ]' + error);
        }
        return ret;
    }
    resolveTruthySymbol(symbolName, iterationMap) {
        let ret = false;
        const symbol = this.resolveSymbol(symbolName, iterationMap);
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
