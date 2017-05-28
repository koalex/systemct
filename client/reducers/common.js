'use strict';

import { INPUT_CHANGE, MODAL, _HIDE, USERS, _CREATE, SIGNIN, SIGNOUT, AUTH, _CHECK, _SUCCESS, _ERROR } from '../actions/constants';

export default function (state = { bootstrap: true }, action) {
    const { data, type, ...rest } = action;

    let nextState;

    switch(type) {
        case AUTH + SIGNOUT:
            return Object.assign({}, state);
            break;
        case AUTH + SIGNOUT + _SUCCESS:
            window.localStorage.setItem('access_token', null);
            window.localStorage.setItem('user', null);
            return Object.assign({}, state, {
                isLoading: false,
                isAuthenticated: false,
                email: null,
                password: null,
                passwordConfirmation: null
            });
            break;
        case AUTH + SIGNOUT + _ERROR:
            return Object.assign({}, state);
            break;

        case INPUT_CHANGE:
            nextState = {};
            for (let k in data) Object.assign(nextState, state, { [k]: data[k] });
            nextState = Object.assign({}, nextState);

            return nextState;
            break;
        case AUTH + _CHECK:
            return Object.assign({}, state, {
                isLoading: true,
                isAuthenticated: false
            });
            break;
        case AUTH + _CHECK + _SUCCESS:
            window.localStorage.setItem('user', JSON.stringify(rest.payload));
            return Object.assign({}, state, {
                bootstrap: false,
                isLoading: false,
                isAuthenticated: true
            });
            break;
        case AUTH + _CHECK + _ERROR:
            window.localStorage.setItem('access_token', null);
            window.localStorage.setItem('user', null);
            return Object.assign({}, state, {
                bootstrap: false,
                isLoading: false,
                isAuthenticated: false
            });
            break;
        case AUTH + SIGNIN + _SUCCESS:
            return Object.assign({}, state, {
                isLoading: false,
                isAuthenticated: true
            });
            break;

        case  USERS + _CREATE + _SUCCESS:
            nextState = Object.assign({}, state);
            delete nextState.email;
            delete nextState.password;
            return nextState;
            break;

        case  USERS + _CREATE + _ERROR:
            nextState = Object.assign({}, state);
            delete nextState.email;
            delete nextState.password;
            return nextState;
            break;

        case MODAL + _HIDE:
            // if (!data.modalType || !data.mode) return state;

            return {
                bootstrap: state.bootstrap,
                isLoading: state.isLoading,
                isAuthenticated: state.isAuthenticated
            };

            break;

        default: return state
    }
};