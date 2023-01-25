import { Router } from 'express';
import { Galgar } from '../galgar';
import { HTML_RULE, CONTROL_RULE } from '../const/const';
import Grammar from '../grammar';
const grammar = new Grammar([HTML_RULE, CONTROL_RULE]);
const _COMPONENTS_DIRECTORY = 'D:\\galgar-cms\\user_components';
const galgar = new Galgar(grammar, _COMPONENTS_DIRECTORY);
const router = Router();
router.get('/parse', async (req, res) => {
    // body of requests expects input field to exist 
    const { identifier, stData } = req.body;
    const payload = {
        message: ''
    };
    galgar.parse(identifier, stData)
        .then((output) => {
        console.log('[ GALGAR ROUTER ] program prased successfuly');
        payload.message = 'Program parsed successfully';
        res.send(payload);
    })
        .catch((e) => {
        const errMsg = '[ GALGAR ROUTER ] failed to parse program: ' + e.message;
        console.log(errMsg);
        payload.message = errMsg;
        res.status(500).send(payload);
    });
});
export default router;
