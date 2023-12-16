import Lexer from './lexer';
import TokenParser from './tokenParser';
import { _TOKEN_TYPES_MAP } from './const/tokenData';
import { FN_MAKE_PATH_ABSOLUTE, RENDERED_FILE_PATH, FILE_EXTENSION_HTML } from './const/const';
import { SymbolTable } from './symbolTable';
import * as _fs from 'fs';
import * as _path from 'path';
export class Galgar {
    _grammar;
    _componentMap;
    _referenceQueue;
    _componentDirectory;
    constructor(grammar, componentDirectory) {
        this._grammar = grammar;
        this._componentDirectory = componentDirectory;
        this._componentMap = {};
        this._referenceQueue = [];
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
        this.saveFileOutput(entryComponentIdentifier, output);
        // let output = '';
        return output;
    }
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
        _fs.writeFileSync(path, contents);
    }
    async generateComponentMap(entryPath) {
        this._referenceQueue.push(entryPath);
        const entryComponentPath = this.makePathAbsolute(entryPath);
        const entryIdentifier = entryComponentPath.split(_path.sep).pop()?.split('.')[0];
        let currentResourceLocation = '';
        while (this._referenceQueue.length > 0) {
            // init info
            const referencePath = this._referenceQueue.shift();
            const identifier = referencePath.split(_path.sep).pop()?.split('.')[0];
            if (this._componentMap[identifier] != undefined) { // reference already in use
                if (this._componentMap[identifier].path != referencePath)
                    throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier already in use at path ${this._componentMap[identifier].path}`);
                else
                    throw new Error(`[ GALGAR ERROR ] generateComponentMap(): identifier ${identifier} is already in use`);
            }
            const referencePathTokens = referencePath.split(_path.sep);
            referencePathTokens.pop(); // remove resource name.extension
            const fileContents = await this.loadFileInput(referencePath);
            currentResourceLocation = referencePathTokens.join(_path.sep);
            const compRef = { name: identifier, raw: fileContents, path: referencePath, tokens: [], props: [] };
            // a lexer is required to map tokens to each component reference
            const lexer = new Lexer(fileContents, this._grammar);
            // init lex
            let token = lexer.lex();
            // begin lex loop
            while (token.type != _TOKEN_TYPES_MAP.EOF) {
                compRef.tokens.push(token);
                if (token.type == _TOKEN_TYPES_MAP.PROPS)
                    compRef.props = lexer.generatePropsMap(token);
                if (token.type == _TOKEN_TYPES_MAP.COMPONENT) {
                    const path = this.getPathFromTokenReference(token.value);
                    const absolutePath = this.makePathAbsolute(path, currentResourceLocation); // force an absolutePath
                    this._referenceQueue.push(absolutePath);
                }
                token = lexer.lex(); // this is very important
            }
            this._componentMap[identifier] = compRef;
        }
        return entryIdentifier;
    }
    getPathFromTokenReference(tokenAsString) {
        // expected format: [[ #CONTROL PATH ]]
        return tokenAsString.split(' ')[2];
    }
    makePathAbsolute(path, relativeTo) {
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
}
