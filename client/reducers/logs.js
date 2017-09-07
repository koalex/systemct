'use strict';

import * as AT from '../actions/constants';

const init = {
    data: [],
    errors: {}
};

export default function (state = init, action) {
    const { type, payload, ...rest } = action;

    switch(type) {

        case AT.LOG + AT._READ:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });
            break;
        case AT.LOG + AT._READ + AT._SUCCESS:
            return Object.assign({}, state, initialState);
            break;
        case AT.LOG + AT._READ + AT._ERROR:
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