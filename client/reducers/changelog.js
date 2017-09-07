'use strict';

import * as AT from '../actions/constants';

const init = {
    data: [],
    isLoading: false,
    error: false,
    errors: {},
    // projects: {}
};

export default function (state = init, action) {
    const { type, data, payload, ...rest } = action;

    let nextState;

    switch(type) {
        default: return state;

        case AT.CHANGELOG + AT._READ:
            nextState = Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
            });
            // if (!nextState.projects[data.projectId]) nextState.projects[data.projectId] = {};
            // if (!nextState.projects[data.projectId][data.deviceId]) nextState.projects[data.projectId][data.deviceId] = {};
            // if (!nextState.projects[data.projectId][data.deviceId][data.sensorId]) nextState.projects[data.projectId][data.deviceId][data.sensorId] = {};
            // nextState.projects[data.projectId][data.deviceId][data.sensorId][data.from + data.to] = 'loading';
            return nextState;
            break;

        case AT.CHANGELOG + AT._READ + AT._SUCCESS:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                // data: state.data.concat(payload)
            });
            // nextState.projects[data.projectId][data.deviceId][data.sensorId][data.from + data.to] = payload;
            return nextState;
            break;

        case AT.CHANGELOG + AT._READ + AT._ERROR:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {}
            });

            // if (!nextState.projects[data.projectId]) nextState.projects[data.projectId] = {};
            // if (!nextState.projects[data.projectId][data.deviceId]) nextState.projects[data.projectId][data.deviceId] = {};
            // if (!nextState.projects[data.projectId][data.deviceId][data.sensorId]) nextState.projects[data.projectId][data.deviceId][data.sensorId] = {};
            // nextState.projects[data.projectId][data.deviceId][data.sensorId][data.from + data.to] = null;

            if (Array.isArray(payload)) {
                payload.forEach(data => {
                    if (data.field && data.message) {
                        nextState.errors[data.field] = data.message;
                    }
                });

                return nextState;
            } else if (payload.field && payload.message) {
                nextState.errors = {
                    [payload.field]: payload.message
                };

                return nextState;
            } else if (payload.message) {
                nextState.error = payload.message;

                return nextState;
            } else {
                nextState.error = payload;
            }

            return nextState;

            break;
    }
}