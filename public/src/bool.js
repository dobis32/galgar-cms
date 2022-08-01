import { ALGEBRAIC_AND, ALGEBRAIC_NOT, ALGEBRAIC_OR } from "./const/const";
export class AlgebraSolver {
    st;
    enumMap = {};
    constructor(st, enumMap) {
        this.st = st;
        if (enumMap == undefined)
            enumMap = {};
        this.enumMap = enumMap;
    }
    setSymbolTable(st) {
        this.st = st;
    }
    getSymbolTable() {
        return this.st;
    }
    evaluate(input) {
        let ret = false;
        const inputIsValid = this.validate(input);
        try {
            if (!inputIsValid)
                throw new Error('[ ALGEBRA SOLVER ] Input must be valid before it can be evaluated');
            const exp = input;
            ret = this.solve(exp);
        }
        catch (error) {
            console.log(error);
            ret = false;
        }
        finally {
            return ret;
        }
    }
    solve(expression) {
        let exp = expression; // declaring a local variable IS intentional
        let ret = false;
        try {
            while (exp[0] == '(' && exp[exp.length - 1] == ')') {
                exp = exp.substring(1, exp.length - 1);
            }
            let nextOpIndex = this.getNextOperatorPosition(exp);
            if (nextOpIndex >= 0) {
                ret = this.solveCompoundExpression(exp, nextOpIndex);
            }
            else {
                ret = this.solveSimpleExpression(exp);
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            return ret;
        }
    }
    solveCompoundExpression(expression, nextOpIndex) {
        let ret;
        const lhRaw = expression.substring(0, nextOpIndex).trim();
        const expOp = expression[nextOpIndex];
        const rhRaw = expression.substring(nextOpIndex + 1).trim();
        const lhResult = this.solve(lhRaw);
        if (expOp == ALGEBRAIC_OR && lhResult == true)
            ret = true;
        else if (expOp == ALGEBRAIC_AND && lhResult == false)
            ret = false;
        else {
            const rhResult = this.solve(rhRaw);
            if (rhResult == true)
                ret = true;
            else
                ret = false;
        }
        return ret;
    }
    solveSimpleExpression(expression) {
        let result = false;
        if (expression.indexOf(ALGEBRAIC_AND) >= 0 || expression.indexOf(ALGEBRAIC_OR) >= 0)
            throw new Error('[ ALGEBRA SOLVER ] solveSimpleExpression(): found a logical operator in a simple exprssion');
        const expressionTokens = expression.split(' ').filter((s) => s.length > 0);
        let negate = false;
        while (expressionTokens[0] == ALGEBRAIC_NOT) {
            negate = !negate;
            expressionTokens.shift();
        }
        const symbol = expressionTokens[0];
        let symbolValue = this.st.resolveSymbol(symbol, this.enumMap);
        result = symbolValue ? true : false;
        if (symbolValue !== undefined && negate)
            result = !result;
        return result;
    }
    getNextOperatorPosition(expression) {
        const pStack = [];
        let target = -1;
        for (let i = 0; i < expression.length; i++) {
            const c = expression[i];
            if (c == '(')
                pStack.push(c);
            else if (c == ')')
                pStack.pop();
            else if (c == ALGEBRAIC_AND && pStack.length == 0)
                target = i;
            else if (c == ALGEBRAIC_OR && pStack.length == 0)
                target = i;
            if (target >= 0)
                break;
        }
        return target;
    }
    validate(input) {
        const pStack = [];
        let inputIsValid = false;
        try {
            for (let i = 0; i < input.length; i++) {
                const c = input[i];
                if (c == '(')
                    pStack.push(c);
                else if (c == ')') {
                    if (pStack.length == 0)
                        throw new Error('[ ALGEBRA SOLVER ] Unexpected closing parentheses found during validation; check expression');
                    else
                        pStack.pop();
                }
            }
            if (pStack.length == 0)
                inputIsValid = true;
        }
        catch (error) {
            console.log(error);
            inputIsValid = false;
        }
        finally {
            return inputIsValid;
        }
    }
}
