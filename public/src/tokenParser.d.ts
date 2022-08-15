import { iToken, iComponentMap } from "./interfaces/interfaces";
import { SymbolTable } from "./symbolTable";
export default class TokenParser {
    private input;
    private initProps;
    private symbolTable;
    private outputTokens;
    private componentAliasStack;
    constructor(tokens: Array<iToken>, st: SymbolTable, initProps: Array<string>, cas?: Array<iComponentMap>);
    getSymbolTable(): SymbolTable;
    getTokens(): Array<iToken>;
    parse(initProps?: Array<string>): Array<iToken>;
    getAliasComponentMap(index?: number): iComponentMap;
    initParse(tokens: Array<iToken>, propsArray: Array<string>): Array<iToken>;
    private buildPropsMap;
    private parseTokens;
    private tokenIsAValidComponentReference;
    private processPropsToken;
    private processComponentReference;
    private parseComponentControl;
    private setComponentAlias;
    private tokensToFrontOfQueue;
    private parseForControl;
    private parseIfControl;
    private processIfControl;
    private processForControl;
    private inflateForControl;
    getOutputAsText(): string;
    private getControlPositioning;
    private tokenIsControlToken;
    private controlForEvaluate;
    private controlIfEvaluate;
    validate(tokens: Array<iToken>): boolean;
    private tokensProperlyEnclosed;
}
