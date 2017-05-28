'use strict';

// import { Map } from 'immutable';
// import Dispatcher from '../dispatcher';
// import { EventEmitter } from 'events';
import { AUTH, SIGNIN, _SUCCESS, _ERROR, _CLEAR/*, INPUT_CHANGE*/ } from '../actions/constants';

/*import fixtures from '../fixtures';

const SUBMIT_EVENT = 'submit';*/

const initialState = { email: '', password: '', isLoading: false, errors: {}, error: false };

export default function (state = initialState, action) {
    const { data, type, ...rest } = action;

    switch(type) {

        case AUTH + SIGNIN:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });
            break;
        case AUTH + SIGNIN + _SUCCESS:
            window.localStorage.setItem('access_token', rest.payload.access_token);
            window.localStorage.setItem('user', JSON.stringify(rest.payload.user/*{ _id: rest.payload.user_id }*/));
            return Object.assign({}, state, initialState);
            break;
        case AUTH + SIGNIN + _ERROR:
            const { payload } = rest;

            let nextState = { errors: {}, isLoading: false };

            if (Array.isArray(payload)) {
                payload.forEach(data => {
                    if (data.field && data.message) {
                        nextState.errors[data.field] = data.message;
                    }
                });
                return Object.assign({}, state, nextState)
            } else if (rest.payload.field && rest.payload.message) {
                return Object.assign({}, state, {
                    errors: {
                        [rest.payload.field]: rest.payload.message
                    }
                })
            } else if (rest.payload.message) {
                nextState.error = rest.payload.message;
                return Object.assign({}, state, nextState)
            } else {
                return Object.assign({}, state, {
                    error: rest.payload
                })
            }

            break;
        case _ERROR + _CLEAR:
            return Object.assign({}, state, {
                error: false,
                errors: {}
            });
            break;

        default: return state
    }
}


/*
class SigninStore extends EventEmitter {
    constructor(initialState = {
        email: '', emailErr: false, password: '', passwordErr: false, isLoading: false
    }) {
        super();
        this.__store = initialState;
        this.dispatchToken = Dispatcher.register(action => {
            const { type, data } = action;

            switch(type) {
                case SIGNIN_SUBMIT:
                    this.changeStoreField('isLoading', true);
                    this.clearErrors();
                    this.emitSubmit();
                    break;
                case SIGNIN_SUCCESS:
                    this.saveToken(data.access_token);
                    this.saveUserId(data.user_id);
                    this.changeStoreField('isLoading', false);
                    this.emitSubmit();
                    break;
                case SIGNIN_ERROR:
                    let field   = data.field;
                    let message = data.message;

                    if ('email' === field){
                        this.changeStoreField('emailErr', message);
                    } else if ('password' === field) {
                        this.changeStoreField('passwordErr', message);
                    } else {
                        this.changeStoreField('error', message);
                    }
                    this.changeStoreField('isLoading', false);
                    this.emitSubmit();
                    break;
                case INPUT_CHANGE:
                    for (let k in data) this.changeStoreField(k, data[k]);
                    this.clearErrors();
                    this.emitSubmit();
                    break;

                default: return
            }
        });
    }
    clearErrors () {
        this.__store.error          = false;
        this.__store.emailErr       = false;
        this.__store.passwordErr    = false;
    }
    changeStoreField (k, v) {
        this.__store[k] = v;
    }
    emitSubmit () {
        this.emit(SUBMIT_EVENT);
    }
    addSubmitListener (cb) {
        this.on(SUBMIT_EVENT, cb);
    }
    removeSubmitListener (cb) {
        this.removeListener(SUBMIT_EVENT, cb);
    }

    saveToken (token) {
        window.localStorage.setItem('access_token', token);
    }
    saveUserId (id) {
        window.localStorage.setItem('user', JSON.stringify({ _id: id }));
    }
    get store    () { return this.__store;          }
    // get email    () { return this.__store.email;    }
    // get password () { return this.__store.password; }
}

const store = new SigninStore(fixtures);

export { store as SigninStore }*/
