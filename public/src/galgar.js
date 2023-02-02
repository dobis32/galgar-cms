import Lexer from './lexer';
import TokenParser from './tokenParser';
import { _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, _TYPE_EOF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN, CONTROL_COMPONENT_TOKEN } from './const/tokenTypes';
import { FN_MAKE_PATH_ABSOLUTE, FN_GET_PROPS_ARRAY, FN_CLONE_TOKEN, BLANK_TOKEN, INVALID_INPUT_TOKEN, RENDERED_FILE_PATH, FILE_EXTENSION_HTML } from './const/const';
import { SymbolTable } from './symbolTable';
import * as _fs from 'fs';
import * as _path from 'path';
export class Galgar {
    _grammar;
    _componentMap;
    _referenceQueue;
    _componentDirectory;
    // private _entryPath: string; 
    constructor(grammar, componentDirectory) {
        this._grammar = grammar;
        this._componentDirectory = componentDirectory;
        this._componentMap = {};
        this._referenceQueue = [];
        // this._entryPath = '';
    }
    async parse(rawPath, stData) {
        // map components
        const entryComponentIdentifier = await this.generateComponentMap(rawPath);
        // BEGIN PARSE LOOP
        // Init some parsing stuff
        const symbolContextStack = [{ aliases: {}, props: stData }];
        // Get entry component from the component map
        const entryComponent = this._componentMap[entryComponentIdentifier];
        // Get the corresponding tokens
        const entryComponentTokens = entryComponent.tokens;
        // Get the corresponding props 
        const entryComponentProps = entryComponent.props;
        const output = this.beginParseLoop(entryComponentTokens, symbolContextStack, entryComponentProps);
        // this.saveFileOutput(entryComponentIdentifier, output);
        // let output = '';
        return output;
    }
    // private resetResolvedComponents(): void {
    //     this._componentMap = {};
    //     this._referenceQueue = [];
    // }
    async loadFileInput(absolutePath) {
        let input = '';
        try {
            const fileContents = _fs.readFileSync(absolutePath, { encoding: 'utf8', flag: 'rs' });
            input = `${fileContents}`;
            return input;
        }
        catch (error) {
            throw new Error('[ GALGAR ERROR ] loadFileInput(): ' + error);
        }
    }
    async saveFileOutput(identifier, contents) {
        const path = RENDERED_FILE_PATH + identifier + FILE_EXTENSION_HTML;
        console.log('[ GALGAR ] saveFileOutput(): WRITING PARSED OUTPUT TO FILE: ' + path);
        _fs.writeFile(path, contents, () => { });
    }
    async lexTokens(input) {
        const tokens = [];
        try {
            const lexer = new Lexer(input, this._grammar);
            let tempTok = BLANK_TOKEN;
            while (tempTok.type != _TYPE_EOF_TOKEN && tempTok.type != _TYPE_INVALID_INPUT) {
                tempTok = lexer.lex();
                if (tempTok === INVALID_INPUT_TOKEN)
                    break;
                else if (tempTok.type != _TYPE_WHITESPACE_TOKEN) {
                    if (tempTok.type == _TYPE_CONTROL_COMPONENT_TOKEN) {
                        const componentPath = tempTok.value.split(' ')[2]; // [[ #import identifier as x ]]
                        this._referenceQueue.push(componentPath);
                    }
                    const t = FN_CLONE_TOKEN(tempTok);
                    tokens.push(t);
                }
            }
        }
        catch (error) {
            throw new Error('[ GALGAR ERROR ] lexTokens(): ' + error);
        }
        finally {
            return tokens;
        }
    }
    async generateComponentMap(rawPath) {
        this._referenceQueue.push(rawPath);
        const entryComponentPath = this.makePathAbsolute(rawPath);
        const entryIdentifier = entryComponentPath.split(_path.sep).pop()?.split('.')[0];
        //const componentReferenceQueue: Array<string> = [ rawPath ];
        let currentResourceLocation = '';
        while (this._referenceQueue.length > 0) {
            // init info
            const rawReference = this._referenceQueue.shift();
            const absolutePath = this.makePathAbsolute(rawReference, currentResourceLocation); // force an absolutePath
            const identifier = absolutePath.split(_path.sep).pop()?.split('.')[0];
            if (this._componentMap[identifier] != undefined && this._componentMap[identifier].path != absolutePath)
                throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier ${identifier} is already in use`);
            const absolutePathTokens = absolutePath.split(_path.sep);
            absolutePathTokens.pop(); // remove resource name.extension
            const fileContents = await this.loadFileInput(absolutePath);
            currentResourceLocation = absolutePathTokens.join(_path.sep);
            const compRef = { name: identifier, raw: fileContents, path: absolutePath, tokens: [], props: [] };
            // a lexer is required to map tokens to each component reference
            const lexer = new Lexer(fileContents, this._grammar);
            // init lex
            let token = lexer.lex();
            // begin lex loop
            while (token.type != _TYPE_EOF_TOKEN) {
                compRef.tokens.push(token);
                if (token.type == _TYPE_CONTROL_PROPS_TOKEN)
                    compRef.props = lexer.generatePropsMap(token);
                if (token.name == CONTROL_COMPONENT_TOKEN) {
                    const path = this.getPathFromTokenReference(token.value);
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
    getPathFromTokenReference(tokenAsString) {
        // expected format: [[ #CONTROL PATH ]]
        return tokenAsString.split(' ')[2];
    }
    makePathAbsolute(path, relativeTo) {
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
    beginParseLoop(input, stData, initProps) {
        // setup
        const st = new SymbolTable(stData);
        const compMap = this._componentMap;
        const parser = new TokenParser(input, st, initProps, compMap);
        // make sure tokens validate
        if (!parser.validate())
            throw new Error('[ GALGAR ERROR ] beginParseLoop(): Input not valid. Parsing failed.');
        // actually begin the parse loop
        parser.parse();
        return parser.getOutputAsText();
        ;
    }
    getProps(tokens) {
        const propsTokenIndex = tokens.map((t) => t.type).indexOf(_TYPE_CONTROL_PROPS_TOKEN);
        if (propsTokenIndex < 0)
            throw new Error('[ GALGAR ERROR ] getProps(): No props token exists in this component reference');
        const propsToken = tokens[propsTokenIndex];
        const props = FN_GET_PROPS_ARRAY(propsToken);
        return props;
    }
}
