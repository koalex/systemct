'use strict';

import { AUTH, _CHECK, SIGNOUT, MODAL, _SHOW, _HIDE, SIGNIN, USERS, _READ, _CREATE, _UPDATE, _DELETE, INPUT_CHANGE } from './constants';

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