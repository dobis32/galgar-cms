export const _TYPE_BLANK_TOKEN = '$BLANK_TOKEN_____';
export const _TYPE_BAD_TOKEN = '$BAD_TOKEN_____';
export const _TYPE_INVALID_INPUT = '$INVALID_INPUT_____';
export const _TYPE_EOF_TOKEN = '$EOF_TOKEN_____';
export const _TYPE_WHITESPACE_TOKEN = '$WHITESPACE_TOKEN_____';
export const _TYPE_HTML_TOKEN = '$HTML_TOKEN_____';
export const _TYPE_INJECTION_TOKEN = '$INJECT_TOKEN_____';
export const _TYPE_CONTENT_TOKEN = '$CONTENT_TOKEN_____';
export const _TYPE_CONTROL_GENERIC_TOKEN = '$CONTROL_GENERIC_TOKEN_____';
export const _TYPE_CONTROL_IF_TOKEN = '$CONTROL_TYPE_IF_TOKEN_____';
export const _TYPE_CONTROL_FOR_TOKEN = '$CONTROL_TYPE_FOR_TOKEN_____';
export const _TYPE_CONTROL_IMPORT_TOKEN = '$CONTROL_TYPE_IMPORT_TOKEN_____';
export const _TYPE_CONTROL_COMPONENT_TOKEN = '$CONTROL_TYPE_CONTROL_TOKEN_____';
export const _TYPE_CONTROL_PROPS_TOKEN = '$CONTROL_TYPE_PROPS_TOKEN_____';
export const CONTROLIF_IF_TOKEN = '$CONTROL_IF_TOKEN_____';
export const CONTROLIF_ELSEIF_TOKEN = '$CONTROL_ELSEIF_TOKEN_____';
export const CONTROLIF_ELSE_TOKEN = '$CONTROL_ELSE_TOKEN_____';
export const CONTROLIF_ENDIF_TOKEN = '$CONTROL_ENDIF_TOKEN_____';
export const CONTROLFOR_FOR_TOKEN = '$CONTROL_FORSTART_TOKEN_____';
export const CONTROLFOR_ENDFOR_TOKEN = '$CONTROL_ENDFOR_TOKEN_____';
export const CONTROL_IMPORT_TOKEN = '$CONTROL_IMPORT_TOKEN';
export const CONTROL_TOKEN_SUFFIX = '$CONTROL_';
export const CONTROL_COMPONENT_TOKEN = '$CONTROL_COMPONENT_TOKEN_____';
export const CONTROL_PROPS_TOKEN = '$CONTROL_PROPS_TOKEN_____';
export const _TYPE_SUPPORTED_TOKEN = [
    _TYPE_HTML_TOKEN,
    _TYPE_CONTROL_GENERIC_TOKEN,
    _TYPE_INJECTION_TOKEN,
    _TYPE_CONTENT_TOKEN,
    _TYPE_CONTROL_IMPORT_TOKEN
];
export const _CONTROL_TOKEN_NAMES = [
    ,
    CONTROLIF_IF_TOKEN,
    CONTROLIF_ELSEIF_TOKEN,
    CONTROLIF_ELSE_TOKEN,
    CONTROLIF_ENDIF_TOKEN,
    CONTROLFOR_FOR_TOKEN,
    CONTROLFOR_ENDFOR_TOKEN,
    CONTROL_IMPORT_TOKEN
];
export const _CONTROL_NAME_MAP = {
    _CONTROLIF_IF_TOKEN: CONTROLIF_ENDIF_TOKEN,
    _CONTROLIF_ELSEIF_TOKEN: CONTROLIF_ENDIF_TOKEN,
    _CONTROLIF_ELSE_TOKEN: CONTROLIF_ENDIF_TOKEN,
    _CONTROLFOR_FOR_TOKEN: CONTROLFOR_ENDFOR_TOKEN,
    _CONTROL_IMPORT_TOKEN: CONTROL_IMPORT_TOKEN
};