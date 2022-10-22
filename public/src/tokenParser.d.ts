import { iToken, iComponentMap } from "./interfaces/interfaces";
import { SymbolTable } from "./symbolTable";
export default class TokenParser {
    private input;
    private initProps;
    private symbolTable;
    private outputTokens;
    private componentMap;
    private componentAliasStack;
    constructor(tokens: Array<iToken>, st: SymbolTable, initProps: Array<string>, initComponentMap: iComponentMap, cas?: Array<iComponentMap>);
    getSymbolTable(): SymbolTable;
    parse(): Array<iToken>;
    private getAliasComponentMap;
    private initParse;
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
    validate(): boolean;
    private tokensProperlyEnclosed;
}
