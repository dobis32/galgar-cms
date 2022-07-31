import { SymbolTable } from './src/symbolTable';
import { AlgebraSolver } from './src/bool';
const ctx1 = {
    aliases: {
        foo: 'bar',
        fizz: false
    },
    props: {
        bar: 456,
        buzz: -123
    }
};
const truthyExpression = `foo`;
const st = new SymbolTable([ctx1]);
const solver = new AlgebraSolver(st, {});
console.log(solver.solveSimpleExpression(truthyExpression));
