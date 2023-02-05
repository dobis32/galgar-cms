import { iToken, iLexPosition, iComponentMap, iComponentReference, iSymbolTable, iSymbolContext } from "./interfaces/interfaces";
import { CONTROL_FOR_ALIAS_INDEX, CONTROL_FOR_PREPOSITION_INDEX, CONTROL_FOR_SYMBOL_INDEX, CONTROL_RULE, FN_CLONE_TOKEN, FN_GET_PROPS_ARRAY } from './const/const';
import { _TOKEN_NAMES_MAP, _TOKEN_TYPES_MAP, _CONTROL_TOKEN_SUFFIX } from "./const/tokenData";
import { SymbolTable } from "./symbolTable";
import { AlgebraSolver } from "./booleanSolver";
import { ValueInjector } from "./injector";
import { TokenIdentifier } from "./tokenIdentifier";
import * as _path from "path";
export default class TokenParser {
    private input: Array<iToken>;
    private initProps: Array<string>;
    private symbolTable: SymbolTable;
    private outputTokens: Array<iToken>;
    private componentMap: iComponentMap;
    private componentAliasStack: Array<iComponentMap>;

    constructor (tokens: Array<iToken>, st: SymbolTable, initProps: Array<string>, initComponentMap: iComponentMap, cas?: Array<iComponentMap>) {
        this.input = tokens.map((t:iToken) => t);
        this.outputTokens = [ ];
        this.initProps = initProps;
        this.symbolTable = st;
        this.componentMap = initComponentMap;
        this.componentAliasStack = cas ? cas : [ ];
    }

    getSymbolTable(): SymbolTable {
        return this.symbolTable;
    }

    getTokens(): Array<iToken> {
        return this.input;
    }

    // getComponentMap(): iComponentMap {
    //     return this.componentMap;
    // }

    parse(): Array<iToken> {
        const props: Array<string> = this.initProps;
        const isValid: boolean = this.validate();
        if (isValid == false) throw new Error('[ PARSER ERROR ] parse(): Input not valid; be sure to run validate()');
        const outputTokens = this.initParse(this.input, props);
        this.outputTokens = outputTokens;
        return this.outputTokens;
    }

    private getAliasComponentMap(index?: number): iComponentMap {
        const stack: Array<iComponentMap> = this.componentAliasStack;
        let ret: iComponentMap;
        if (stack.length == 0) throw new Error('[ PARSER ERROR ] getAliasComponentMap(): No alias component map in the stack to get')
        if (index != undefined) ret = stack[index];
        else ret = stack[stack.length -1];
        return ret;
    }

    private initParse(tokens: Array<iToken>, propsArray: Array<string>): Array<iToken> {
        try {
            let clonedTokens: Array<iToken> = [ ];
            tokens.forEach((t: iToken) => {
                const clone: iToken = FN_CLONE_TOKEN(t);
                clonedTokens.push(clone);
            });
            this.componentAliasStack.push({ });
            const props: iSymbolTable = this.buildPropsMap(propsArray);
            const aliases: iSymbolTable = { };
            const context: iSymbolContext = { aliases, props };
            const output = this.parseTokens(clonedTokens, context);
            return output;
        } catch(error) {
            throw new Error('[ PARSER ERROR ] initParse(): ' + error);
        }
    }

