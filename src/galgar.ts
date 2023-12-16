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

    constructor(grammar: Grammar, componentDirectory: string) {
        this._grammar = grammar;
        this._componentDirectory = componentDirectory;
        this._componentMap = {};
        this._referenceQueue = [];
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
        this.saveFileOutput(entryComponentIdentifier, output);
        // let output = '';
        return output;
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
        _fs.writeFileSync(path, contents);
    }

    private async generateComponentMap(entryPath:string): Promise<string> {
        this._referenceQueue.push(entryPath)
        const entryComponentPath: string = this.makePathAbsolute(entryPath);
        const entryIdentifier: string = entryComponentPath.split(_path.sep).pop()?.split('.')[0] as string;
        let currentResourceLocation: string = '';
        while (this._referenceQueue.length > 0) {
            // init info
            const referencePath: string = this._referenceQueue.shift() as string;
            const identifier: string = referencePath.split(_path.sep).pop()?.split('.')[0] as string;
            if (this._componentMap[identifier] != undefined) { // reference already in use
                if (this._componentMap[identifier].path != referencePath) throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier already in use at path ${this._componentMap[identifier].path}`)
                else throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier ${identifier} is already in use`);
            }
            const referencePathTokens: Array<string> = referencePath.split(_path.sep);
            referencePathTokens.pop(); // remove resource name.extension
            const fileContents: string = await this.loadFileInput(referencePath);
            currentResourceLocation = referencePathTokens.join(_path.sep);
            const compRef: iComponentReference = { name: identifier, raw: fileContents, path: referencePath, tokens: [], props: [] };

            // a lexer is required to map tokens to each component reference
            const lexer: Lexer = new Lexer(fileContents, this._grammar);

            // init lex
            let token: iToken = lexer.lex();
            // begin lex loop
            while (token.type != _TOKEN_TYPES_MAP.EOF) {
                compRef.tokens.push(token);
                if (token.type == _TOKEN_TYPES_MAP.PROPS) compRef.props = lexer.generatePropsMap(token);
                if (token.type == _TOKEN_TYPES_MAP.COMPONENT) {
                    const path: string = this.getPathFromTokenReference(token.value);
                    const absolutePath: string = this.makePathAbsolute(path, currentResourceLocation); // force an absolutePath
                    this._referenceQueue.push(absolutePath);
                }
                token = lexer.lex(); // this is very important
            }
            this._componentMap[identifier] = compRef;
        }
        return entryIdentifier;
    }

    private getPathFromTokenReference(tokenAsString: string): string {
        // expected format: [[ #CONTROL PATH ]]
        return tokenAsString.split(' ')[2];
    }

    makePathAbsolute(path: string, relativeTo?: string): string {
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
}