// import { readFileSync } from 'fs';
import { StringDecoder } from 'string_decoder';
import Lexer from './lexer';
import Grammar from './grammar';
import TokenParser from './tokenParser';
import { iComponentReference, iComponentMap, iSymbolTable, iToken, iSymbolContext } from './interfaces/interfaces';
import { _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, _TYPE_EOF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN, CONTROL_COMPONENT_TOKEN } from './const/tokenTypes';
import { FN_GET_PROPS_ARRAY, FN_CLONE_TOKEN, BLANK_TOKEN, INVALID_INPUT_TOKEN, RENDERED_FILE_PATH, COMPONENT_FILE_PATH, FILE_EXTENSION_GGD, FILE_EXTENSION_HTML, EOF_TOKEN } from './const/const';
import { SymbolTable } from './symbolTable';
import * as _fs from 'fs';
import * as _path from 'path';
import { relative } from 'path';
export class Galgar {
    private _grammar: Grammar;
    private _componentMap: iComponentMap;
    private _referenceQueue: Array<string>;
    private _componentDirectory: string;
    // private _entryPath: string; 

    constructor(grammar: Grammar, componentDirectory: string) {
        this._grammar = grammar;
        this._componentDirectory = componentDirectory;
        this._componentMap = {};
        this._referenceQueue = [];
        // this._entryPath = '';
    }

    async parse(rawPath: string, stData: { [key:string] : any } ): Promise<string> {
        // map components
        const entryComponentIdentifier: string = await this.generateComponentMap(rawPath);

        // BEGIN PARSE LOOP

        // Init some parsing stuff
        // const symbolContextStack: Array<iSymbolContext> = [ { aliases: {}, props: stData } ];

        // const entryComponent: iComponentReference = this._componentMap[entryComponentIdentifier];
        // const entryComponentTokens: Array<iToken> = entryComponent.tokens;
        // const entryComponentProps: Array<string> = entryComponent.props;
        // const output: string = this.parseTokens(entryComponentTokens, symbolContextStack, entryComponentProps);
        // this.resetResolvedComponents();
        // this.saveFileOutput(entryComponentIdentifier, output);
        // return output;
        return '';
    }

    private resetResolvedComponents(): void {
        this._componentMap = {};
        this._referenceQueue = [];
    }

    private async loadFileInput(absolutePath: string): Promise<string> {
        let input: string = '';
        try {
            const fileContents: string = _fs.readFileSync(absolutePath, {encoding:'utf8', flag:'rs'});
            input = `${ fileContents }`;
            return input;
        } catch(error) {
            throw new Error('[ GALGAR ERROR ] loadFileInput(): ' + error);
        }
    }

    private async saveFileOutput(identifier: string, contents: string): Promise<any> {
        const path: string = RENDERED_FILE_PATH + identifier + FILE_EXTENSION_HTML;
        console.log('[ GALGAR ] saveFileOutput(): WRITING PARSED OUTPUT TO FILE: ' + path);
        _fs.writeFile(path, contents, () => {});
    }

    private async lexTokens(input: string): Promise<Array<iToken>> {
        const tokens: Array<iToken> = [];
        try {
            const lexer: Lexer = new Lexer(input, this._grammar);
            let tempTok: iToken = BLANK_TOKEN;
            while (tempTok.type != _TYPE_EOF_TOKEN && tempTok.type != _TYPE_INVALID_INPUT) {
                tempTok = lexer.lex();
                if (tempTok === INVALID_INPUT_TOKEN) break;
                else if(tempTok.type != _TYPE_WHITESPACE_TOKEN) {
                    if (tempTok.type == _TYPE_CONTROL_COMPONENT_TOKEN) {
                        const componentPath: string = tempTok.value.split(' ')[2]; // [[ #import identifier as x ]]
                        this._referenceQueue.push(componentPath);
                    }
                    const t: iToken = FN_CLONE_TOKEN(tempTok);
                    tokens.push(t);
                }
            }
        } catch(error) {
            throw new Error('[ GALGAR ERROR ] lexTokens(): ' + error);
        } finally {
            return tokens;
        }
    }

