import { readFileSync } from 'fs';
import Lexer from './lexer';
import TokenParser from './tokenParser';
import { _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, _TYPE_EOF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN } from './const/tokenTypes';
import { FN_GET_PROPS_ARRAY, FN_CLONE_TOKEN, BLANK_TOKEN, INVALID_INPUT_TOKEN, RENDERED_FILE_PATH, COMPONENT_FILE_PATH, FILE_EXTENSION_GGD, FILE_EXTENSION_HTML } from './const/const';
import { SymbolTable } from './symbolTable';
import * as fs from 'fs';
export class Galgar {
    grammar;
    initComponentMap;
    referenceQueue;
    entryPath;
    constructor(grammar) {
        this.grammar = grammar;
        this.initComponentMap = {};
        this.referenceQueue = [];
        this.entryPath = '';
    }
    async parseProgram(rawPath, stData) {
        const symbolContextStack = [{ aliases: {}, props: stData }];
        const resourcePathTokens = rawPath.split('\\');
        const identifier = resourcePathTokens.pop();
        // const localPath: string = resourcePathTokens.filter((s: string) => s != '.').join('/');
        // const partialToken: iComponentReference = { name: identifier, raw: '', tokens: [], props:[] };  
        const baseFilePath = resourcePathTokens.join('\\') + '\\';
        this.entryPath = baseFilePath;
        this.referenceQueue.push(identifier);
        await this.lexComponentReferences();
        const entryComponent = this.initComponentMap[identifier];
        const entryComponentTokens = entryComponent.tokens;
        const entryComponentProps = entryComponent.props;
        const output = this.parseTokens(entryComponentTokens, symbolContextStack, entryComponentProps);
        this.resetResolvedComponents();
        this.saveFileOutput(identifier, output);
        return output;
    }
    resetResolvedComponents() {
        this.initComponentMap = {};
        this.referenceQueue = [];
    }
    async loadFileInput(identifier, partialPath) {
        let input = '';
        try {
            const extraPath = partialPath ? partialPath : '';
            const path = (COMPONENT_FILE_PATH + extraPath + identifier + FILE_EXTENSION_GGD);
            console.log('COMP FILE PATH: ' + COMPONENT_FILE_PATH);
            console.log('PARTIAL PATH: ' + partialPath);
            console.log('IDENTIFIER: ' + identifier);
            console.log('Reading file at path: ' + path);
            console.log('\n\n');
            const fileContents = readFileSync(path, { encoding: 'utf8', flag: 'rs' });
            input = `${fileContents}`;
        }
        catch (error) {
            console.log('[ GALGAR ]' + error);
            throw new Error('[ GALGAR ] something went waaaaayyyyy wrong');
        }
        return input;
    }
    async saveFileOutput(identifier, contents) {
        const path = RENDERED_FILE_PATH + identifier + FILE_EXTENSION_HTML;
        console.log('WRITING PARSED OUTPUT TO FILE: ' + path);
        fs.writeFile(path, contents, () => { });
    }
    async lexTokens(input) {
        const tokens = [];
        try {
            const lexer = new Lexer(input, this.grammar);
            let tempTok = BLANK_TOKEN;
            while (tempTok.type != _TYPE_EOF_TOKEN && tempTok.type != _TYPE_INVALID_INPUT) {
                tempTok = lexer.lex();
                if (tempTok === INVALID_INPUT_TOKEN)
                    break;
                else if (tempTok.type != _TYPE_WHITESPACE_TOKEN) {
                    if (tempTok.type == _TYPE_CONTROL_COMPONENT_TOKEN) {
                        const componentPath = tempTok.value.split(' ')[2]; // [[ #import identifier as x ]]
                        this.referenceQueue.push(componentPath);
                    }
                    const t = FN_CLONE_TOKEN(tempTok);
                    tokens.push(t);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            return tokens;
        }
    }
    async lexComponentReferences() {
        while (this.referenceQueue.length > 0) {
            const ref = this.referenceQueue.shift();
            const referencePathTokens = ref.split('\\').filter((s) => s != '.');
            const identifier = referencePathTokens.pop();
            const referencedPath = referencePathTokens.join('\\') + '\\';
            if (this.initComponentMap[identifier] == undefined) {
                const resourcePath = this.entryPath + referencedPath + identifier;
                const fileContents = await this.loadFileInput(resourcePath);
                const compRef = { name: identifier, raw: fileContents, tokens: [], props: [] };
                compRef.tokens = await this.lexTokens(compRef.raw);
                compRef.props = this.getProps(compRef.tokens);
                console.log('made a comp ref: ');
                console.log(compRef);
                console.log(identifier);
                this.initComponentMap[identifier] = compRef;
            }
        }
    }
    // private isComponentSlotted(tokens: Array<iToken>) {
    //     const slotTokenIndex: number = tokens.map((t: iToken) => t.type).indexOf(_TYPE_CONTROL_SLOT_TOKEN);
    //     let slotted: boolean = undefined;
    //     if (slotTokenIndex >= 0) slotted = true;
    //     else slotted = false;
    //     return slotted;
    // }
    parseTokens(input, stData, initProps) {
        let ret = '';
        const st = new SymbolTable(stData);
        const compMap = this.initComponentMap;
        const parser = new TokenParser(input, st, initProps, compMap);
        const isValid = parser.validate();
        if (!isValid)
            throw new Error('[GALGAR ERROR ] Input not valid. Parsing failed.');
        parser.parse();
        ret = parser.getOutputAsText();
        return ret;
    }
    getProps(tokens) {
        const propsTokenIndex = tokens.map((t) => t.type).indexOf(_TYPE_CONTROL_PROPS_TOKEN);
        if (propsTokenIndex < 0)
            throw new Error('[ GALGAR ERROR ] No props token exists in this component reference');
        const propsToken = tokens[propsTokenIndex];
        const props = FN_GET_PROPS_ARRAY(propsToken);
        return props;
    }
}