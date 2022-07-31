import { AlgebraSolver } from '../src/bool';
import { iEnumerationMap, iSymbolContext } from '../src/interfaces/interfaces';
import { SymbolTable } from '../src/symbolTable';
import { ALGEBRAIC_OR, ALGEBRAIC_AND, ALGEBRAIC_NOT } from '../src/const/const';
describe("Bool.ts", () => {
    const ALIAS_1_1_VALUE: string = '';
    const ALIAS_1_1_NAME: string = 'alias1';
    const ALIAS_1_2_VALUE: number = 456;
    const ALIAS_1_2_NAME: string = 'alias2';
    const ALIAS_2_1_VALUE: string = 'asdf';
    const ALIAS_2_1_NAME: string = 'alias1';
    const ALIAS_2_2_VALUE: number = 123;
    const ALIAS_2_2_NAME: string = 'alias2';
    const PROPS_2_1_VALUE: boolean = false;
    const PROPS_2_1_NAME: string = 'props1';
    const ctx1Aliases: { [key: string]: any } = {};
    const ctx1Props: { [key: string]: any } = {};
    const ctx2Aliases: { [key: string]: any } = {};
    const ctx2Props: { [key: string]: any } = {};
    let initialSymbolContext1: iSymbolContext;
    let initialSymbolContext2: iSymbolContext;
    let initialSymbolTable: SymbolTable;
    let enumMap: iEnumerationMap;
    let solver: AlgebraSolver;
    let truthyExpression1: string = `${ALIAS_2_2_NAME}`;
    let truthyExpression2: string = `${ALIAS_2_2_NAME} ${ALGEBRAIC_OR} ${PROPS_2_1_NAME}`;
    let falsyExpression1: string = `${PROPS_2_1_NAME}`;
    let falsyExpression2: string = `${PROPS_2_1_NAME} ${ALGEBRAIC_AND} ${ALIAS_2_2_NAME}`;

    beforeEach(() => {
        ctx2Aliases[ALIAS_2_1_NAME] = ALIAS_2_1_VALUE;
        ctx2Aliases[ALIAS_2_2_NAME] = ALIAS_2_2_VALUE;
        ctx2Props[PROPS_2_1_NAME] = PROPS_2_1_VALUE;
        ctx1Aliases[ALIAS_1_1_NAME] = ALIAS_1_1_VALUE;
        ctx1Aliases[ALIAS_1_2_NAME] = ALIAS_1_2_VALUE;
        initialSymbolContext1 = { aliases: ctx1Aliases, props: ctx1Props };
        initialSymbolContext2 = { aliases: ctx2Aliases, props: ctx2Props };
        initialSymbolTable = new SymbolTable([ initialSymbolContext1, initialSymbolContext2 ]);
        solver = new AlgebraSolver(initialSymbolTable, enumMap);
    });

});