import { iToken, iLexPosition, iSymbolTable } from "./interfaces/interfaces";
import { _TYPE_CONTROL_FOR_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_IF_TOKEN, _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN } from "./const/tokenTypes";
import { INJECT_RULE, INVALID_POSITION } from './const/const';
import { SymbolTable } from './symbolTable';

export const ValueInjector = {
    injectTokenSymbols(token: iToken, st: SymbolTable): iToken {
        let ret: iToken = this.cloneToken(token);
        let controlPosition = this.getInjectPositioning(ret.raw);
        while (controlPosition.start >= 0) {
            ret = this.injectSymbol(ret, st, controlPosition);
            controlPosition = this.getInjectPositioning(ret.raw);
        }
        return ret;
    },
    injectSymbol(token: iToken, symbolTable: SymbolTable, controlPosition?: iLexPosition): iToken {
        const ret: iToken = token;
        if (controlPosition == undefined) controlPosition = this.getInjectPositioning(token.raw);
        if (controlPosition == INVALID_POSITION) throw new Error(`[ INJECTOR ERROR ] invalid injection position found for token: ${token.value}`)
        const symbol: string = this.getSymbolNameFromInjection(token.raw, controlPosition);
        const resolved: any = symbolTable.resolveSymbol(symbol, token.enumerationMap);
        if (resolved === undefined) {
            const errMsg: string = `[ INJECTOR ERROR ] no symbol or context found for alias: ${symbol}`;
            throw new Error(errMsg);
        };
        let evaluatedSymbol: any = resolved;
        while (typeof evaluatedSymbol === 'function') {
            evaluatedSymbol = evaluatedSymbol();
        }
        ret.raw = token.raw.substring(0, controlPosition.start) + resolved + token.raw.substring(controlPosition.end + INJECT_RULE.end.length);
        ret.value = ret.raw.split('\t').filter((t) => t.length > 0).join('').trim();
        return ret;
    },
    getPropMapForComponentRef(componentToken: iToken, expectedProps: Array<string>, st: SymbolTable): iSymbolTable {
        // VALID:
        //   <CompA/>
        //   <CompA />
        //   <CompA message={{ value }} sender={{ other_value }} />
        // INVALID: 
        //   <CompA =/>
        //   <CompAmessage={{ value }} />
        //   <CompA message={{ value }}sender={{ other_value }}/>
        /*
            Strategy:
            1. Find any assignment (in other words, confirm there are props being bound)
            2. Identify assignments, verify the prop being assigned is an expected property of the target component
            3. Resolve the symbol being assigned
            4. Map to prop map
        */
        const propMap: iSymbolTable = { };
        if (expectedProps.length == 0) return propMap;
        else {
            let referenceString: string = componentToken.value;
            let nextAssignmentIndex: number = referenceString.indexOf('=');
            while (nextAssignmentIndex >= 0) {
                if (nextAssignmentIndex == -1 && expectedProps.length > 0) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): expected to find a prop but no assignment was found:\n' + componentToken.value )
                let nextSpaceIndex: number = referenceString.indexOf(' ');
                if (nextSpaceIndex == -1 || nextSpaceIndex > nextAssignmentIndex) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): invalid assignment syntax:\n' + componentToken.value);
                let propNameFound: string = referenceString.substring(nextSpaceIndex + 1, nextAssignmentIndex);
                if (expectedProps.indexOf(propNameFound) == -1) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): unrecognized prop name found:\n' + propNameFound + '\n expected: ' + expectedProps);
                let injectPosition: iLexPosition = this.getInjectPositioning(referenceString);
                let symbolName: string = this.getSymbolNameFromInjection(referenceString, injectPosition);
                let resolvedValue: any = st.resolveSymbol(symbolName);
                propMap[propNameFound] = resolvedValue;
                referenceString = referenceString.substring(injectPosition.end + INJECT_RULE.end.length);
                nextAssignmentIndex = referenceString.indexOf('=');

            }
            Object.keys(propMap).forEach((propName: string) => {
                if (expectedProps.indexOf(propName) == -1) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): unexpected prop assignment on token:\n' + componentToken.value);
            })
            if (Object.keys(propMap).length != expectedProps.length) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): could not find all required props on reference:\n' + componentToken.value);
            return propMap;
        }
    },
    getSymbolNameFromInjection(injectionString: string, controlPosition: iLexPosition): string {
        // Q: why is the symbol name being grabbed from the raw value?
        // A: the lex positions are relative to raw value because the 'value' member itself has a length that will likely change when values are injected
        if (controlPosition == INVALID_POSITION) throw new Error('[ INJECTOR ERROR ] getSymbolNameFromInjection(): bad injection position given for:\n' + injectionString);
        const adjustedStart: number = controlPosition.start + INJECT_RULE.start.length;
        const symbol: string = injectionString.substring(adjustedStart, controlPosition.end).trim();
        return symbol;
    },
    cloneToken(t: iToken): iToken {
        const clone = Object.assign({}, t);
        clone.enumerationMap = Object.assign({}, clone.enumerationMap);
        return clone;
    },
    getInjectPositioning(input: string): iLexPosition {
        let ret: iLexPosition = { start: -1, end: -1, next: -1 };
        try {
            ret.start = input.indexOf(INJECT_RULE.start);
            ret.end = input.indexOf(INJECT_RULE.end);
            if (ret.start == -1 || (ret.start > -1 && ret.start > ret.end)) throw new Error('[ INJECTOR ERROR ] getInjectPositioning(): invalid inject token positions:\n' + input);
            const adjustedInput: string = input.substring(ret.start + INJECT_RULE.start.length);
            const next: number = adjustedInput.indexOf(INJECT_RULE.start)
            if (next >= 0) ret.next = next + ret.start;
            if (ret.next as number > -1 && ret.start > ret.next) throw new Error('[ INJECTOR ERROR ] getInjectPositioning(): invalid inject token positions:\n' + input);
        } catch (error) {
            ret = INVALID_POSITION;
        } finally {
            return ret;
        }
    }
}