    private buildPropsMap(props: Array<string>): iSymbolTable {
        const map: iSymbolTable = { };
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const value = this.symbolTable.resolveSymbol(prop);
            if (value == undefined) {
                const errMsg: string = `[ PARSER ERROR ] buildPropsMap(): Failed to build init prop map, missing value for prop ${ prop }`;
                throw new Error(errMsg);
            }
            else map[prop] = value;
        }
        return map;
    }

    private parseTokens(input: Array<iToken>, context: iSymbolContext): Array<iToken> {
        try {
            const output: Array<iToken> = [ ];
            this.symbolTable.pushContext(context);
            while (input.length > 0) {
                const tok: iToken = input.shift() as iToken;
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
                        const isValidRef: boolean = this.tokenIsAValidComponentReference(tok);
                        if (tok.type == _TOKEN_TYPES_MAP.COMPONENT && !isValidRef) {
                            const errMsg: string = '[ PARSER ERROR ] parseTokens(): Could not find component reference' + tok.name;
                            throw new Error(errMsg);
                        }
                        if (TokenIdentifier.isSelfClosingTag(tok) && isValidRef) {
                            input = this.processComponentReference(tok, input);
                        } else {
                            const processed: iToken = ValueInjector.injectTokenSymbols(tok, this.symbolTable);
                            output.push(processed);
                        }
                        break;
                }
            }
            this.symbolTable.popContext();
            return output;
        } catch(error) {
            throw new Error('[ PARSER ERROR ] parseTokens(): ' + error);
        }
    }

    private tokenIsAValidComponentReference(token: iToken): boolean {
        const keys: Array<string> = Object.keys(this.getAliasComponentMap());
        return keys.indexOf(token.name) > -1 ? true : false;
    }

    private processPropsToken(propsToken: iToken): void {
        const propsArray: Array<string> = FN_GET_PROPS_ARRAY(propsToken);
        const propsMap: iSymbolTable = this.buildPropsMap(propsArray);
        this.symbolTable.setContextProps(propsMap);
    }

    private processComponentReference(componentToken: iToken, tokens: Array<iToken>): Array<iToken> {
        try {
            const aliasMap: iComponentMap = this.getAliasComponentMap();
            const componentRef: iComponentReference = aliasMap[componentToken.name];
            const props: Array<string> = componentRef.props;
            const propMap: iSymbolTable = ValueInjector.getPropMapForComponentRef(componentToken, props, this.symbolTable);
            const compTokens: Array<iToken> = [];
            componentRef.tokens.forEach((t: iToken) => { // if you don't clone the input array, the comp reference tokens won't be parseable again
                const clone = FN_CLONE_TOKEN(t);
                compTokens.push(clone);
            });
            this.componentAliasStack.push({});
            const context: iSymbolContext = { aliases: {}, props: propMap };
            const processedComponentTokens: Array<iToken> = this.parseTokens(compTokens, context);
            this.componentAliasStack.pop();
            const result: Array<iToken> = this.tokensToFrontOfQueue(tokens, processedComponentTokens);
            return result;
        } catch(error) {
            throw new Error('[ PARSER ERROR ] processComponentReference(): ' + error);
        }
    }

    private parseComponentControl(controlToken: iToken): void {
        const compMap: iComponentMap = this.getAliasComponentMap();
        const temp: Array<string> = controlToken.value.split(' '); // [[ #IMPORT ComponentPath AS Alias ]]
        const path: string = temp[2].replaceAll('/', _path.sep).split(_path.sep).pop() as string;
        const identifier: string = path.replace('.ggd', '');
        const alias: string = temp[4] ? temp[4] : identifier;
        const component: iComponentReference = this.componentMap[identifier];
        if (component == undefined) throw new Error('[ PARSER ERROR ] parseComponentControl(): Failed to find component reference with identifier ' + identifier);
        this.setComponentAlias(component, alias);
    } 

    private setComponentAlias(component: iComponentReference, alias: string): void {
        const aliasMap = this.getAliasComponentMap();
        if (aliasMap[alias] == undefined) aliasMap[alias] = component;
        else throw new Error('[ PARSER ERROR ] setComponentAlias(): duplicate alias found ' + alias)
    }

    private tokensToFrontOfQueue(queue: Array<iToken>, tokensToAdd: Array<iToken>): Array<iToken> {
        const temp: Array<iToken> = [ ];
        while (tokensToAdd.length) temp.push(tokensToAdd.shift() as iToken);
        while (queue.length) temp.push(queue.shift() as iToken);
        return temp;
    }

    private parseForControl(controlToken: iToken, tokens: Array<iToken>): Array<iToken> {
        const result: Array<iToken> = this.processForControl(controlToken, tokens);
        const temp: Array<iToken> = this.tokensToFrontOfQueue(tokens, result);
        return temp;
    }

    private parseIfControl(controlToken: iToken, tokens:  Array<iToken>): Array<iToken> {
        const result: Array<iToken> = this.processIfControl(controlToken, tokens);
        const temp: Array<iToken> = this.tokensToFrontOfQueue(tokens, result);
        return temp;
    }

    private processIfControl(controlToken: iToken, tokens: Array<iToken>): Array<iToken> {
        let ret: Array<iToken> = [];
        const { next, end } = this.getControlPositioning(tokens, controlToken.type);
        if (this.controlIfEvaluate(controlToken)) {
            const keepUntil = next >= 0 ? next : end;
            let i: number = 0;
            while (i < keepUntil) { // keep tokens until next IF/ELSEIF/ELSE/ENDIF control
                ret.push(tokens.shift() as iToken);
                i++;
            }
            while (i <= end) { // get rid of everything from next IF index up to (and including) END control
                tokens.shift();
                i++;
            }
            while (tokens.length) ret.push(tokens.shift() as iToken);
        } else { // shift to next/end clause
            let i: number = 0;
            const stop: number = next >= 0 ? next : end;
            while (i < stop) {
                tokens.shift();
                i++;
            }
            while(tokens.length) {
                ret.push(tokens.shift() as iToken);
            }
        }
        return ret;
    }

    private processForControl(controlToken: iToken, tokens: Array<iToken>): Array<iToken> {
        let ret: Array<iToken> = [];
        if (controlToken.name === _TOKEN_NAMES_MAP.FOR) {
            const { end } = this.getControlPositioning(tokens, controlToken.type);
            const loopingTokens: Array<iToken> = [];
            let i: number = 0;
            while (i < end) {
                loopingTokens.push(tokens.shift() as iToken);
                i++;
            }
            tokens.shift(); // remove ENDIF token
            const { enumerable, alias } = this.controlForEvaluate(controlToken);
            ret = this.inflateForControl(loopingTokens, enumerable, alias);
        }
        return ret;
    }

    private inflateForControl(tokens: Array<iToken>, enumerableContext: Array<any>, contextualAlias: string): Array<iToken> {
        try {
            const ret: Array<iToken> = [];
            for (let j = 0; j < enumerableContext.length; j++) { // loop over contexts
                const tokensToParse: Array<iToken> = [];
                this.symbolTable.addContextualSymbol(enumerableContext, contextualAlias); // add context
                tokens.forEach((t: iToken) => { // loop over target tokens'
                    const clone = FN_CLONE_TOKEN(t);
                    if (clone.enumerationMap[contextualAlias] != undefined) {
                        const errMsg: string = `[ PARSER ERROR ] inflateForControl(): duplicate context found in the same source file. Offending context: ${ contextualAlias }`;
                        throw new Error(errMsg);
                    }
                    clone.enumerationMap[contextualAlias] = j;
                    tokensToParse.push(clone);
                });
                const context: iSymbolContext = this.symbolTable.getContext();
                const parsedTokens = this.parseTokens(tokensToParse, context);
                while(parsedTokens.length) ret.push(parsedTokens.shift() as iToken);
            }
            return ret;
        } catch(error) {
            throw new Error('[ PARSER ERROR ] inflateForControl(): ' + error);
        }
    }

    getOutputAsText(): string {
        let ret: string = '';
        const closingStack: Array<iToken> = [];
        for (let k: number = 0; k < this.outputTokens.length; k++) {
            const t: iToken = this.outputTokens[k];
            console.log(t);
            let tabs: string = '';
            if (t.type == _TOKEN_TYPES_MAP.WHITESPACE) continue;
            if (t.type == _TOKEN_TYPES_MAP.HTML && !TokenIdentifier.isSelfClosingTag(t)) { // is non-self-closing HTML tag
                if (TokenIdentifier.tagMustBeClosed(t)) { // is an HTML tag that must be closed
                    const isClosing = TokenIdentifier.isClosingTag(t);
                    if (!isClosing) { // is an open HTML tag
                        closingStack.push(t);
                    } else { // is a closing HTML tag
                        if (closingStack.length > 1) tabs += '\t';
                        closingStack.pop();
                    }
                } else if (closingStack.length > 0) tabs += '\t';
            }
            for (let i = 1; i < closingStack.length; i++) {
                tabs += '\t';
            }
            if (t.name === _TOKEN_NAMES_MAP.CONTENT) tabs += '\t';
            if (k > 0) ret += '\n';
            ret += tabs + t.value;
        }
        return ret;
    }

    private getControlPositioning(tokens: Array<iToken>, controlType: string): iLexPosition {
        let nextControlIndex: number = -1;
        let endControlIndex: number = -1;
        if (controlType == _TOKEN_TYPES_MAP.IF) {
            const closingStack: Array<iToken> = [];
            for (let i = 0; i < tokens.length; i++) {
                const tok: iToken = tokens[i];
                if (tok.name == _TOKEN_NAMES_MAP.IF) closingStack.push(tok);
                else if (nextControlIndex < 0 && closingStack.length == 0 && (tok.name == _TOKEN_NAMES_MAP.ELSEIF || tok.name == _TOKEN_NAMES_MAP.ELSE)) {
                    nextControlIndex = i;
                }
                else if (tok.name == _TOKEN_NAMES_MAP.ENDIF) {
                    if (closingStack.length == 0) {
                        endControlIndex = i; // this is the ENDIF control corresponding to the assumed IF control
                    }
                    else closingStack.pop();
                }
                if (endControlIndex > -1) break; // when we found the end of the assumed IF control
            }
        } else if (controlType == _TOKEN_TYPES_MAP.FOR) {
            const closingStack: Array<iToken> = [];
            for (let i = 0; i < tokens.length; i++) {
                const tok: iToken = tokens[i];
                if (tok.name == _TOKEN_NAMES_MAP.FOR) closingStack.push(tok);
                else if (tok.name == _TOKEN_NAMES_MAP.ENDFOR) {
                    if (closingStack.length == 0) {
                        endControlIndex = i;
                        break;
                    }
                    else closingStack.pop();
                }
            }
        } else {
            const errMsg = `[ PARSER ERROR ] getControlPositioning(): failed to get control position; unrecognized control type: ${ controlType }`;
            throw new Error(errMsg);
        }
        return { start: -1, next: nextControlIndex, end: endControlIndex };
    }

    public tokenIsControlToken(tok: iToken): boolean {
        const suffixIndex = tok.type.indexOf(_CONTROL_TOKEN_SUFFIX);
        return suffixIndex == 0 ? true : false;
    }

    private controlForEvaluate(forToken: iToken): { enumerable: Array<any>, alias: string } {
        const sub: string = forToken.value.substring(CONTROL_RULE.start.length, forToken.value.length - CONTROL_RULE.end.length);
        const controlTokens: Array<string> = sub.trim().split(' ').filter((s: string) => s.length);
        const symbol: string = controlTokens[CONTROL_FOR_SYMBOL_INDEX];
        const preposition: string = controlTokens[CONTROL_FOR_PREPOSITION_INDEX];
        const alias: string = controlTokens[CONTROL_FOR_ALIAS_INDEX];
        if (symbol === undefined) throw new Error('[ PARSER ERROR ] controlForEvaluate(): symbol name controling FOR control iterations not found');
        if (preposition === undefined) throw new Error('[ PARSER ERROR ] controlForEvaluate(): failed to find preposition in FOR control; "OF" missing from "#FOR x OF X"');
        if (alias === undefined) throw new Error('[ PARSER ERROR ] controlForEvaluate(): label for FOR control not found');
        const enumerable: Array<any> = this.symbolTable.resolveEnumerableSymbol(symbol, forToken.enumerationMap);
        return { enumerable, alias };
    }

    private controlIfEvaluate(ifToken: iToken): boolean {
        let ret: boolean = false;
        if (ifToken.name == _TOKEN_NAMES_MAP.ENDIF || ifToken.name == _TOKEN_NAMES_MAP.ELSE) ret = true;
        else {
            const sub: string = ifToken.value.substring(CONTROL_RULE.start.length, ifToken.value.length - CONTROL_RULE.end.length);
            const tokens: Array<string> = sub.trim().split(' ').filter((s: string) => s.length);
            tokens.shift(); // get rid of the actual control
            const expression = tokens.join(' ');
            const algebraSolver = new AlgebraSolver(this.symbolTable, ifToken.enumerationMap);
            const isValid: boolean = algebraSolver.validate(expression)
            if (isValid) ret = algebraSolver.evaluate(expression);
        }
        return ret;
    }

    validate(): boolean {
        return this.tokensProperlyEnclosed(this.input);
    }

    private tokensProperlyEnclosed(tokens: Array<iToken>): boolean {
        let ret: boolean = false;
        const closingStack: Array<iToken> = [];
        for (let t of tokens) {
            if (t.type == _TOKEN_TYPES_MAP.HTML && !TokenIdentifier.isSelfClosingTag(t)) {
                const isClosing = TokenIdentifier.isClosingTag(t);
                if (TokenIdentifier.tagMustBeClosed(t)) {
                    if (!isClosing) {
                        closingStack.push(t);
                    } else {
                        const popped: iToken = closingStack.pop() as iToken;
                        if (popped.name != t.name) {
                            const errMsg: string = `[ PARSER ERROR ] tokensProperlyEnclosed(): Unexpected HTML token name popped when validating input. Expected ${t.name} but popped ${popped.name} from stack`;
                            throw new Error(errMsg);
                        }
                    }
                }
            } else if (this.tokenIsControlToken(t)) {
                if (t.name == _TOKEN_NAMES_MAP.IF || t.name == _TOKEN_NAMES_MAP.FOR) {
                    closingStack.push(t);
                } else if (t.name == _TOKEN_NAMES_MAP.ENDIF || t.name == _TOKEN_NAMES_MAP.ENDFOR) {
                    if (closingStack.length == 0) {
                        const errMsg: string = `[ PARSER ERROR ] tokensProperlyEnclosed(): Encountered unexpected non-starting control token ${t.name}`;
                        throw new Error(errMsg);
                    }
                    const popped: iToken = closingStack.pop() as iToken;
                    if (popped.type != t.type) {
                        const errMsg: string = `[ PARSER ERROR ] tokensProperlyEnclosed(): Unexpected token name popped when validating input ${t.type}... popped ${popped.type}`;
                        throw new Error(errMsg);
                    }
                }
            }
        }
        if (closingStack.length == 0) ret = true;
        return ret;
    }
}