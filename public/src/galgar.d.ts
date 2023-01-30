import Grammar from './grammar';
export declare class Galgar {
    private _grammar;
    private _componentMap;
    private _referenceQueue;
    private _componentDirectory;
    constructor(grammar: Grammar, componentDirectory: string);
    parse(rawPath: string, stData: {
        [key: string]: any;
    }): Promise<string>;
    private resetResolvedComponents;
    private loadFileInput;
    private saveFileOutput;
    private lexTokens;
    private generateComponentMap;
    private getPathFromTokenReference;
    private makePathAbsolute;
    private parseTokens;
    private getProps;
}
