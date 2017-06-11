'use strict';

import { DICTIONARY, UGO, _DROP, _CREATE, _READ,  _UPDATE, _DELETE, MODAL, _SHOW, _HIDE, _SUCCESS, _ERROR, _CLEAR, _EXPORT, _IMPORT, INPUT_CHANGE } from '../actions/constants';

const defaultState = {
    isLoading: false,
    error: false,
    errors: {},
    dialog: {
        isOpen: false
    },
    ugo: {
        files: []
    },
    items: []
};

export default function (state = defaultState, action) {
    const { data, payload, type, ...rest } = action;

    let nextState, items, tmp;

    switch(type) {
        default: return state;

        case DICTIONARY + UGO + _IMPORT:

            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

        case DICTIONARY + UGO + _IMPORT + _ERROR:

            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case DICTIONARY + UGO + _READ:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

            break;

        case DICTIONARY + UGO + _READ + _SUCCESS:
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                items: payload
            });

            break;

        case DICTIONARY + UGO + _READ + _ERROR:
            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case  DICTIONARY + UGO + _CREATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
            });

            break;

        case  DICTIONARY + UGO + _CREATE + _SUCCESS:
            items = state.items.map(item => Object.assign({}, item));
            items.push(payload);
            return Object.assign({}, state, {
                isLoading: false,
                items: items,
                error: false,
                errors: {}
            });

            break;

        case  DICTIONARY + UGO + _CREATE + _ERROR:
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

        case  DICTIONARY + UGO + _UPDATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

            break;

        case  DICTIONARY + UGO + _UPDATE + _SUCCESS:
            items = state.items.map(item => {
                let newItem = Object.assign(item);
                if (newItem._id === payload._id) newItem = payload;
                return newItem;
            });

            return Object.assign({}, state, {
                items,
                isLoading: false,
                error: false,
                errors: {}
            });

            break;

        case  DICTIONARY + UGO + _UPDATE + _ERROR:
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
                        [payload.field]: payload.message,
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

        case  DICTIONARY + UGO + _DELETE:
            return Object.assign({}, state, {
                isLoading: true,
                errors: {},
                error: false
            });

            break;

        case  DICTIONARY + UGO + _DELETE + _SUCCESS:
            tmp = Object.assign({}, payload);

            return Object.assign({}, state, {
                items: state.items.map(item => Object.assign({}, item)).filter(item => item._id !== tmp._id),
                isLoading: false,
                errors: {},
                error: false
            });

            break;

        case  DICTIONARY + UGO + _DELETE + _ERROR:
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

        case DICTIONARY + UGO +_DROP:
            nextState = Object.assign({}, state, {
                error: false,
                errors: {}
            });
            nextState.ugo.files = data;

            return nextState;

            break;

        case DICTIONARY + UGO + _EXPORT + _ERROR:
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

        case MODAL + _SHOW:
            if ('ADD_EDIT_UGO' === data.modalType) {
                nextState = Object.assign({}, state, {
                    dialog: { isOpen: true },
                    ugo: data.ugo ? Object.assign({}, data.ugo) : {},
                    error: false,
                    errors: {}
                });

                if (data.ugo && data.ugo.img) {
                    nextState.ugo.files = [{ preview: data.ugo.img }]
                } else {
                    nextState.ugo.files = []
                }

                return nextState
            }

            return state;

            break;

        case MODAL + _HIDE:
            if (state.ugo.files[0]) window.URL.revokeObjectURL(state.ugo.files[0].preview);

            if ('ADD_EDIT_UGO' === data.modalType) return Object.assign({}, state, {
                ugo: { files: [] },
                dialog: { isOpen: false },
                error: false,
                errors: {}
            });

            return state;

            break;

        case INPUT_CHANGE:
            if (rest.componentName && ('addEditUGO' === rest.componentName)) {
                nextState = Object.assign({}, state);

                for (let k in data) nextState.ugo[k] = data[k];

                return nextState;
            }

            return state;

            break;
    }
}