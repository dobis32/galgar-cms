import { CONTROL_FOR_ALIAS_INDEX, CONTROL_FOR_PREPOSITION_INDEX, CONTROL_FOR_SYMBOL_INDEX, CONTROL_RULE, FN_CLONE_TOKEN, FN_GET_PROPS_ARRAY } from './const/const';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP, _CONTROL_TOKEN_SUFFIX } from "./const/tokenData";
import { AlgebraSolver } from "./booleanSolver";
import { ValueInjector } from "./injector";
import { TokenIdentifier } from "./tokenIdentifier";
import * as _path from "path";
export default class TokenParser {
    input;
    initProps;
    symbolTable;
    outputTokens;
    componentMap;
    componentAliasStack;
    constructor(tokens, st, initProps, initComponentMap, cas) {
        this.input = tokens.map((t) => t);
        this.outputTokens = [];
        this.initProps = initProps;
        this.symbolTable = st;
        this.componentMap = initComponentMap;
        this.componentAliasStack = cas ? cas : [];
    }
    getSymbolTable() {
        return this.symbolTable;
    }
    getTokens() {
        return this.input;
    }
    // getComponentMap(): iComponentMap {
    //     return this.componentMap;
    // }
    parse() {
        const props = this.initProps;
        const isValid = this.validate();
        if (isValid == false)
            throw new Error('[ PARSER ERROR ] parse(): Input not valid; be sure to run validate()');
        const outputTokens = this.initParse(this.input, props);
        this.outputTokens = outputTokens;
        return this.outputTokens;
    }
    getAliasComponentMap(index) {
        const stack = this.componentAliasStack;
        let ret;
        if (stack.length == 0)
            throw new Error('[ PARSER ERROR ] getAliasComponentMap(): No alias component map in the stack to get');
        if (index != undefined)
            ret = stack[index];
        else
            ret = stack[stack.length - 1];
        return ret;
    }
    initParse(tokens, propsArray) {
        try {
            let clonedTokens = [];
            tokens.forEach((t) => {
                const clone = FN_CLONE_TOKEN(t);
                clonedTokens.push(clone);
            });
            this.componentAliasStack.push({});
            const props = this.buildPropsMap(propsArray);
            const aliases = {};
            const context = { aliases, props };
            const output = this.parseTokens(clonedTokens, context);
            return output;
        }
        catch (error) {
            throw new Error('[ PARSER ERROR ] initParse(): ' + error);
        }
    }
    buildPropsMap(props) {
        const map = {};
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const value = this.symbolTable.resolveSymbol(prop);
            if (value == undefined) {
                const errMsg = `[ PARSER ERROR ] buildPropsMap(): Failed to build init prop map, missing value for prop ${prop}`;
                throw new Error(errMsg);
            }
            else
                map[prop] = value;
        }
        return map;
    }
    parseTokens(input, context) {
        try {
            const output = [];
            this.symbolTable.pushContext(context);
            while (input.length > 0) {
                const tok = input.shift();
                switch (tok.type) {
                    case _TOKEN_TYPES_MAP.PROPS:
                        this.processPropsToken(tok);
                        break;
                    case _TOKEN_TYPES_MAP.IF:
                        input = this.parseIfControl(tok, input);
                        break;
                    case _TOKEN_TYPES_MAP.FOR:
                        input = this.parseForControl(tok, input);
                        break;
                    case _TOKEN_TYPES_MAP.COMPONENT:
                        this.parseComponentControl(tok); // this won't add any new components if the alias already exists
                        break;
                    default:
                        const isValidRef = this.tokenIsAValidComponentReference(tok);
                        if (tok.type == _TOKEN_TYPES_MAP.COMPONENT && !isValidRef) {
                            const errMsg = '[ PARSER ERROR ] parseTokens(): Could not find component reference' + tok.name;
                            throw new Error(errMsg);
                        }
                        if (TokenIdentifier.isSelfClosingTag(tok) && isValidRef) {
                            input = this.processComponentReference(tok, input);
                        }
                        else {
                            const processed = ValueInjector.injectTokenSymbols(tok, this.symbolTable);
                            output.push(processed);
                        }
                        break;
                }
            }
            this.symbolTable.popContext();
            return output;
        }
        catch (error) {
            throw new Error('[ PARSER ERROR ] parseTokens(): ' + error);
        }
    }
    tokenIsAValidComponentReference(token) {
        const keys = Object.keys(this.getAliasComponentMap());
        return keys.indexOf(token.name) > -1 ? true : false;
    }
    processPropsToken(propsToken) {
        const propsArray = FN_GET_PROPS_ARRAY(propsToken);
        const propsMap = this.buildPropsMap(propsArray);
        this.symbolTable.setContextProps(propsMap);
    }
    processComponentReference(componentToken, tokens) {
        try {
            const aliasMap = this.getAliasComponentMap();
            const componentRef = aliasMap[componentToken.name];
            const props = componentRef.props;
            const propMap = ValueInjector.getPropMapForComponentRef(componentToken, props, this.symbolTable);
            const compTokens = [];
            componentRef.tokens.forEach((t) => {
                const clone = FN_CLONE_TOKEN(t);
                compTokens.push(clone);
            });
            this.componentAliasStack.push({});
            const context = { aliases: {}, props: propMap };
            const processedComponentTokens = this.parseTokens(compTokens, context);
            this.componentAliasStack.pop();
            const result = this.tokensToFrontOfQueue(tokens, processedComponentTokens);
            return result;
        }
        catch (error) {
            throw new Error('[ PARSER ERROR ] processComponentReference(): ' + error);
        }
    }
    parseComponentControl(controlToken) {
        const compMap = this.getAliasComponentMap();
        const temp = controlToken.value.split(' '); // [[ #IMPORT ComponentPath AS Alias ]]
        const path = temp[2].replaceAll('/', _path.sep).split(_path.sep).pop();
        const identifier = path.replace('.ggd', '');
        const alias = temp[4] ? temp[4] : identifier;
        const component = this.componentMap[identifier];
        if (component == undefined)
            throw new Error('[ PARSER ERROR ] parseComponentControl(): Failed to find component reference with identifier ' + identifier);
        this.setComponentAlias(component, alias);
    }
    setComponentAlias(component, alias) {
        const aliasMap = this.getAliasComponentMap();
        if (aliasMap[alias] == undefined)
            aliasMap[alias] = component;
        else
            throw new Error('[ PARSER ERROR ] setComponentAlias(): duplicate alias found ' + alias);
    }
    tokensToFrontOfQueue(queue, tokensToAdd) {
        const temp = [];
        while (tokensToAdd.length)
            temp.push(tokensToAdd.shift());
        while (queue.length)
            temp.push(queue.shift());
        return temp;
    }
    parseForControl(controlToken, tokens) {
        const result = this.processForControl(controlToken, tokens);
        const temp = this.tokensToFrontOfQueue(tokens, result);
        return temp;
    }
    parseIfControl(controlToken, tokens) {
        const result = this.processIfControl(controlToken, tokens);
        const temp = this.tokensToFrontOfQueue(tokens, result);
        return temp;
    }
    processIfControl(controlToken, tokens) {
        let ret = [];
        const { next, end } = this.getControlPositioning(tokens, controlToken.type);
        if (this.controlIfEvaluate(controlToken)) {
            const keepUntil = next >= 0 ? next : end;
            let i = 0;
            while (i < keepUntil) { // keep tokens until next IF/ELSEIF/ELSE/ENDIF control
                ret.push(tokens.shift());
                i++;
            }
            while (i <= end) { // get rid of everything from next IF index up to (and including) END control
                tokens.shift();
                i++;
            }
            while (tokens.length)
                ret.push(tokens.shift());
        }
        else { // shift to next/end clause
            let i = 0;
            const stop = next >= 0 ? next : end;
            while (i < stop) {
                tokens.shift();
                i++;
            }
            while (tokens.length) {
                ret.push(tokens.shift());
            }
        }
        return ret;
    }
    processForControl(controlToken, tokens) {
        let ret = [];
        if (controlToken.name === _TOKEN_NAMES_MAP.FOR) {
            const { end } = this.getControlPositioning(tokens, controlToken.type);
            const loopingTokens = [];
            let i = 0;
            while (i < end) {
                loopingTokens.push(tokens.shift());
                i++;
            }
            tokens.shift(); // remove ENDIF token
            const { enumerable, alias } = this.controlForEvaluate(controlToken);
            ret = this.inflateForControl(loopingTokens, enumerable, alias);
        }
        return ret;
    }
    inflateForControl(tokens, enumerableContext, contextualAlias) {
        try {
            const ret = [];
            for (let j = 0; j < enumerableContext.length; j++) { // loop over contexts
                const tokensToParse = [];
                this.symbolTable.addContextualSymbol(enumerableContext, contextualAlias); // add context
                tokens.forEach((t) => {
                    const clone = FN_CLONE_TOKEN(t);
                    if (clone.enumerationMap[contextualAlias] != undefined) {
                        const errMsg = `[ PARSER ERROR ] inflateForControl(): duplicate context found in the same source file. Offending context: ${contextualAlias}`;
                        throw new Error(errMsg);
                    }
                    clone.enumerationMap[contextualAlias] = j;
                    tokensToParse.push(clone);
                });
                const context = this.symbolTable.getContext();
                const parsedTokens = this.parseTokens(tokensToParse, context);
                while (parsedTokens.length)
                    ret.push(parsedTokens.shift());
            }
            return ret;
        }
        catch (error) {
            throw new Error('[ PARSER ERROR ] inflateForControl(): ' + error);
        }
    }
    getOutputAsText() {
        let ret = '';
        const closingStack = [];
        for (let k = 0; k < this.outputTokens.length; k++) {
            const t = this.outputTokens[k];
            console.log(t);
            let tabs = '';
            if (t.type == _TOKEN_TYPES_MAP.WHITESPACE)
                continue;
            if (t.type == _TOKEN_TYPES_MAP.HTML && !TokenIdentifier.isSelfClosingTag(t)) { // is non-self-closing HTML tag
                if (TokenIdentifier.tagMustBeClosed(t)) { // is an HTML tag that must be closed
                    const isClosing = TokenIdentifier.isClosingTag(t);
                    if (!isClosing) { // is an open HTML tag
                        closingStack.push(t);
                    }
                    else { // is a closing HTML tag
                        if (closingStack.length > 1)
                            tabs += '\t';
                        closingStack.pop();
                    }
                }
                else if (closingStack.length > 0)
                    tabs += '\t';
            }
            for (let i = 1; i < closingStack.length; i++) {
                tabs += '\t';
            }
            if (t.name === _TOKEN_NAMES_MAP.CONTENT)
                tabs += '\t';
            if (k > 0)
                ret += '\n';
            ret += tabs + t.value;
        }
        return ret;
    }
    getControlPositioning(tokens, controlType) {
        let nextControlIndex = -1;
        let endControlIndex = -1;
        if (controlType == _TOKEN_TYPES_MAP.IF) {
            const closingStack = [];
            for (let i = 0; i < tokens.length; i++) {
                const tok = tokens[i];
                if (tok.name == _TOKEN_NAMES_MAP.IF)
                    closingStack.push(tok);
                else if (nextControlIndex < 0 && closingStack.length == 0 && (tok.name == _TOKEN_NAMES_MAP.ELSEIF || tok.name == _TOKEN_NAMES_MAP.ELSE)) {
                    nextControlIndex = i;
                }
                else if (tok.name == _TOKEN_NAMES_MAP.ENDIF) {
                    if (closingStack.length == 0) {
                        endControlIndex = i; // this is the ENDIF control corresponding to the assumed IF control
                    }
                    else
                        closingStack.pop();
                }
                if (endControlIndex > -1)
                    break; // when we found the end of the assumed IF control
            }
        }
        else if (controlType == _TOKEN_TYPES_MAP.FOR) {
            const closingStack = [];
            for (let i = 0; i < tokens.length; i++) {
                const tok = tokens[i];
                if (tok.name == _TOKEN_NAMES_MAP.FOR)
                    closingStack.push(tok);
                else if (tok.name == _TOKEN_NAMES_MAP.ENDFOR) {
                    if (closingStack.length == 0) {
                        endControlIndex = i;
                        break;
                    }
                    else
                        closingStack.pop();
                }
            }
        }
        else {
            const errMsg = `[ PARSER ERROR ] getControlPositioning(): failed to get control position; unrecognized control type: ${controlType}`;
            throw new Error(errMsg);
        }
        return { start: -1, next: nextControlIndex, end: endControlIndex };
    }
    tokenIsControlToken(tok) {
        const suffixIndex = tok.type.indexOf(_CONTROL_TOKEN_SUFFIX);
        return suffixIndex == 0 ? true : false;
    }
    controlForEvaluate(forToken) {
        const sub = forToken.value.substring(CONTROL_RULE.start.length, forToken.value.length - CONTROL_RULE.end.length);
        const controlTokens = sub.trim().split(' ').filter((s) => s.length);
        const symbol = controlTokens[CONTROL_FOR_SYMBOL_INDEX];
        const preposition = controlTokens[CONTROL_FOR_PREPOSITION_INDEX];
        const alias = controlTokens[CONTROL_FOR_ALIAS_INDEX];
        if (symbol === undefined)
            throw new Error('[ PARSER ERROR ] controlForEvaluate(): symbol name controling FOR control iterations not found');
        if (preposition === undefined)
            throw new Error('[ PARSER ERROR ] controlForEvaluate(): failed to find preposition in FOR control; "OF" missing from "#FOR x OF X"');
        if (alias === undefined)
            throw new Error('[ PARSER ERROR ] controlForEvaluate(): label for FOR control not found');
        const enumerable = this.symbolTable.resolveEnumerableSymbol(symbol, forToken.enumerationMap);
        return { enumerable, alias };
    }
    controlIfEvaluate(ifToken) {
        let ret = false;
        if (ifToken.name == _TOKEN_NAMES_MAP.ENDIF || ifToken.name == _TOKEN_NAMES_MAP.ELSE)
            ret = true;
        else {
            const sub = ifToken.value.substring(CONTROL_RULE.start.length, ifToken.value.length - CONTROL_RULE.end.length);
            const tokens = sub.trim().split(' ').filter((s) => s.length);
            tokens.shift(); // get rid of the actual control
            const expression = tokens.join(' ');
            const algebraSolver = new AlgebraSolver(this.symbolTable, ifToken.enumerationMap);
            const isValid = algebraSolver.validate(expression);
            if (isValid)
                ret = algebraSolver.evaluate(expression);
        }
        return ret;
    }
    validate() {
        return this.tokensProperlyEnclosed(this.input);
    }
    tokensProperlyEnclosed(tokens) {
        let ret = false;
        const closingStack = [];
        for (let t of tokens) {
            if (t.type == _TOKEN_TYPES_MAP.HTML && !TokenIdentifier.isSelfClosingTag(t)) {
                const isClosing = TokenIdentifier.isClosingTag(t);
                if (TokenIdentifier.tagMustBeClosed(t)) {
                    if (!isClosing) {
                        closingStack.push(t);
                    }
                    else {
                        const popped = closingStack.pop();
                        if (popped.name != t.name) {
                            const errMsg = `[ PARSER ERROR ] tokensProperlyEnclosed(): Unexpected HTML token name popped when validating input. Expected ${t.name} but popped ${popped.name} from stack`;
                            throw new Error(errMsg);
                        }
                    }
                }
            }
            else if (this.tokenIsControlToken(t)) {
                if (t.name == _TOKEN_NAMES_MAP.IF || t.name == _TOKEN_NAMES_MAP.FOR) {
                    closingStack.push(t);
                }
                else if (t.name == _TOKEN_NAMES_MAP.ENDIF || t.name == _TOKEN_NAMES_MAP.ENDFOR) {
                    if (closingStack.length == 0) {
                        const errMsg = `[ PARSER ERROR ] tokensProperlyEnclosed(): Encountered unexpected non-starting control token ${t.name}`;
                        throw new Error(errMsg);
                    }
                    const popped = closingStack.pop();
                    if (popped.type != t.type) {
                        const errMsg = `[ PARSER ERROR ] tokensProperlyEnclosed(): Unexpected token name popped when validating input ${t.type}... popped ${popped.type}`;
                        throw new Error(errMsg);
                    }
                }
            }
        }
        if (closingStack.length == 0)
            ret = true;
        return ret;
    }
}
