import { Foobar } from '../src/foobar';
describe('foobar', () => {
    let foobar: Foobar;
    beforeEach(() => {
        foobar = new Foobar();
    });
    
    it('sholud be able to add numbers', () => {
        const x: number = 2;
        const y: number = 5;
        expect(foobar.add(x,y)).toEqual(7);
    });
});