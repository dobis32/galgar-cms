import * as _path from 'path';
import * as _fs from 'fs';
import { HTML_RULE, CONTROL_RULE } from './src/const/const';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Galgar } from './src/galgar';
import Grammar from './src/grammar';
const main = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const directoryTokens = ['D:', 'code', 'galgar-cms', 'user_components']; // desktop
    const _COMPONENTS_DIRECTORY = directoryTokens.join(_path.sep);
    const grammar = new Grammar([HTML_RULE, CONTROL_RULE]);
    const _galgar = new Galgar(grammar, _COMPONENTS_DIRECTORY);
    const componentPath = [_COMPONENTS_DIRECTORY, 'tests', 'enumComponents', 'enumComponents.ggd'].join(_path.sep);
    const stDataPath = [_COMPONENTS_DIRECTORY, 'tests', 'enumComponents', 'enumComponents.json'].join(_path.sep);
    const stData = JSON.parse(_fs.readFileSync(stDataPath, { encoding: 'utf8', flag: 'rs' })).stData;
    const output = await _galgar.parse(componentPath, stData);
};
main();
