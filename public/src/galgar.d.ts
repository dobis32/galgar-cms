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
    private loadFileInput;
    private saveFileOutput;
    private generateComponentMap;
    private getPathFromTokenReference;
    makePathAbsolute(path: string, relativeTo?: string): string;
    private beginParseLoop;
}
