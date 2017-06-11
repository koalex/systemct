'use strict';

import { AUTH, _IMPORT, _EXPORT, _CHECK, SIGNOUT, MODAL, _SHOW, _HIDE, SIGNIN, USERS, DICTIONARY, UGO, _READ, _CREATE, _UPDATE, _DELETE, INPUT_CHANGE } from './constants';

export function dispatch (data) {
    const { type, ...rest } = data;

    let action =  { type };

    for (let k in rest) action[k] = rest[k];

    return action;
}

export function inputChange (data) {
    const { componentName } = data;
    delete data.componentName;
    return {
        type: INPUT_CHANGE,
        data: data,
        componentName
    }
}

export function authCheck () {
    return {
        type: AUTH + _CHECK,
        CALL_API: {
            endpoint: '/api/me',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    }
}

export function signout () {
    return {
        type: AUTH + SIGNOUT,
        CALL_API: {
            endpoint: '/api/signout',
            method: 'POST',
            headers: {
                'Content-Type': null,
                'Accept': null
            }
        }
    }
}

export function signinSubmit (credentials) {
    return {
        type: AUTH + SIGNIN,
        data: credentials,
        CALL_API: {
            endpoint: '/signin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    }
}

export function usersCreate (user, opts = {}) {
    return {
        type: USERS + _CREATE,
        data: { user },
        skipSuccess: opts.skipSuccess,
        CALL_API: {
            endpoint: '/api/users',
            method: 'POST'
        }
    }
}

/*export function getUsers () { // OLD
    return {
        type: USERS + _READ,
        CALL_API: {
            endpoint: '/api/users',
            method: 'GET'
        },

    }
}*/

export function usersRead () {
    return {
        type: USERS + _READ,
        CALL_API: {
            endpoint: '/api/users',
            method: 'GET'
        },

    }
}

export function usersUpdate (user, opts = {}) {
    return {
        type: USERS + _UPDATE,
        data: { user },
        skipSuccess: opts.skipSuccess,
        CALL_API: {
            endpoint: '/api/users/' + user._id,
            method: 'PUT'
        },

    }
}

export function usersDelete (userId) {
    return {
        type: USERS + _DELETE,
        data: { userId },
        CALL_API: {
            endpoint: '/api/users/' + userId,
            method: 'DELETE'
        },

    }
}

export function dictionaryCreate (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _CREATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                },

            };

        break;
    }

}

export function dictionaryRead (dictionary) {
    switch (dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _READ,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo',
                    method: 'GET'
                },

            };
            break;

    }

}

export function dictionaryUpdate (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _UPDATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/' + data.ugoId,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'PUT'
                },

            };

            break;

    }
}

export function dictionaryDelete (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _DELETE,
                data: { ugoId: data.ugoId },
                // skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/' + data.ugoId,
                    method: 'DELETE'
                },

            };

            break;

    }
}

export function dictionaryExport (dictionary, filename) {
    switch (dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _EXPORT,
                filename: filename,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/export',
                    method: 'GET'
                },

            };

            break;
    }
}

export function dictionaryImport (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _IMPORT,
                data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'POST'
                },

            };

            break;
    }
}

export function modalShow (data) {
    return {
        type: MODAL + _SHOW,
        data
    }
}

export function modalHide (data) {
    return {
        type: MODAL + _HIDE,
        data
    }
}