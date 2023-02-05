import express from 'express';
import * as _path from 'path';
import * as _fs from 'fs';

import { _TYPE_BAD_TOKEN, _TYPE_EOF_TOKEN, _TYPE_HTML_TOKEN, _TYPE_INVALID_INPUT, _TYPE_WHITESPACE_TOKEN } from './src/const/tokenData';
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
    //const directoryTokens = ['C:', 'code', 'galgar-cms', 'user_components']; // lappy
    const directoryTokens = ['D:', 'galgar-cms', 'user_components']; // desktop
    const _COMPONENTS_DIRECTORY: string = directoryTokens.join(_path.sep);
    const grammar: Grammar = new Grammar([ HTML_RULE, CONTROL_RULE ]);
    const _galgar: Galgar = new Galgar(grammar, _COMPONENTS_DIRECTORY);
    const componentPath = [_COMPONENTS_DIRECTORY, 'tests', 'conditionalRendering', 'ifControlRendering.ggd'].join(_path.sep);
    const stDataPath: string = [_COMPONENTS_DIRECTORY, 'tests', 'conditionalRendering', 'ifControlRendering.json'].join(_path.sep);
    console.log(componentPath);
    const stData: any = JSON.parse(_fs.readFileSync(stDataPath, {encoding:'utf8', flag:'rs'})).stData;
    console.log(stData);
    const output:string = await _galgar.parse(componentPath, stData);
    // console.log(output);
    // const port = process.env.PORT || 3001;
    // const app = express();
    // const publicDirectoryPath = path.join(__dirname, '../public');
    // app.use(express.json({ limit: '50mb' }));
    // app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    // app.use(express.static(publicDirectoryPath));
    // app.use(galgarRouter);
    // app.listen(port, () => {
    //     console.log('Server is up on port ' + port);
    // });
};
main();

