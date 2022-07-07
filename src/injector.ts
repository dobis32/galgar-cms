import { iToken, iLexPosition, iSymbolTable, iComponentReference } from "./interfaces/interfaces";
import { _TYPE_CONTROL_FOR_TOKEN, _TYPE_HTML_TOKEN, _TYPE_CONTROL_IF_TOKEN, _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN } from "./const/tokenTypes";
import { INJECT_RULE } from './const/const';
import { SymbolTable } from './symbolTable';

export const ValueInjector = {
    injectTokenSymbols(token: iToken, st: SymbolTable): iToken {
        let ret: iToken = this.cloneToken(token);
        let controlPosition = this.getInjectPositioning(ret.raw);
        while (controlPosition.start >= 0) {
            ret = this.injectSymbol(ret, controlPosition, st);
            controlPosition = this.getInjectPositioning(ret.raw);
        }
        return ret;
    },
    injectSymbol(token: iToken, controlPosition: iLexPosition, symbolTable: SymbolTable): iToken {
        const ret: iToken = this.cloneToken(token);
        const symbol: string = this.getSymbolNameFromRawInjection(token.raw, controlPosition);
        const resolved: any = symbolTable.resolveSymbol(symbol, token.enumerationMap);
        if (resolved === undefined) {
            const errMsg: string = `[ INJECTOR ERROR ] no symbol or context found for alias: ${symbol}`;
            throw new Error(errMsg);
        };
        let evaluatedSymbol: any = resolved;
        while (typeof evaluatedSymbol === 'function') {
            evaluatedSymbol = evaluatedSymbol();
        }
        // const symbolValueType: string = typeof evaluatedSymbol;
        // if (symbolValueType != 'string' && symbolValueType != 'number') throw new Error(`[ INJECTOR ERROR ] evaluated symbol (${ symbol }) is neither a number or a string: ${ evaluatedSymbol } (${ typeof evaluatedSymbol })`);
        ret.raw = token.raw.substring(0, controlPosition.start) + resolved + token.raw.substring(controlPosition.end + INJECT_RULE.end.length);
        ret.value = ret.raw.split('\t').filter((t) => t.length > 0).join('').trim();
        return ret;
    },
    getPropMapForComponentRef(componentToken: iToken, props: Array<string>, st: SymbolTable): iSymbolTable {
        const propMap: iSymbolTable = { };
        // <CompA message={{ value }} />
        // <CompA message={{ value }}/>
        // <CompA =/>

        /*
            Strategy:
            1. Find first space in tokens value and substring
            2. Identify assignments, verify the prop being assigned is an expected property of the target component
            3. Resolve the symbol being assigned
            4. Map to prop map
        */
        if (props.length == 0) return propMap;
        else {
            const referenceString: string = componentToken.value;
            const resolvedProps: Array<string> = [];
            const firstSpaceIndex: number = referenceString.indexOf(' ');
            if (firstSpaceIndex < 0 && props.length > 0) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Expected properties on component but none were found.\n\nComponent: ' + referenceString);
            let adjustedReferenceString = referenceString.substring(firstSpaceIndex + 1).trim();
            let nextAssignmentIndex: number = adjustedReferenceString.indexOf('=');
            while (nextAssignmentIndex >= 0) {
                let propNameToAssign: string = adjustedReferenceString.substring(0, nextAssignmentIndex).trim();
                if (props.indexOf(propNameToAssign) < 0) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Unexpected prop assignment found: ' + referenceString + '\n\nlooking for prop: ' + propNameToAssign);
                let nextInjectPosition: iLexPosition = this.getInjectPositioning(adjustedReferenceString);
                if ((nextInjectPosition.start == -1 || nextInjectPosition.end == -1) && (resolvedProps.length != props.length)) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Expected more injections on component instance:\n\n' + referenceString);
                const injectedSymbolName: string = this.getSymbolNameFromRawInjection(adjustedReferenceString, nextInjectPosition);
                const valueToInject: any = st.resolveSymbol(injectedSymbolName);
                propMap[propNameToAssign] = valueToInject;
                adjustedReferenceString = adjustedReferenceString.substring(nextInjectPosition.end + INJECT_RULE.end.length).trim();
                nextAssignmentIndex = adjustedReferenceString.indexOf('=');
            }
            return propMap;
        }
        



        // const componentToMap: string = componentToken.value;
        // props.forEach((propName: string) => {
        //     const propIndex: number = componentToMap.indexOf(propName);
        //     if (propIndex < 0) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Failed to build prop map for component, expected prop "' + propName + '" but none was found');
        //     if (componentToMap[propIndex - 1] == ' ' && componentToMap[propIndex + 1] == '=') {
        //         const adjustedComponentInstance: string = componentToMap.substring(propIndex)
        //         console.log('building prop map')
        //         const adjustedInjectionPosition: iLexPosition = this.getInjectPositioning(adjustedComponentInstance);
        //         const adjustedAssignmentIndex: number =  propName.length;
        //         if (adjustedComponentInstance[adjustedAssignmentIndex] != '='|| adjustedComponentInstance.indexOf('{{') < 0) {
        //             throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Failed to build prop map, prop injection syntax error: ' + componentToken.value);
        //         }
        //         if (adjustedInjectionPosition.end < 0 || adjustedAssignmentIndex != adjustedInjectionPosition.start - 1) throw new Error('[ INJECTOR ERROR ] getPropMapForComponentRef(): Failed to build propMap, prop injection syntax error: ' + componentToken.value);
        //         const injectedSymbolName: string = this.getSymbolNameFromRawInjection(adjustedComponentInstance, adjustedInjectionPosition);
        //         const valueToInject: any = st.resolveSymbol(injectedSymbolName);
        //         propMap[propName] = valueToInject;
        //     }
        // });
        //return propMap;
    },
    getSymbolNameFromRawInjection(rawToken: string, controlPosition: iLexPosition): string {
        // why is the symbol name being grabbed from the raw value?
        // the lex positions are relative to raw value because the 'value' member itself has a length that will likely change when values are injected
        const adjustedStart: number = controlPosition.start + INJECT_RULE.start.length;
        const symbol: string = rawToken.substring(adjustedStart, controlPosition.end).trim();
        return symbol;
    },
    cloneToken(t: iToken): iToken {
        const clone = Object.assign({}, t);
        clone.enumerationMap = Object.assign({}, clone.enumerationMap);
        return clone;
    },
    getInjectPositioning(input: string): iLexPosition {
        const ret: iLexPosition = { start: -1, end: -1, next: -1 };
        ret.start = input.indexOf(INJECT_RULE.start);
        ret.end = input.indexOf(INJECT_RULE.end);
        if (ret.start > -1 && ret.start > ret.end) throw new Error('[ INJECTOR ERROR ] invalid inject token positions:\n' + input);
        ret.next = input.substring(ret.start + INJECT_RULE.start.length).indexOf(INJECT_RULE.start) + ret.start;
        if (ret.next > -1 && ret.start > ret.next) throw new Error('[ INJECTOR ERROR ] invalid inject token positions:\n' + input);
        return ret;
    }
}