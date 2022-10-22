import { iToken } from './interfaces/interfaces';
export declare const TokenIdentifier: {
    isSelfClosingTag(t: iToken): boolean;
    tagMustBeClosed(t: iToken): boolean;
    isClosingTag(t: iToken): boolean;
};
