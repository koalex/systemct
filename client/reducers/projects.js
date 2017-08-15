'use strict';

import { DICTIONARY, UGO, SENSOR, DEVICE, PROJECT, _CHANGE, _SELECT, _DROP, _CREATE, _READ,  _UPDATE, _DELETE, MODAL, _SHOW, _HIDE, _SUCCESS, _ERROR, _CLEAR, _EXPORT, _IMPORT, INPUT_CHANGE } from '../actions/constants';

const defaultState = {
    isLoading: false,
    error: false,
    errors: {},
    newProject: {
        isOpen: false,
        title: '',
        files: []
    },
    selectedProject: {
        _id: null,
        title: null,
        img: null,
        devices: []
    },
    items: [],
    sensorAdvanced: false
};

function cloneProject (project) {
    return Object.assign({}, project, {
        devices: Array.isArray(project.devices) && project.devices.length ? project.devices.map(d => {
            return Object.assign({}, d, {
                sensors: Array.isArray(d.sensors) && d.sensors.length ? d.sensors.map(s => {
                    return Object.assign({}, s, {
                        registers: Array.isArray(s.registers) && s.registers.length ? s.registers.filter(r => r != null && r != undefined) : []
                    });
                }) : []
            });
        }) : []
    })
}

export default function (state = defaultState, action) {
    const { data, payload, type, ...rest } = action;

    let nextState, items, tmp;

    switch(type) {
        default: return state;

        case DICTIONARY + PROJECT + _IMPORT:

            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {}
            });

        case DICTIONARY + PROJECT + _IMPORT + _ERROR:

            return Object.assign({}, state, {
                isLoading: false,
                error: payload.message
            });

            break;

        case DICTIONARY + PROJECT + _EXPORT + _ERROR:
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

        case 'READ_HOLDING_REGISTERS_SUCCESS':
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: {
                    isOpen: false,
                    title: '',
                    files: []
                },
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            nextState.selectedProject.devices.forEach(d => {
               if (d._id == payload.deviceId) {
                   d.sensors.forEach(s => {
                       if (s._id == payload.sensorId) {
                           if (!s.registersValues) s.registersValues = {};
                           s.registersValues[payload.register] = payload.data;
                       }
                   })
               }
            });

            return nextState;

            break;

        case 'READ_HOLDING_REGISTERS_ERROR':
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: {
                    isOpen: false,
                    title: '',
                    files: []
                },
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            nextState.selectedProject.devices.forEach(d => {
                if (d._id == payload.deviceId) {
                    d.sensors.forEach(s => {
                        if (s._id == payload.sensorId) {
                            if (!s.registersValues) s.registersValues = {};
                            s.registersValues[payload.register] = payload.message || 'ошибка'; // payload.message
                        }
                    })
                }
            });

            return nextState;

            break;
        // CREATE

        case  DICTIONARY + PROJECT + _CREATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            break;

        case  DICTIONARY + PROJECT + _CREATE + _SUCCESS:
            if (Array.isArray(state.newProject.files) && state.newProject.files[0]) {
                window.URL.revokeObjectURL(state.newProject.files[0].preview);
            }

            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: {
                    isOpen: false,
                    title: '',
                    files: []
                },
                selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : cloneProject(payload),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            nextState.items.push(cloneProject(payload));

            return nextState;

            break;

        case  DICTIONARY + PROJECT + _CREATE + _ERROR:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : cloneProject(payload),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            if (Array.isArray(payload)) {
                payload.forEach(data => { if (data.field && data.message) nextState.errors[data.field] = data.message; });
            } else if (payload.field && payload.message) {
                nextState.errors = { [payload.field]: payload.message }
            } else if (payload.message) {
                nextState.error = payload.message;
            } else {
                nextState.error = payload;
            }

            return nextState;

            break;

        // READ

        case  DICTIONARY + PROJECT + _READ:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            break;

        case  DICTIONARY + PROJECT + _READ + _SUCCESS:
            if (Array.isArray(payload) && !payload.length) return state;

            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: cloneProject(state.selectedProject),
                items: payload.map(p => cloneProject(p))
            });

            return nextState;

            break;

        case  DICTIONARY + PROJECT + _READ + _ERROR:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : cloneProject(payload),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            if (Array.isArray(payload)) {
                payload.forEach(data => { if (data.field && data.message) nextState.errors[data.field] = data.message; });
            } else if (payload.field && payload.message) {
                nextState.errors = { [payload.field]: payload.message }
            } else if (payload.message) {
                nextState.error = payload.message;
            } else {
                nextState.error = payload;
            }

            return nextState;

            break;

        // UPADTE

        case  DICTIONARY + PROJECT + _UPDATE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            break;

        case  DICTIONARY + PROJECT + _UPDATE + _SUCCESS:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: {
                    isOpen: false,
                    title: '',
                    files: []
                },
                selectedProject: state.selectedProject._id ? state.selectedProject._id === payload._id ? cloneProject(payload) : cloneProject(state.selectedProject) : {
                    _id: null,
                    title: null,
                    img: null,
                    devices: []
                },
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => {
                    if (payload._id === p._id) {
                        return cloneProject(payload);
                    } else {
                        return cloneProject(p);
                    }
                }) : []
            });

            return nextState;

            break;

        case  DICTIONARY + PROJECT + _UPDATE + _ERROR:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : cloneProject(payload),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            if (Array.isArray(payload)) {
                payload.forEach(data => { if (data.field && data.message) nextState.errors[data.field] = data.message; });
            } else if (payload.field && payload.message) {
                nextState.errors = { [payload.field]: payload.message }
            } else if (payload.message) {
                nextState.error = payload.message;
            } else {
                nextState.error = payload;
            }

            return nextState;

            break;

        // DELETE
        case  DICTIONARY + PROJECT + _DELETE:
            return Object.assign({}, state, {
                isLoading: true,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: cloneProject(state.selectedProject),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            break;

        case  DICTIONARY + PROJECT + _DELETE + _SUCCESS:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: state.selectedProject._id === payload._id ? {
                    _id: null,
                    title: null,
                    img: null,
                    devices: []
                } : cloneProject(state.selectedProject),
                items: state.items.map(p => cloneProject(p)).filter(p => p._id !== payload._id)
            });

            return nextState;

            break;

        case  DICTIONARY + PROJECT + _DELETE + _ERROR:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : cloneProject(payload),
                items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
            });

            if (Array.isArray(payload)) {
                payload.forEach(data => { if (data.field && data.message) nextState.errors[data.field] = data.message; });
            } else if (payload.field && payload.message) {
                nextState.errors = { [payload.field]: payload.message }
            } else if (payload.message) {
                nextState.error = payload.message;
            } else {
                nextState.error = payload;
            }

            return nextState;

            break;



        ///

        case DICTIONARY + PROJECT + _SELECT:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                items: state.items.map(p => cloneProject(p))
            });

            for (let i = 0, l = nextState.items.length; i < l; i++) {
                if (nextState.items[i]._id === data.pid) {
                    nextState.selectedProject = cloneProject(nextState.items[i]);
                    break;
                }
            }

            return nextState;

            break;

        case PROJECT + DEVICE + SENSOR + _UPDATE:
            nextState = Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                newProject: Object.assign({}, state.newProject),
                items: state.items.map(p => cloneProject(p))
            });

            /*for (let i = 0, l = nextState.items.length; i < l; i++) {
                if (nextState.items[i]._id === data.pid) {
                    nextState.selectedProject = cloneProject(nextState.items[i]);
                    break;
                }
            }*/

            for (let i = 0, l = nextState.selectedProject.devices.length; i < l; i++) {
                for (let ii = 0, ll = nextState.selectedProject.devices[i].sensors.length; ii < ll; ii++) {
                    if (nextState.selectedProject.devices[i].sensors[ii]._id === data._id) {
                        nextState.selectedProject.devices[i].sensors[ii].editMode = true;
                    } else {
                        delete nextState.selectedProject.devices[i].sensors[ii].editMode
                    }
                }
            }

            return nextState;

            break;


        ////////////////
        case MODAL + _SHOW:
            if ('ADD_PROJECT' === data.modalType) {
                return Object.assign({}, state, {
                    isLoading: false,
                    error: false,
                    errors: {},
                    newProject: {
                        isOpen: true,
                        title: '',
                        files: []
                    },
                    selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : {
                        _id: null,
                        title: null,
                        img: null,
                        devices: []
                    },
                    items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
                });
            }

            if ('SENSOR_ADVANCED' === data.modalType) {
                return Object.assign({}, state, {
                    isLoading: false,
                    error: false,
                    errors: {},
                    items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : [],
                    deviceId: data.deviceId,
                    sensor: Object.assign({}, data.sensor, { registers: data.sensor.registers.map(r => r) }),
                    sensorAdvanced: true
                });
            }

            return state;

            break;

        case MODAL + _HIDE:
            if ('ADD_PROJECT' === data.modalType) {
                if (state.newProject.files[0]) window.URL.revokeObjectURL(state.newProject.files[0].preview);

                return Object.assign({}, state, {
                    isLoading: false,
                    error: false,
                    errors: {},
                    newProject: {
                        isOpen: false,
                        title: '',
                        files: []
                    },
                    selectedProject: state.selectedProject._id ? cloneProject(state.selectedProject) : {
                        _id: null,
                        title: null,
                        img: null,
                        devices: []
                    },
                    items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : []
                });
            }

            if ('SENSOR_ADVANCED' === data.modalType) {
                return Object.assign({}, state, {
                    isLoading: false,
                    error: false,
                    errors: {},
                    items: Array.isArray(state.items) && state.items.length ? state.items.map(p => cloneProject(p)) : [],
                    deviceId: null,
                    sensor: null,
                    sensorAdvanced: false
                });
            }

            return state;

            break;

        case INPUT_CHANGE:
            if (rest.componentName && ('addProject' === rest.componentName)) {
                nextState = Object.assign({}, state);
                for (let k in data) nextState.newProject[k] = data[k];

                return nextState;
            }

            return state;

            break;
    }
}