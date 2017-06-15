'use strict';

import { DICTIONARY, UGO, SENSOR, DEVICE, PROJECT, _CHANGE, _DROP, _CREATE, _READ,  _UPDATE, _DELETE, MODAL, _SHOW, _HIDE, _SUCCESS, _ERROR, _CLEAR, _EXPORT, _IMPORT, INPUT_CHANGE } from '../actions/constants';
const uuidV4 = require('uuid/v4');
const defaultState = {
    isLoading: false,
    error: false,
    errors: {},
    dialog: {
        isOpen: false
    },
    device: {
        files: [],
        sensors: []
    },
    items: []
};

export default function (state = defaultState, action) {
    const { data, payload, type, ...rest } = action;

    let nextState, items, tmp;

    switch(type) {
        default: return state;

        case DEVICE + _CHANGE:
            nextState = Object.assign({}, state);

            for (let i = 0, l = nextState.items.length; i < l; i ++) {
                if (nextState.items[i]._id === data) {
                    nextState.device = Object.assign({}, nextState.items[i]);
                    if (!nextState.device.files) nextState.device.files = [];
                    break;
                }
            }

            return nextState;

        case DEVICE + SENSOR + _CREATE:
            if (!state.device._id) return state;

            nextState = Object.assign({}, state);

            if (!Array.isArray(nextState.device.sensors)) nextState.device.sensors = [];

            nextState.device.sensors.unshift(Object.assign({}, data, { _id: uuidV4(), editMode: false }));

            return nextState;

            break;

        case DEVICE + SENSOR + _UPDATE:
            nextState = Object.assign({}, state);

            nextState.device.sensors = nextState.device.sensors.map(sensor => {
                if (sensor._id === data._id) {
                    return Object.assign(sensor, data, { editMode: true });
                }
                return sensor;
            });

            return nextState;

            break;

        case DEVICE + SENSOR + _DELETE:
            nextState = Object.assign({}, state);

            nextState.device.sensors = nextState.device.sensors.filter(sensor => sensor._id !== data._id);

            return nextState;

            break;

        case DICTIONARY + DEVICE + _IMPORT:

            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

            break;

        case DICTIONARY + DEVICE + _IMPORT + _ERROR:

            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case DICTIONARY + DEVICE + _READ:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

            break;

        case DICTIONARY + DEVICE + _READ + _SUCCESS:
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                items: payload
            });

            break;

        case DICTIONARY + DEVICE + _READ + _ERROR:
            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case  DICTIONARY + DEVICE + _CREATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
            });

            break;

        case  DICTIONARY + DEVICE + _CREATE + _SUCCESS:
            items = state.items.map(item => Object.assign({}, item));
            items.push(payload);
            return Object.assign({}, state, {
                isLoading: false,
                items: items,
                dialog: { isOpen: false },
                device: state.device._id ? state.device : Object.assign({}, payload, { files: [] }),
                error: false,
                errors: {}
            });

            break;

        case  DICTIONARY + DEVICE + _CREATE + _ERROR:
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

        case  DICTIONARY + DEVICE + _UPDATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

            break;

        case  DICTIONARY + DEVICE + _UPDATE + _SUCCESS:
            items = state.items.map(item => {
                let newItem = Object.assign(item);
                if (newItem._id === payload._id) newItem = payload;
                return newItem;
            });

            nextState = Object.assign({}, state, {
                items,
                isLoading: false,
                error: false,
                errors: {}
            });

            if (payload._id === state.device._id) {
                nextState.device =  Object.assign(nextState.device, payload, {
                    sensors: payload.sensors.map(s => Object.assign({}, s))
                })
            }

            return nextState;

            break;

        case  DICTIONARY + DEVICE + _UPDATE + _ERROR:
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

        case  DICTIONARY + DEVICE + _DELETE:
            return Object.assign({}, state, {
                isLoading: true,
                errors: {},
                error: false
            });

            break;

        case  DICTIONARY + DEVICE + _DELETE + _SUCCESS:
            tmp = Object.assign({}, payload);

            return Object.assign({}, state, {
                items: state.items.map(item => Object.assign({}, item)).filter(item => item._id !== tmp._id),
                device: {
                    files: [],
                    sensors: []
                },
                isLoading: false,
                errors: {},
                error: false
            });

            break;

        case  DICTIONARY + DEVICE + _DELETE + _ERROR:
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

        case DICTIONARY + DEVICE +_DROP:
            nextState = Object.assign({}, state, {
                error: false,
                errors: {}
            });
            nextState.device.files = data;

            return nextState;

            break;

        case DICTIONARY + DEVICE + _EXPORT + _ERROR:
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
            if ('ADD_DEVICE' === data.modalType) {
                nextState = Object.assign({}, state, {
                    dialog: { isOpen: true },
                    device: data.device ? Object.assign({}, data.device) : {},
                    error: false,
                    errors: {}
                });

                if (data.device && data.device.img) {
                    nextState.device.files = [{ preview: data.device.img }]
                } else {
                    nextState.device.files = []
                }

                return nextState
            }

            return state;

            break;

        case MODAL + _HIDE:
            if (state.device.files[0]) window.URL.revokeObjectURL(state.device.files[0].preview);

            if ('ADD_DEVICE' === data.modalType) return Object.assign({}, state, {
                device: state.device._id ? state.device : { files: [] },
                dialog: { isOpen: false },
                error: false,
                errors: {}
            });

            return state;

            break;

        case INPUT_CHANGE:
            if (rest.componentName && ('addDevice' === rest.componentName)) {
                nextState = Object.assign({}, state);
                for (let k in data) nextState.device[k] = data[k];

                return nextState;
            }

            return state;

            break;
    }
}