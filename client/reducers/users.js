'use strict';

import { USERS, ACTIVITY, _READ, _CREATE, _UPDATE, _DELETE, MODAL, _SHOW, _HIDE, _SUCCESS, _ERROR, _CLEAR, INPUT_CHANGE } from '../actions/constants';

const defaultState = {
    isLoading: false,
    error: false,
    errors: {},
    users: []
};

export default function (state = defaultState, action) {
    const { data, payload, type, ...rest } = action;

    let nextState, users, tmp;

    switch(type) {
        default: return state;

        case USERS + _READ:
            return Object.assign({}, state, {
                isLoading: true,
                error: false
            });

            break;

        case USERS + _READ + _SUCCESS:
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                users: payload
            });

            break;

        case USERS + _READ + _ERROR:
            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;
        case  USERS + _CREATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
            });

            break;

        case  USERS + _CREATE + _SUCCESS:
                users = state.users.map(user => Object.assign({}, user));
                users.push(payload);
            return Object.assign({}, state, {
                isLoading: false,
                users: users,
                        error: false
                    });

            break;

        case  USERS + _CREATE + _ERROR:
            nextState = { errors: {}, isLoading: false };

            if (Array.isArray(payload)) {
                payload.forEach(data => {
                    if (data.field && data.message) {
                        nextState.errors[data.field] = data.message;
                    }
                });
                return Object.assign({}, state, nextState)
            } else if (payload.field && payload.message) {
                return Object.assign({}, state, {
                    errors: {
                        [payload.field]: payload.message
                    },
                    isLoading: false
                })
            } else if (payload.message) {
                nextState.error = payload.message;
                return Object.assign({}, state, nextState)
            } else {
                return Object.assign({}, state, {
                    error: payload,
                    isLoading: false
                })
            }

            break;

        case  USERS + _UPDATE + _SUCCESS:
            users = state.users.map(user => {
                let newUser = Object.assign(user);
                if (newUser._id === payload._id) newUser = payload;
                return newUser;
            });

            return Object.assign({}, state, { users });

            break;

        case  USERS + ACTIVITY + _UPDATE + _SUCCESS:
            users = state.users.map(user => {
                let newUser = Object.assign(user);
                if (newUser._id === payload._id) newUser = payload;
                return newUser;
            });

            return Object.assign({}, state, { users });

            break;

        case  USERS + _UPDATE + _ERROR:
            nextState = { errors: {}, isLoading: false };

            if (Array.isArray(payload)) {
                payload.forEach(data => {
                    if (data.field && data.message) {
                        nextState.errors[data.field] = data.message;
                    }
                });
                return Object.assign({}, state, nextState)
            } else if (payload.field && payload.message) {
                return Object.assign({}, state, {
                    errors: {
                       [payload.field]: payload.message
                    }
                })
            } else if (payload.message) {
                nextState.error = payload.message;
                return Object.assign({}, state, nextState)
            } else {
                return Object.assign({}, state, {
                    error: payload
                })
            }

            break;

        case  USERS + _DELETE:
            return Object.assign({}, state, {
                isLoading: true,
                errors: {},
                error: false
            });

            break;

        case  USERS + _DELETE + _SUCCESS:
            tmp = Object.assign({}, payload);

            return Object.assign({}, state, {
                users: state.users.map(user => Object.assign({}, user)).filter(user => user._id !== tmp._id),
                isLoading: false,
                errors: {},
                error: false
            });

            break;

        case  USERS + _DELETE + _ERROR:
            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case _ERROR + _CLEAR:
            return Object.assign({}, state, {
                error: false,
                errors: {}
            });

        case MODAL + _SHOW:
            if ('ADD_EDIT_USER' === data.modalType) {
                return Object.assign({}, state, {
                    user: data.user ? Object.assign({}, data.user) : {}
                });
            }

            break;

        case MODAL + _HIDE:
            if ('ADD_EDIT_USER' === data.modalType) return Object.assign({}, state, { user: {} });

            break;

        case INPUT_CHANGE:
            if (rest.componentName && ('addEditUser' === rest.componentName)) {
                nextState = Object.assign({}, state);

                for (let k in data) nextState.user[k] = data[k];

                return nextState;
            }

            break;
    }
}