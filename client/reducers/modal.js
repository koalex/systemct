'use strict';

import { MODAL, _SHOW, _HIDE } from '../actions/constants';


export default function (state = {}, action) {
    const { data, type, ...rest } = action;

    switch (type) {
        default: return state;

        case MODAL + _SHOW:
            return Object.assign({}, state, Object.assign({}, data, {
                isOpen: true
            }));
            break;

        case MODAL + _HIDE:
            /*return Object.assign({}, state, {
                isOpen: false
            });*/
            return { isOpen: false };
            break;
    }
}