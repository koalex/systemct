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

const modbus            = require('jsmodbus');
const Project           = require('../handlers/dictionaries/models/project');
const ProjectDataLog    = require('../handlers/dictionaries/models/projectDataLog'); // все логи
const ProjectData       = require('../handlers/dictionaries/models/projectData'); // логи изменений
const IEEE754           = require('../libs/IEEE754');

require('../libs/mongoose');

const readTimeout  = 1000; // ms
let devicesClients = {};

async function service () {

    let projects = await Project.find({ active: true });


    if (!projects.length) return setTimeout(service, 1000);

    let promises = [];

    for (let i = 0, l = projects.length; i < l; i++) {

        if (!Array.isArray(projects[i].devices)) continue;

        promises.push(inProject(projects[i]));

    }

    try {
        await Promise.all(promises);
    } catch (err) {
        console.error(err);
    }

    setTimeout(service, 1000);
}

service();

async function inProject (project) {
    let pId         = project._id;
    let promises    = [];

    for (let i = 0, l = project.devices.length; i < l; i++) {
        promises.push(inDevice(pId, project.devices[i]));
    }

    await Promise.all(promises);
}

async function inDevice (projectId, device) {
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

    } else if (devicesClients[device._id].client && 'error' === devicesClients[device._id].client.getState()) {
        // TODO: if connection error ?
        // client.reconnect() ?
        devicesClients[device._id].client.close();
        devicesClients[device._id].client  = null;
        devicesClients[device._id].reading = false;
        setTimeout(service, readTimeout);
    } else if (['closed', 'ready', 'waiting'].some(v => v === devicesClients[device._id].client.getState())) {
        if (devicesClients[device._id].reading) return;

        if (!Array.isArray(device.sensors) || !device.sensors.length) return;

        for (let i = 0, l = device.sensors.length; i < l; i++) await inSensor(projectId, device._id, device.sensors[i]);

        devicesClients[device._id].reading = false;

    } else if (devicesClients[device._id].client && devicesClients[device._id].client.getState() === 'connect') {
        if (devicesClients[device._id].reading) return;

        if (!Array.isArray(device.sensors) || !device.sensors.length) return;

        for (let i = 0, l = device.sensors.length; i < l; i++) {
            await inSensor(projectId, device._id, device.sensors[i])
        }

        devicesClients[device._id].reading = false;
    }
}

async function inSensor (projectId, deviceId, sensor) {
    if (Array.isArray(sensor.registers) && sensor.registers.length) {

        devicesClients[deviceId].reading = true;

        for (let i = 0, l = sensor.registers.length; i < l; i++) {
            let r = sensor.registers[i];

            let response = await new Promise((resolve, reject) => {
                devicesClients[deviceId].client.readHoldingRegisters(r, IEEE754[sensor.dataType].bits / 16)
                    .then(resp => { resolve(IEEE754[sensor.dataType].parse(resp)); }, err => { resolve(); }); // FIXME: что делать если ошибка чтения регистра? Сейчас просто идём дальше.
            });

            if (!response) continue;

            if (sensor.history) {
                let lastData = await ProjectData.findOne({
                    p_id: projectId,
                    d_id: deviceId,
                    s_id: sensor._id
                }).sort({ dt: -1 });

                if (!lastData) {
                    let data = new ProjectData({
                        p_id: projectId,
                        d_id: deviceId,
                        s_id: sensor._id,
                        r: r,
                        r_v: response
                    });

                    await data.save();
                } else if ('дискретный' === sensor.type && lastData.r_v != response) {
                    let data = new ProjectData({
                        p_id: projectId,
                        d_id: deviceId,
                        s_id: sensor._id,
                        r: r,
                        r_v: response
                    });

                    await data.save();
                } else if ('числовой' === sensor.type && lastData.r_v != response) {
                    let lastDataApPositive = lastData.r_v + ((lastData.r_v / 100) * sensor.aperture);
                    let lastDataApNegative = lastData.r_v - ((lastData.r_v / 100) * sensor.aperture);

                    if (response > lastDataApPositive || response < lastDataApNegative) {
                        let data = new ProjectData({
                            p_id: projectId,
                            d_id: deviceId,
                            s_id: sensor._id,
                            r: r,
                            r_v: response
                        });

                        await data.save();
                    }
                }

            }

            let data = new ProjectDataLog({
                p_id: projectId,
                d_id: deviceId,
                s_id: sensor._id,
                r: r,
                r_v: response
            });

            await data.save();
        }

    }
}

