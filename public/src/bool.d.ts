import { SymbolTable } from "./symbolTable";
import { iEnumerationMap } from "./interfaces/interfaces";
export declare class AlgebraSolver {
    private st;
    private enumMap;
    constructor(st: SymbolTable, enumMap?: iEnumerationMap);
    setSymbolTable(st: SymbolTable): void;
    getSymbolTable(): SymbolTable;
    evaluate(input: string): boolean;
    solve(expression: string): boolean;
    solveCompoundExpression(expression: string, nextOpIndex: number): boolean;
    solveSimpleExpression(expression: string): boolean;
    getNextOperatorPosition(expression: string): number;
    validate(input: string): boolean;
}