    private async generateComponentMap(rawPath:string): Promise<string> {
        this._referenceQueue.push(rawPath)
        //const componentReferenceQueue: Array<string> = [ rawPath ];
        let currentResourceLocation: string = '';
        while (this._referenceQueue.length > 0) {
            // init info
            const rawReference: string = this._referenceQueue.shift() as string;
            const absolutePath: string = this.makePathAbsolute(rawReference); // force an absolutePath
            console.log(absolutePath);
            const pathRelativeToBase: string = absolutePath.replace(this._componentDirectory, '@');
            const identifier: string = absolutePath.split(_path.sep).pop()?.split('.')[0] as string;
            const fileContents: string = await this.loadFileInput(absolutePath);
            const compRef: iComponentReference = { name: identifier, raw: fileContents, tokens: [], props: [] };

            // a lexer is required to map tokens to each component reference
            const lexer: Lexer = new Lexer(fileContents, this._grammar);

            // init lex
            let token: iToken = lexer.lex();
            // begin lex loop
            while (token.type != _TYPE_EOF_TOKEN) {
                compRef.tokens.push(token);
                if (token.type == _TYPE_CONTROL_PROPS_TOKEN) compRef.props = lexer.generatePropsMap(token);
                if (token.name == CONTROL_COMPONENT_TOKEN) {
                    const path: string = this.getPathFromTokenReference(token.value);
                    this._referenceQueue.push(path);
                }
                token = lexer.lex(); // this is very important
            }
            currentResourceLocation = absolutePath; // update current resource location -- this is very important

        }
        const entryComponentIdentifier: string = rawPath.split(_path.sep).pop() as string;
        return entryComponentIdentifier;






        // this._referenceQueue.push(entryComponentIdentifier);
        // while (this._referenceQueue.length > 0) {
        //     const reference: string = this._referenceQueue.shift() as string;
        //     const referencePathTokens: Array<string> = reference.split('\\').filter((s: string) => s != '.');
        //     const identifier: string =  referencePathTokens.pop() as string;
        //     const referencedPath: string = referencePathTokens.join('\\') + '\\';
        //     if (this._componentMap[identifier] == undefined) {
        //         const resourcePath: string = this. _componentDirectory + referencedPath + identifier;
        //         const fileContents: string = await this.loadFileInput(resourcePath);
        //         const compRef: iComponentReference = { name: identifier, raw: fileContents, tokens: [], props: [] };
        //         compRef.tokens = await this.lexTokens(compRef.raw);
        //         compRef.props = this.getProps(compRef.tokens);
        //         console.log('[ GALGAR ] lexComponentReferences(): made a comp ref, comp name: ' + compRef.name + ' || identifier: ' + identifier);
        //         this._componentMap[identifier] = compRef;
        //     }
        // }
        // const entryComponentIdentifier: string = rawPath.split(_path.sep).pop() as string;
        // return entryComponentIdentifier;
    }

    private getPathFromTokenReference(tokenAsString: string): string {
        // expected format: [[ #CONTROL PATH ]]
        return tokenAsString.split(' ')[2];
    }

    private makePathAbsolute(path: string, relativeTo: string = ''): string {
        const absoluteTokens: Array<string> = [];
        const pathTokens: Array<string> = path.replaceAll('/', _path.sep).split(_path.sep).map((s:string) => s.trim());
        if (pathTokens)
        for (let i = 0; i < pathTokens.length; i++) {
            const tok: string = pathTokens[i];
            if (tok == '@' && i > 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): found invalid directory base reference ("@")');
            else if (tok == '..' && absoluteTokens.length == 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): invalid parent directory; check your path references and try again');
            else if (tok == '@') this._componentDirectory.split(_path.sep).forEach((t: string) => {
                absoluteTokens.push(t);
            });
            else if (tok == '.' && i == 0) relativeTo.split(_path.sep).forEach((t:string) => absoluteTokens.push(t));
            else if (tok == '..') absoluteTokens.shift();
            else if (tok != '.') absoluteTokens.push(tok);
        }
        return absoluteTokens.join(_path.sep);
    }

    private parseTokens(input: Array<iToken>, stData: Array<iSymbolContext>, initProps: Array<string>): string {
        let ret: string = '';
        const st: SymbolTable = new SymbolTable(stData);
        const compMap: iComponentMap = this._componentMap;
        const parser: TokenParser = new TokenParser(input, st, initProps, compMap);
        const isValid: boolean = parser.validate();
        if (!isValid) throw new Error('[ GALGAR ERROR ] parseTokens(): Input not valid. Parsing failed.');
        parser.parse();
        ret = parser.getOutputAsText();
        return ret;
    }

    private getProps(tokens: Array<iToken>): Array<string> {
        const propsTokenIndex: number = tokens.map((t: iToken) => t.type).indexOf(_TYPE_CONTROL_PROPS_TOKEN);
        if (propsTokenIndex < 0) throw new Error('[ GALGAR ERROR ] getProps(): No props token exists in this component reference');
        const propsToken: iToken = tokens[propsTokenIndex];
        const props: Array<string> = FN_GET_PROPS_ARRAY(propsToken);
        return props;
    }
}