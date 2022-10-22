import { readFileSync } from 'fs';
import { StringDecoder } from 'string_decoder';
import Lexer from './lexer';
import Grammar from './grammar';
import TokenParser from './tokenParser';
import { iComponentReference, iComponentMap, iSymbolTable, iToken, iSymbolContext } from './interfaces/interfaces';
import { _TYPE_CONTROL_COMPONENT_TOKEN, _TYPE_CONTROL_PROPS_TOKEN, _TYPE_EOF_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN } from './const/tokenTypes';
import { FN_GET_PROPS_ARRAY, FN_CLONE_TOKEN, BLANK_TOKEN, INVALID_INPUT_TOKEN, RENDERED_FILE_PATH, COMPONENT_FILE_PATH, FILE_EXTENSION_GGD, FILE_EXTENSION_HTML } from './const/const';
import { SymbolTable } from './symbolTable';
import * as fs from 'fs';

export class Galgar {
    private grammar: Grammar;
    private initComponentMap: iComponentMap;
    private referenceQueue: Array<string>;
    private entryPath: string;

    constructor(grammar: Grammar) {
        this.grammar = grammar;
        this.initComponentMap = {};
        this.referenceQueue = [];
        this.entryPath = '';
    }

    async parseProgram(rawPath: string, stData: any): Promise<string> {
        const symbolContextStack: Array<iSymbolContext> = [ { aliases: {}, props: stData } ];
        const resourcePathTokens: Array<string> = rawPath.split('\\');
        const identifier: string = resourcePathTokens.pop() as string;
        // const localPath: string = resourcePathTokens.filter((s: string) => s != '.').join('/');
        // const partialToken: iComponentReference = { name: identifier, raw: '', tokens: [], props:[] };  
        const baseFilePath: string = resourcePathTokens.join('\\') + '\\';    
        this.entryPath = baseFilePath;
        this.referenceQueue.push(identifier);
        await this.lexComponentReferences();
        const entryComponent: iComponentReference = this.initComponentMap[identifier];
        const entryComponentTokens: Array<iToken> = entryComponent.tokens;
        const entryComponentProps: Array<string> = entryComponent.props;
        const output: string = this.parseTokens(entryComponentTokens, symbolContextStack, entryComponentProps);
        this.resetResolvedComponents();
        this.saveFileOutput(identifier, output);
        return output;
    }

    private resetResolvedComponents(): void {
        this.initComponentMap = {};
        this.referenceQueue = [];
    }

    private async loadFileInput(identifier: string, partialPath?: string): Promise<string> {
        let input: string = '';
        try {
            const extraPath: string = partialPath ? partialPath : '';
            const path: string = (COMPONENT_FILE_PATH + extraPath + identifier + FILE_EXTENSION_GGD);
            console.log('COMP FILE PATH: ' + COMPONENT_FILE_PATH);
            console.log('PARTIAL PATH: ' + partialPath);
            console.log('IDENTIFIER: ' + identifier);
            console.log('Reading file at path: ' + path);
            console.log('\n\n');
            const fileContents: string = readFileSync(path, {encoding:'utf8', flag:'rs'})
            input = `${ fileContents }`;
        } catch(error) {
            console.log('[ GALGAR ]' + error);
            throw new Error('[ GALGAR ] something went waaaaayyyyy wrong')
        }
        return input;
    }

    private async saveFileOutput(identifier: string, contents: string): Promise<any> {
        const path: string = RENDERED_FILE_PATH + identifier + FILE_EXTENSION_HTML;
        console.log('WRITING PARSED OUTPUT TO FILE: ' + path);
        fs.writeFile(path, contents, () => {});
    }

    private async lexTokens(input: string): Promise<Array<iToken>> {
        const tokens: Array<iToken> = [];
        try {
            const lexer: Lexer = new Lexer(input, this.grammar);
            let tempTok: iToken = BLANK_TOKEN;
            while (tempTok.type != _TYPE_EOF_TOKEN && tempTok.type != _TYPE_INVALID_INPUT) {
                tempTok = lexer.lex();
                if (tempTok === INVALID_INPUT_TOKEN) break;
                else if(tempTok.type != _TYPE_WHITESPACE_TOKEN) {
                    if (tempTok.type == _TYPE_CONTROL_COMPONENT_TOKEN) {
                        const componentPath: string = tempTok.value.split(' ')[2]; // [[ #import identifier as x ]]
                        this.referenceQueue.push(componentPath);
                    }
                    const t: iToken = FN_CLONE_TOKEN(tempTok);
                    tokens.push(t);
                }
            }
        } catch(error) {
            console.log(error);
        } finally {
            return tokens;
        }
    }

    private async lexComponentReferences() {
        while (this.referenceQueue.length > 0) {
            const ref: string = this.referenceQueue.shift() as string;
            const referencePathTokens: Array<string> = ref.split('\\').filter((s: string) => s != '.');
            const identifier: string =  referencePathTokens.pop() as string;
            const referencedPath: string = referencePathTokens.join('\\') + '\\';
            if (this.initComponentMap[identifier] == undefined) {
                const resourcePath: string = this.entryPath + referencedPath + identifier;
                const fileContents: string = await this.loadFileInput(resourcePath);
                const compRef: iComponentReference = { name: identifier, raw: fileContents, tokens: [], props: [] };
                compRef.tokens = await this.lexTokens(compRef.raw);
                compRef.props = this.getProps(compRef.tokens);
                console.log('made a comp ref: ');
                console.log(compRef);
                console.log(identifier)
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

    private parseTokens(input: Array<iToken>, stData: Array<iSymbolContext>, initProps: Array<string>): string {
        let ret: string = '';
        const st: SymbolTable = new SymbolTable(stData);
        const compMap: iComponentMap = this.initComponentMap;
        const parser: TokenParser = new TokenParser(input, st, initProps, compMap);
        const isValid: boolean = parser.validate();
        if (!isValid) throw new Error('[GALGAR ERROR ] Input not valid. Parsing failed.');
        parser.parse();
        ret = parser.getOutputAsText();
        return ret;
    }

    private getProps(tokens: Array<iToken>): Array<string> {
        const propsTokenIndex: number = tokens.map((t: iToken) => t.type).indexOf(_TYPE_CONTROL_PROPS_TOKEN);
        if (propsTokenIndex < 0) throw new Error('[ GALGAR ERROR ] No props token exists in this component reference');
        const propsToken: iToken = tokens[propsTokenIndex];
        const props: Array<string> = FN_GET_PROPS_ARRAY(propsToken);
        return props;
    }
}