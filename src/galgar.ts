import Lexer from './lexer';
import Grammar from './grammar';
import TokenParser from './tokenParser';
import { iComponentReference, iComponentMap, iSymbolTable, iToken, iSymbolContext } from './interfaces/interfaces';
import { _TOKEN_TYPES_MAP, _TOKEN_NAMES_MAP } from './const/tokenData';
import { FN_MAKE_PATH_ABSOLUTE, FN_GET_PROPS_ARRAY, FN_CLONE_TOKEN, BLANK_TOKEN, INVALID_INPUT_TOKEN, RENDERED_FILE_PATH, COMPONENT_FILE_PATH, FILE_EXTENSION_GGD, FILE_EXTENSION_HTML, EOF_TOKEN } from './const/const';
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
        const symbolContextStack: Array<iSymbolContext> = [ { aliases: {}, props: stData } ];
        // Get entry component from the component map
        const entryComponent: iComponentReference = this._componentMap[entryComponentIdentifier];
        // Get the corresponding tokens
        const entryComponentTokens: Array<iToken> = entryComponent.tokens;
        // Get the corresponding props 
        const entryComponentProps: Array<string> = entryComponent.props;
        const output: string = this.beginParseLoop(entryComponentTokens, symbolContextStack, entryComponentProps);
        console.log(entryComponentIdentifier);
        this.saveFileOutput(entryComponentIdentifier, output);
        // let output = '';
        return output;
    }

    // private resetResolvedComponents(): void {
    //     this._componentMap = {};
    //     this._referenceQueue = [];
    // }

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
        _fs.writeFileSync(path, contents);
    }

    private async lexTokens(input: string): Promise<Array<iToken>> {
        const tokens: Array<iToken> = [];
        try {
            const lexer: Lexer = new Lexer(input, this._grammar);
            let tempTok: iToken = BLANK_TOKEN;
            while (tempTok.type != _TOKEN_TYPES_MAP.EOF && tempTok.type != _TOKEN_TYPES_MAP.INVALID) {
                tempTok = lexer.lex();
                if (tempTok === INVALID_INPUT_TOKEN) break;
                else if(tempTok.type != _TOKEN_TYPES_MAP.WHITESPACE) {
                    if (tempTok.type == _TOKEN_TYPES_MAP.COMPONENT) {
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
        const entryComponentPath: string = this.makePathAbsolute(rawPath);
        const entryIdentifier: string = entryComponentPath.split(_path.sep).pop()?.split('.')[0] as string;
        //const componentReferenceQueue: Array<string> = [ rawPath ];
        let currentResourceLocation: string = '';
        while (this._referenceQueue.length > 0) {
            // init info
            const rawReference: string = this._referenceQueue.shift() as string;
            const absolutePath: string = this.makePathAbsolute(rawReference, currentResourceLocation); // force an absolutePath
            const identifier: string = absolutePath.split(_path.sep).pop()?.split('.')[0] as string;
            if (this._componentMap[identifier] != undefined && this._componentMap[identifier].path != absolutePath) throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier ${identifier} is already in use`);
            const absolutePathTokens: Array<string> = absolutePath.split(_path.sep);
            absolutePathTokens.pop(); // remove resource name.extension
            const fileContents: string = await this.loadFileInput(absolutePath);
            currentResourceLocation = absolutePathTokens.join(_path.sep);
            const compRef: iComponentReference = { name: identifier, raw: fileContents, path: absolutePath, tokens: [], props: [] };

            // a lexer is required to map tokens to each component reference
            const lexer: Lexer = new Lexer(fileContents, this._grammar);

            // init lex
            let token: iToken = lexer.lex();
            // begin lex loop
            while (token.type != _TOKEN_TYPES_MAP.EOF) {
                compRef.tokens.push(token);
                if (token.type == _TOKEN_TYPES_MAP.PROPS) compRef.props = lexer.generatePropsMap(token);
                if (token.name == _TOKEN_TYPES_MAP.COMPONENT) {
                    const path: string = this.getPathFromTokenReference(token.value);
                    this._referenceQueue.push(path);
                }
                token = lexer.lex(); // this is very important
            }
            this._componentMap[identifier] = compRef;
        }
        return entryIdentifier;

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

    makePathAbsolute(path: string, relativeTo?: string): string {
        // if (relativeTo == undefined) relativeTo = '';
        // const absoluteTokens: Array<string> = [];
        // const pathTokens: Array<string> = path.replaceAll('/', _path.sep).split(_path.sep).map((s:string) => s.trim());
        // let targetResourceToken: string = pathTokens[pathTokens.length - 1];
        // const expectedExtensionIndex: number = targetResourceToken.length - FILE_EXTENSION_GGD.length - 1;
        // if (targetResourceToken.indexOf(FILE_EXTENSION_GGD) != expectedExtensionIndex) targetResourceToken += '.ggd';
        // for (let i = 0; i < pathTokens.length; i++) {
        //     const tok: string = pathTokens[i];
        //     if (tok == '@' && i > 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): found invalid directory base reference ("@")');
        //     else if (tok == '..' && absoluteTokens.length == 0) throw new Error('[ GALGAR ERROR ] makePathAbsolute(): invalid parent directory; check your path references and try again');
        //     else if (tok == '@') this._componentDirectory.split(_path.sep).forEach((t: string) => {
        //         absoluteTokens.push(t);
        //     });
        //     else if (tok == '.' && i == 0) relativeTo.split(_path.sep).forEach((t:string) => absoluteTokens.push(t));
        //     else if (tok == '..') absoluteTokens.shift();
        //     else if (tok != '.') absoluteTokens.push(tok);
        // }
        // return absoluteTokens.join(_path.sep);
        return FN_MAKE_PATH_ABSOLUTE(this._componentDirectory, path, relativeTo);
    }

    private beginParseLoop(input: Array<iToken>, stData: Array<iSymbolContext>, initProps: Array<string>): string {
        // setup
        const st: SymbolTable = new SymbolTable(stData);
        const compMap: iComponentMap = this._componentMap;
        const parser: TokenParser = new TokenParser(input, st, initProps, compMap);

        // make sure tokens validate
        if (!parser.validate()) throw new Error('[ GALGAR ERROR ] beginParseLoop(): Input not valid. Parsing failed.');

        // actually begin the parse loop
        parser.parse(); 
        return parser.getOutputAsText();;
    }

    private getProps(tokens: Array<iToken>): Array<string> {
        const propsTokenIndex: number = tokens.map((t: iToken) => t.type).indexOf(_TOKEN_TYPES_MAP.PROPS);
        if (propsTokenIndex < 0) throw new Error('[ GALGAR ERROR ] getProps(): No props token exists in this component reference');
        const propsToken: iToken = tokens[propsTokenIndex];
        const props: Array<string> = FN_GET_PROPS_ARRAY(propsToken);
        return props;
    }
}