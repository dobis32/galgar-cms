import { SymbolTable } from "./symbolTable";
import { ALGEBRAIC_AND, ALGEBRAIC_NOT, ALGEBRAIC_OR } from "./const/const";
import { iEnumerationMap } from "./interfaces/interfaces";

export class AlgebraSolver {
    private st: SymbolTable;
    private enumMap: iEnumerationMap = {};

    constructor(st: SymbolTable, enumMap?: iEnumerationMap) {
        this.st = st;
        if (enumMap == undefined) enumMap = {};
        this.enumMap = enumMap;
    }

    setSymbolTable(st: SymbolTable): void {
        this.st = st;
    }

    getSymbolTable(): SymbolTable {
        return this.st;
    }

    evaluate(input: string): boolean {
        let ret: boolean = false;
        const inputIsValid: boolean = this.validate(input);
        try {
            if (!inputIsValid) throw new Error('[ ALGEBRA SOLVER ] Input must be valid before it can be evaluated');
            const exp: string = input;
            ret = this.solve(exp);
        } catch(error) {
            console.log(error);
            ret = false;
        } finally {
            return ret;
        }
    }

    solve(expression: string): boolean {
        let exp: string = expression; // declaring a local variable IS intentional
        let ret: boolean = false;
        try {
            while (exp[0] == '(' && exp[exp.length - 1] == ')') {
                exp = exp.substring(1, exp.length - 1);
            }
            let nextOpIndex: number = this.getNextOperatorPosition(exp);
            if (nextOpIndex >= 0) {
                ret = this.solveCompoundExpression(exp, nextOpIndex);
            } else {
                ret = this.solveSimpleExpression(exp);
            }
        } catch(error) {
            console.log(error);
        } finally {
            return ret;
        }
    }

    solveCompoundExpression(expression: string, nextOpIndex: number): boolean {
        let ret: boolean;
        const lhRaw: string = expression.substring(0, nextOpIndex).trim();
        const expOp: string = expression[nextOpIndex];
        const rhRaw: string = expression.substring(nextOpIndex + 1).trim();
        const lhResult: boolean = this.solve(lhRaw);
        if (expOp == ALGEBRAIC_OR && lhResult == true) ret = true;
        else if (expOp == ALGEBRAIC_AND && lhResult == false) ret = false;
        else {
            const rhResult: boolean = this.solve(rhRaw);
            if (rhResult == true) ret = true;
            else ret = false;
        }
        return ret;
    }

    solveSimpleExpression(expression: string): boolean {
        let result: boolean = false;
        if (expression.indexOf(ALGEBRAIC_AND) || expression.indexOf(ALGEBRAIC_OR)) throw new Error('[ ALGEBRA SOLVER ] solveSimpleExpression(): found a logical operator in a simple exprssion');
        const expressionTokens: Array<string> = expression.split(' ').filter((s: string) => s.length > 0);
        let negate: boolean = false;
        while (expressionTokens[0] == ALGEBRAIC_NOT) {
            negate = !negate;
            expressionTokens.shift();
        }
        const symbol: string = expressionTokens[0];
        let symbolValue: any = this.st.resolveSymbol(symbol, this.enumMap);
        result = symbolValue ? true : false;
        if (symbolValue !== undefined && negate) result = !result;
        return result;
    }

    getNextOperatorPosition(expression: string): number {
        const pStack: Array<string> = [];
        let target: number = -1;
        for (let i = 0; i < expression.length; i++) {
            const c: string = expression[i];
            if (c == '(') pStack.push(c);
            else if (c == ')') pStack.pop();
            else if (c == ALGEBRAIC_AND && pStack.length == 0) target = i;
            else if (c == ALGEBRAIC_OR && pStack.length == 0) target = i;
            if (target >= 0) break;
        }
        return target;
    }

    validate(input: string): boolean {
        const pStack: Array<string> = [];
        let inputIsValid: boolean = false;
        try {
            for (let i = 0; i < input.length; i++) {
                const c: string = input[i];
                if (c == '(') pStack.push(c);
                else if (c == ')') {
                    if (pStack.length == 0) throw new Error('[ ALGEBRA SOLVER ] Unexpected closing parentheses found during validation; check expression');
                    else pStack.pop();
                }
            }
            if (pStack.length == 0) inputIsValid = true;
        } catch (error) {
            console.log(error);
            inputIsValid = false;
        } finally {
            return inputIsValid;
        }
    }
}