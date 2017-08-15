'use strict';

import { LOGS, DICTIONARY, SENSOR, DEVICE, PROJECT, _CREATE, _READ, _UPDATE, _DELETE, _SELECT, _EXPORT, _IMPORT, _SUCCESS, _ERROR } from '../actions/constants';

const initialState = {
    isLoading: false,
    error: false,
    errors: {},
    selectedProjectId: null,
    selectedDeviceId: null,
    selectedSensorId: null,
    log: []
};

export default function (state = initialState, action) {
    const { data, payload, type, ...rest } = action;

    // let nextState;

    switch(type) {
        default: return state;

        case PROJECT + _SELECT:
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                selectedProjectId:  data._id,
                selectedDeviceId: null,
                selectedSensorId: null,
                log: []
            });

        break;

        case DEVICE + _SELECT:
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                selectedDeviceId: data._id,
                selectedSensorId: null,
                log: []
            });

            break;
    }
}