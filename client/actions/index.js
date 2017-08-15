'use strict';

import {
    AUTH,
    _IMPORT,
    _EXPORT,
    _CHECK,
    SIGNOUT,
    MODAL,
    _SHOW,
    _HIDE,
    _CHANGE,
    _SELECT,
    SIGNIN, USERS, DICTIONARY, UGO, SENSOR, DEVICE, PROJECT, _READ, _CREATE, _UPDATE, _DELETE, INPUT_CHANGE } from './constants';

export function dispatch (data) {
    const { type, ...rest } = data;

    let action =  { type };

    for (let k in rest) action[k] = rest[k];

    return action;
}

export function inputChange (data) {
    const { componentName } = data;
    delete data.componentName;
    return {
        type: INPUT_CHANGE,
        data: data,
        componentName
    }
}

export function authCheck () {
    return {
        type: AUTH + _CHECK,
        CALL_API: {
            endpoint: '/api/me',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    }
}

export function signout () {
    return {
        type: AUTH + SIGNOUT,
        CALL_API: {
            endpoint: '/api/signout',
            method: 'POST',
            headers: {
                'Content-Type': null,
                'Accept': null
            }
        }
    }
}

export function signinSubmit (credentials) {
    return {
        type: AUTH + SIGNIN,
        data: credentials,
        CALL_API: {
            endpoint: '/signin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    }
}

export function usersCreate (user, opts = {}) {
    return {
        type: USERS + _CREATE,
        data: { user },
        skipSuccess: opts.skipSuccess,
        CALL_API: {
            endpoint: '/api/users',
            method: 'POST'
        }
    }
}

export function usersRead () {
    return {
        type: USERS + _READ,
        CALL_API: {
            endpoint: '/api/users',
            method: 'GET'
        },

    }
}

export function usersUpdate (user, opts = {}) {
    return {
        type: USERS + _UPDATE,
        data: { user },
        skipSuccess: opts.skipSuccess,
        CALL_API: {
            endpoint: '/api/users/' + user._id,
            method: 'PUT'
        },

    }
}

export function usersDelete (userId) {
    return {
        type: USERS + _DELETE,
        data: { userId },
        CALL_API: {
            endpoint: '/api/users/' + userId,
            method: 'DELETE'
        },

    }
}

export function dictionaryCreate (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _CREATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                },

            };

        break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _CREATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _CREATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                },

            };

            break;

        case 'project':
            return {
                type: DICTIONARY + PROJECT + _CREATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                },

            };

            break;
    }

}

export function dictionaryRead (dictionary) {
    switch (dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _READ,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo',
                    method: 'GET'
                },

            };

            break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _READ,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors',
                    method: 'GET'
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _READ,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices',
                    method: 'GET'
                },

            };

            break;

        case 'project':
            return {
                type: DICTIONARY + PROJECT + _READ,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects',
                    method: 'GET'
                },

            };

            break;

    }

}

export function dictionaryUpdate (data) {

    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _UPDATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/' + data.ugoId,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'PUT'
                },

            };

            break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _UPDATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors/' + data.sensorId,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'PUT'
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _UPDATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices/' + data.deviceId,
                    headers: {
                        'Content-Type': data.body && Array.isArray(data.body.files) && data.body.files.length  ? 'multipart/form-data' : 'application/json',
                    },
                    method: 'PUT'
                },

            };

            break;

        case 'project':
            return {
                type: DICTIONARY + PROJECT + _UPDATE,
                data: data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects/' + data.projectId,
                    headers: {
                        'Content-Type': data.body && Array.isArray(data.body.files) && data.body.files.length  ? 'multipart/form-data' : 'application/json',
                    },
                    method: 'PUT'
                },

            };

            break;

    }
}

export function projectDeviceSensorEdit (sensor) {
    return {
        type: PROJECT + DEVICE + SENSOR + _UPDATE,
        data: sensor
    }
}

export function dictionaryDelete (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _DELETE,
                data: { ugoId: data.ugoId },
                // skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/' + data.ugoId,
                    method: 'DELETE'
                },

            };

            break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _DELETE,
                data: { sensorId: data.sensorId },
                // skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors/' + data.sensorId,
                    method: 'DELETE'
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _DELETE,
                data: { deviceId: data.deviceId },
                // skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices/' + data.deviceId,
                    method: 'DELETE'
                },

            };

            break;

        case 'project':
            return {
                type: DICTIONARY + PROJECT + _DELETE,
                data: { projectId: data.projectId },
                skipSuccess: true,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects/' + data.projectId,
                    method: 'DELETE'
                },

            };

            break;

    }
}

export function dictionaryProjectSelect (pid) {
    return {
        type: DICTIONARY + PROJECT + _SELECT,
        data: { pid },
    };
}

export function dictionaryExport (dictionary, filename) {
    switch (dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _EXPORT,
                filename: filename,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/export',
                    method: 'GET'
                },

            };

            break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _EXPORT,
                filename: filename,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors/export',
                    method: 'GET'
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _EXPORT,
                filename: filename,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices/export',
                    method: 'GET'
                },

            };

            break;

        case 'projects':
            return {
                type: DICTIONARY + PROJECT + _EXPORT,
                filename: filename,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects/export',
                    method: 'GET'
                },

            };

            break;
    }
}

export function dictionaryImport (data) {
    switch (data.dictionary) {
        case 'ugo':
            return {
                type: DICTIONARY + UGO + _IMPORT,
                data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/ugo/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'POST'
                },

            };

            break;

        case 'sensor':
            return {
                type: DICTIONARY + SENSOR + _IMPORT,
                data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/sensors/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'POST'
                },

            };

            break;

        case 'device':
            return {
                type: DICTIONARY + DEVICE + _IMPORT,
                data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/devices/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'POST'
                },

            };

            break;

        case 'projects':
            return {
                type: DICTIONARY + PROJECT + _IMPORT,
                data,
                skipSuccess: data.skipSuccess,
                CALL_API: {
                    endpoint: '/api/dictionaries/projects/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    method: 'POST'
                },

            };

            break;
    }
}

export function setCurrentDevice (deviceId) {
    return {
        type: DEVICE + _CHANGE,
        data: deviceId
    }
}

export function addDeviceSensor (sensor) { // FIXME: emove
    return {
        type: DEVICE + SENSOR + _CREATE,
        data: sensor
    }
}

export function deviceSensorEdit (sensor) {
    return {
        type: DEVICE + SENSOR + _UPDATE,
        data: sensor
    }
}

export function deviceSensorDelete (sensor) {
    return {
        type: DEVICE + SENSOR + _DELETE,
        data: sensor
    }
}

export function modalShow (data) {
    return {
        type: MODAL + _SHOW,
        data
    }
}

export function modalHide (data) {
    return {
        type: MODAL + _HIDE,
        data
    }
}