'use strict';

'use strict';

global.__DEVELOPMENT__ = process.env.NODE_ENV === 'development';
global.__DEBUG__       = process.env.NODE_ENV === 'debug' || process.env.NODE_ENV === 'debugging';

const semver = require('semver');
if (semver.lt(semver.clean(process.versions.node), '7.9.0') || parseFloat(process.versions.v8) < 5.4) {
    /* jshint -W101 */
    console.log('\n*********************************************\n* Для запуска требуется Node.js v7.9 и выше *\n* Для запуска требуется V8 v5.4 и выше      *\n* Пожалуйста обновитесь.                    *\n*********************************************\n');
    process.exit();
}

const modbus        = require('jsmodbus');
const Project       = require('../handlers/dictionaries/models/project');
const ProjectData   = require('../handlers/dictionaries/models/projectData');
const IEEE754       = require('../libs/IEEE754');

require('../libs/mongoose');

const readTimeout  = 1000; // ms
let devicesClients = {};

async function service () {

    let projects = await Project.find({ active: true });


    if (!projects.length) {
        setTimeout(service, 1000);
        return;
    }

    for (let i = 0, l = projects.length; i < l; i++) {

        if (!Array.isArray(projects[i].devices)) continue;

        for (let ii = 0, ll = projects[i].devices.length; ii < ll; ii++) {
            let device = projects[i].devices[ii];
            if (!devicesClients[device._id]) devicesClients[device._id] = {};

            if (!devicesClients[device._id].client) {
                devicesClients[device._id].client = modbus.client.tcp.complete({
                    'host'              : device.ip,
                    'port'              : device.port,
                    'autoReconnect'     : false,
                    'reconnectTimeout'  : 500,
                    'timeout'           : 500,
                    'unitId'            : 1
                }).connect();

                if (!Array.isArray(device.sensors) || !device.sensors.length) continue;

                let promises = [];

                // devicesClients[device._id].client.on('error', err => {});
                devicesClients[device._id].client.on('connect', () => {
                    if (devicesClients[device._id].reading) return;

                    device.sensors.forEach(sensor => {
                        if (Array.isArray(sensor.registers) && sensor.registers.length) {

                            devicesClients[device._id].reading = true;

                            sensor.registers.forEach(r => {
                                promises.push(
                                    devicesClients[device._id].client.readHoldingRegisters(r, IEEE754[sensor.dataType].bits / 16)
                                        .then(resp => {
                                            let data = new ProjectData({
                                                p_id: projects[i]._id,
                                                d_id: device._id,
                                                s_id: sensor._id,
                                                r: r,
                                                r_v: IEEE754[sensor.dataType].parse(resp)
                                            });

                                            return data.save().then(
                                                () => true,
                                                err => true
                                            );
                                        },
                                        err => true)
                                )
                            });

                        }
                    });

                    Promise.all(promises).then(() => {
                        devicesClients[device._id].reading = false;
                        setTimeout(service, readTimeout);
                    }, () => {
                        devicesClients[device._id].reading = false;
                        setTimeout(service, readTimeout);
                    });

                });

            } else if (devicesClients[device._id].client && 'error' === devicesClients[device._id].client.getState()) {
                // TODO: if connection error ?
                // client.reconnect() ?
                devicesClients[device._id].client.close();
                devicesClients[device._id].client  = null;
                devicesClients[device._id].reading = false;
                setTimeout(service, readTimeout);
            } else if (['closed', 'ready', 'waiting'].some(v => v === devicesClients[device._id].client.getState())) {
                if (devicesClients[device._id].reading) continue;
                if (!Array.isArray(device.sensors) || !device.sensors.length) continue;
                let promises = [];

                device.sensors.forEach(sensor => {
                    if (Array.isArray(sensor.registers) && sensor.registers.length) {

                        devicesClients[device._id].reading = true;

                        sensor.registers.forEach(r => {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    devicesClients[device._id].client.readHoldingRegisters(r, IEEE754[sensor.dataType].bits / 16)
                                        .then(resp => {
                                                let data = new ProjectData({
                                                    p_id: projects[i]._id,
                                                    d_id: device._id,
                                                    s_id: sensor._id,
                                                    r: r,
                                                    r_v: IEEE754[sensor.dataType].parse(resp)
                                                });

                                                data.save().then(
                                                    () => {
                                                        resolve();
                                                    },
                                                    err => {
                                                        resolve();
                                                    }
                                                );
                                            },
                                            err => {
                                                resolve();
                                            })
                                })
                            )
                        });

                    }
                });

                Promise.all(promises).then(() => {
                    devicesClients[device._id].reading = false;
                    setTimeout(service, readTimeout);
                }, () => {
                    devicesClients[device._id].reading = false;
                    setTimeout(service, readTimeout);
                });
            } else if (devicesClients[device._id].client && devicesClients[device._id].client.getState() === 'connect') {
                if (devicesClients[device._id].reading) continue;
                if (!Array.isArray(device.sensors) || !device.sensors.length) continue;
                let promises = [];

                device.sensors.forEach(sensor => {
                    if (Array.isArray(sensor.registers) && sensor.registers.length) {

                        devicesClients[device._id].reading = true;

                        sensor.registers.forEach(r => {
                            promises.push(
                                new Promise((resolve, reject) => {
                                    devicesClients[device._id].client.readHoldingRegisters(r, IEEE754[sensor.dataType].bits / 16)
                                        .then(resp => {
                                                let data = new ProjectData({
                                                    p_id: projects[i]._id,
                                                    d_id: device._id,
                                                    s_id: sensor._id,
                                                    r: r,
                                                    r_v: IEEE754[sensor.dataType].parse(resp)
                                                });

                                                data.save().then(
                                                    () => {
                                                        resolve();
                                                    },
                                                    err => {
                                                        resolve();
                                                    }
                                                );
                                            },
                                            err => {
                                                resolve();
                                            })
                                })
                            )
                        });

                    }
                });

                Promise.all(promises).then(() => {
                    devicesClients[device._id].reading = false;
                    setTimeout(service, readTimeout);
                }, () => {
                    devicesClients[device._id].reading = false;
                    setTimeout(service, readTimeout);
                });
            } else {
                setTimeout(service, readTimeout);
            }
        }

    }

}

service();