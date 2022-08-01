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
    const PROPS_2_1_VALUE: boolean = true;
    const PROPS_2_1_NAME: string = 'props1';
    const PROPS_2_2_VALUE: boolean = false;
    const PROPS_2_2_NAME: string = 'props2';
    const ctx1Aliases: { [key: string]: any } = {};
    const ctx1Props: { [key: string]: any } = {};
    const ctx2Aliases: { [key: string]: any } = {};
    const ctx2Props: { [key: string]: any } = {};
    let initialSymbolContext1: iSymbolContext;
    let initialSymbolContext2: iSymbolContext;
    let initialSymbolTable: SymbolTable;
    let enumMap: iEnumerationMap;
    let solver: AlgebraSolver;
    let simpleTruthyExpression: string = `${PROPS_2_1_NAME}`;
    let compoundTruthyExpression: string = `${PROPS_2_1_NAME} ${ALGEBRAIC_OR} ${PROPS_2_2_NAME}`;
    let simpleFalsyExpression: string = `${PROPS_2_2_NAME}`;
    let compoundFalsyExpression: string = `${PROPS_2_1_NAME} ${ALGEBRAIC_AND} ${PROPS_2_2_NAME}`;

    beforeEach(() => {
        ctx2Aliases[ALIAS_2_1_NAME] = ALIAS_2_1_VALUE;
        ctx2Aliases[ALIAS_2_2_NAME] = ALIAS_2_2_VALUE;
        ctx2Props[PROPS_2_1_NAME] = PROPS_2_1_VALUE;
        ctx2Props[PROPS_2_2_NAME] = PROPS_2_2_VALUE;
        ctx1Aliases[ALIAS_1_1_NAME] = ALIAS_1_1_VALUE;
        ctx1Aliases[ALIAS_1_2_NAME] = ALIAS_1_2_VALUE;
        enumMap = {};
        initialSymbolContext1 = { aliases: ctx1Aliases, props: ctx1Props };
        initialSymbolContext2 = { aliases: ctx2Aliases, props: ctx2Props };
        initialSymbolTable = new SymbolTable([ initialSymbolContext1, initialSymbolContext2 ]);
        solver = new AlgebraSolver(initialSymbolTable, enumMap);
    });

    it('should have a function to solve a simple expression', () => {
        const result1: boolean = solver.solveSimpleExpression(simpleTruthyExpression);
        const result2: boolean = solver.solveSimpleExpression(simpleFalsyExpression);
        expect(solver.solveSimpleExpression).toBeDefined();
        expect(typeof solver.solveSimpleExpression).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });

    it('should have a function to solve a compound expression', () => {
        const nextOp1: number = compoundTruthyExpression.indexOf(ALGEBRAIC_OR);
        const nextOp2: number = compoundFalsyExpression.indexOf(ALGEBRAIC_AND);
        const result1: boolean = solver.solveCompoundExpression(compoundTruthyExpression, nextOp1);
        const result2: boolean = solver.solveCompoundExpression(compoundFalsyExpression, nextOp2);
        expect(solver.solveCompoundExpression).toBeDefined();
        expect(typeof solver.solveCompoundExpression).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });

    it('should have a function to solve any expression', () => {
        solver.solveCompoundExpression = jest.fn(solver.solveCompoundExpression);
        solver.solveSimpleExpression = jest.fn(solver.solveSimpleExpression);
        const nextOp1: number = compoundTruthyExpression.indexOf(ALGEBRAIC_OR);
        const result1: boolean = solver.solveCompoundExpression(compoundTruthyExpression, nextOp1);
        const result2: boolean = solver.solveSimpleExpression(simpleTruthyExpression);
        expect(solver.solve).toBeDefined();
        expect(typeof solver.solve).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(true);
        expect(solver.solveCompoundExpression).toHaveBeenCalledTimes(1);
        expect(solver.solveSimpleExpression).toHaveBeenCalledTimes(2);
    });

    it('shoiuld have a function to get the next operator position', () => {
        const example: string = `foo ${ALGEBRAIC_AND} bar ${ALGEBRAIC_OR} fizz`;
        const nextOpPosition: number = solver.getNextOperatorPosition(example);
        expect(solver.getNextOperatorPosition).toBeDefined();
        expect(typeof solver.getNextOperatorPosition).toEqual('function');
        expect(nextOpPosition).toEqual(example.indexOf(ALGEBRAIC_AND));
    });

    it('should have a function to validate an expression', () => {
        const validExpression: string = `(((foo & barr) & fizz))`;
        const invalidExpression: string = `((foo & barr) & fizz))`;
        const result1: boolean = solver.validate(validExpression);
        const result2: boolean = solver.validate(invalidExpression);
        expect(solver.validate).toBeDefined();
        expect(typeof solver.validate).toEqual('function');
        expect(result1).toEqual(true);
        expect(result2).toEqual(false);
    });

    it('should have a function to validate and solve an expression', () => {
        solver.validate = jest.fn(solver.validate);
        solver.solve = jest.fn(solver.solve);
        const example: string = `(${compoundTruthyExpression})`;
        const result: boolean= solver.evaluate(example);
        expect(solver.evaluate).toBeDefined();
        expect(typeof solver.evaluate).toEqual('function');
        expect(result).toEqual(true);
        expect(solver.validate).toHaveBeenCalled();
        expect(solver.solve).toHaveBeenCalled();
    });
});