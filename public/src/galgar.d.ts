import Grammar from './grammar';
export declare class Galgar {
    private grammar;
    private initComponentMap;
    private referenceQueue;
    private entryPath;
    constructor(grammar: Grammar);
    parseProgram(rawPath: string, stData: any): Promise<string>;
    private resetResolvedComponents;
    private loadFileInput;
    private saveFileOutput;
    private lexTokens;
    private lexComponentReferences;
    private parseTokens;
    private getProps;
}
