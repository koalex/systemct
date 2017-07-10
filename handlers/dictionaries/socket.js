/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ✰✰✰ ***/

/*
 ================================
 ===   DICTIONARIES SOCKET    ===
 ================================
 */

'use strict';

const modbus    = require('jsmodbus');
const IEEE754   = require('../../libs/IEEE754');
const url       = require('url');

let connectId;

module.exports = [
    async args => {
        const { nsp, socket, adapter, token } = args;

        let userSocketSessionIds = await adapter.session_ids(token);

        socket.on('READ_HOLDING_REGISTERS', data => {
            let connection  = url.parse(data.url, true);
            let client      = modbus.client.tcp.complete({
                'host'              : connection.hostname,
                'port'              : connection.port,
                'autoReconnect'     : false,
                'reconnectTimeout'  : 3000,
                'timeout'           : 3000,
                'unitId'            : 1
            });

            let promises = [];

            client.connect();

            let _connectId = Math.random().toString(34).slice(2);

            connectId = _connectId.substring();

            client.on('error', err => {
                if (_connectId != connectId) return;
                data.registers.forEach((r, i) => {
                    adapter.emitter.of('/api').to(socket.user.role).emit('READ_HOLDING_REGISTERS_ERROR', {
                        error: err,
                        deviceId: data.deviceId,
                        sensorId: data.sensorId,
                        register: r
                    })
                });
            });

            client.on('connect', () => {
                // client.getState() === connect
                // client.getState() === error
                data.registers.forEach(r => {
                    promises.push(
                        client.readHoldingRegisters(r, IEEE754[data.dataType].bits / 16)
                            .then(resp => {
                                userSocketSessionIds.forEach(s_id => {
                                    adapter.emitter.of('/api').to(s_id).emit('READ_HOLDING_REGISTERS_SUCCESS', {
                                        data: IEEE754[data.dataType].parse(resp),
                                        register: r,
                                        deviceId: data.deviceId,
                                        sensorId: data.sensorId
                                    });
                                });
                                // nsp.to('room').emit('some event');
                                // nsp.emit('hi', 'everyone!');
                                // nsp.volatile.emit('an event', { some: 'data' })
                                // nsp.local.emit('an event', { some: 'data' }); // (when the Redis adapter is used)
                                /*socket.emit('READ_HOLDING_REGISTERS_SUCCESS', {
                                    data: IEEE754[data.dataType].parse(resp),
                                    register: r,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId
                                });*/
                                /*nsp.to(socket.user.role).emit('READ_HOLDING_REGISTERS_SUCCESS', {
                                    data: IEEE754[data.dataType].parse(resp),
                                    register: r,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId
                                });*/
                                /*adapter.emitter.of('/api').to(socket.user.role).emit('READ_HOLDING_REGISTERS_SUCCESS', {
                                    data: IEEE754[data.dataType].parse(resp),
                                    register: r,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId
                                });*/

                            })
                            .catch(err => {
                                adapter.emitter.of('/api').to(socket.user.role).emit('READ_HOLDING_REGISTERS_ERROR', {
                                    error: err,
                                    message: err.message && err.message === 'Integer is unsafe' ? socket.i18n.__('INTEGER_UNSAFE') : null,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId,
                                    register: r
                                });
                            })
                    )
                });

                Promise.all(promises).then(() => { client.close();  }, () => { client.close();  })
            });

        });
    },

    async args => {
        const { nsp, socket, adapter, token } = args;

        let userSocketSessionIds = await adapter.session_ids(token);

        socket.on('WRITE_HOLDING_REGISTERS', data => {
            let connection  = url.parse(data.url, true);
            let client      = modbus.client.tcp.complete({
                'host'              : connection.hostname,
                'port'              : connection.port,
                'autoReconnect'     : true,
                'reconnectTimeout'  : 1000,
                'timeout'           : 5000,
                'unitId'            : 1
            });

            client.connect();
            let _connectId = Math.random().toString(34).slice(2);

            connectId = _connectId.substring();

            client.on('error', err => {
                if (_connectId != connectId) return;
                if (!Array.isArray(data.registers)) return;
                data.registers.forEach(r => {
                    userSocketSessionIds.forEach(s_id => {
                        adapter.emitter.of('/api').to(s_id).emit('WRITE_HOLDING_REGISTERS_ERROR', {
                            error: err,
                            deviceId: data.deviceId,
                            sensorId: data.sensorId,
                            r: r
                        })
                    });
                });
            });

            client.on('connect', () => {
                client.writeMultipleRegisters(data.r, Buffer.from(IEEE754[data.dataType].toBytesArray(data.v))).then(resp => {
                    return client.readHoldingRegisters(data.r, IEEE754[data.dataType].bits / 16)
                        .then(resp => {
                            userSocketSessionIds.forEach(s_id => {
                                adapter.emitter.of('/api').to(s_id).emit('READ_HOLDING_REGISTERS_SUCCESS', {
                                    data: IEEE754[data.dataType].parse(resp),
                                    register: data.r,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId
                                });
                            });
                            client.close();
                        })
                        .catch(err => {
                            userSocketSessionIds.forEach(s_id => {
                                adapter.emitter.of('/api').to(s_id).emit('READ_HOLDING_REGISTERS_ERROR', {
                                    error: err,
                                    message: err.message && err.message === 'Integer is unsafe' ? socket.i18n.__('INTEGER_UNSAFE') : null,
                                    deviceId: data.deviceId,
                                    sensorId: data.sensorId,
                                    register: data.r
                                })
                            });
                            client.close();
                        })
                }).then(() => {
                    userSocketSessionIds.forEach(s_id => {
                        adapter.emitter.of('/api').to(s_id).emit('WRITE_HOLDING_REGISTERS_SUCCESS', {
                            r: data.r
                        });
                    });
                    client.close();
                }).catch(err => {
                    userSocketSessionIds.forEach(s_id => {
                        adapter.emitter.of('/api').to(s_id).emit('WRITE_HOLDING_REGISTERS_ERROR', {
                            error: err,
                            r: data.r
                        });
                    });
                    client.close();
                })
            });
        });
    }
];