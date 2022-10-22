import { CLOSING_EXEMPT_TAGS } from './const/const';
export const TokenIdentifier = {
    isSelfClosingTag(t) {
        let ret = false;
        const tagAsString = t.value;
        if (tagAsString[0] == '<' && tagAsString.substring(tagAsString.indexOf('/>')).length == 2)
            ret = true;
        return ret;
    },
    tagMustBeClosed(t) {
        let ret = true;
        const raw = t.value;
        const tagName = raw.substring(1, raw.length - 1).split(' ')[0];
        if (tagName[0] == '!')
            ret = false; // tag name is a directive e.g. <!DOCTYPE html>
        else {
            const adjustedName = tagName.replace('/', '').trim();
            if (CLOSING_EXEMPT_TAGS.indexOf(adjustedName.toLowerCase()) >= 0)
                ret = false; // tag name is not exempt from needing to be closed
        }
        return ret;
    },
    isClosingTag(t) {
        const raw = t.value;
        let ret = false;
        if (raw.indexOf('/') == 1)
            ret = true;
        return ret;
    }
};
