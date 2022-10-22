import express from 'express';
import * as path from 'path';
import { _TYPE_BAD_TOKEN, _TYPE_EOF_TOKEN, _TYPE_HTML_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN } from './src/const/tokenTypes';
import { HTML_RULE, CONTROL_RULE } from './src/const/const';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Galgar } from './src/galgar';
import Grammar from './src/grammar';
import { iSymbolTable } from './src/interfaces/interfaces';
import galgarRouter from './src/routers/galgar.routers';

const main = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const port = process.env.PORT || 3001;
    const app = express();
    const publicDirectoryPath = path.join(__dirname, '../public');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(express.static(publicDirectoryPath));
    app.use(galgarRouter);
    app.listen(port, () => {
        console.log('Server is up on port ' + port);
    });
};
main();

// const grammar: Grammar = new Grammar([ HTML_RULE, CONTROL_RULE ]);
// const galgar = new Galgar(grammar);
// const stData: iSymbolTable = {
//     foobar: 'hello world',
//     condition1: false,
//     condition2: true,
//     condition3: false
// }
// galgar.parseProgram('foobar', stData);

