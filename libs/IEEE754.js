'use strict';

module.exports = {
    /*'Unsigned char': {
        bits: 8,
        min: 0,
        max: 255,
        decFormat: 'Integer',
        parse: function (modbusResponse) { // FIXME: парсинг рабочий 50 на 50
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getUint8(0);
        }
    },
    'Signed char': {
        bits: 8,
        min: -128,
        max: 127,
        decFormat: 'Integer',
        parse: function (modbusResponse) { // FIXME: парсинг рабочий 50 на 50
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;
            let buffer          = new ArrayBuffer(this.bits / 8);
            let view            = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getInt8(0);
        }
    },*/
    'Unsigned short': {
        bits: 16,
        min: 0,
        max: 65535,
        decFormat: 'Integer',
        parse: function (modbusResponse) {
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;
            let buffer          = new ArrayBuffer(this.bits / 8);
            let view            = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getUint16(0);
        },
        toBytesArray: function (value) {
            let u16     = new Uint16Array(1);
                u16[0]  = value;
            let bytes   = new Uint8Array(u16.buffer);

            bytes.reverse();

            return bytes;
        }
    },
    'Signed short': {
        bits: 16,
        min: -32768,
        max: 32767,
        decFormat: 'Integer',
        parse: function (modbusResponse) {
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getInt16(0);
        },
        toBytesArray: function (value) {
            let u16     = new Uint16Array(1);
                u16[0]  = value;
            let bytes   = new Uint8Array(u16.buffer);

            bytes.reverse();

            return bytes;
        }
    },
    'Unsigned int': {
        bits: 32,
        min: 0,
        max: 4294967295,
        decFormat: 'Integer',
        parse: function (modbusResponse) { // FIXME: парсинг рабочий 50 на 50
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getUint32(0);

            // 'node'
            // let arr = new Float32Array(bytes);
            // return Buffer.from(arr).readUInt32BE();
        },
        toBytesArray: function (value) {
            let f32     = new Float32Array(1);
                f32[0]  = value;
            let bytes   = new Uint8Array(f32.buffer);
            bytes.reverse();

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            return bytes;
        }
    },
    'Signed int': {
        bits: 32,
        min: -2147483648,
        max: 2147483647,
        decFormat: 'Integer',
        parse: function (modbusResponse) { // FIXME: парсинг рабочий 50 на 50
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getInt32(0);

            // 'node'
            // let arr = new Float32Array(bytes);
            // return Buffer.from(arr).readInt32BE();
        },
        toBytesArray: function (value) {
            let f32     = new Float32Array(1);
                f32[0]  = value;
            let bytes   = new Uint8Array(f32.buffer);
            bytes.reverse();

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            return bytes;
        }
    },
    'Float': {
        bits: 32,
        min: -3.4028E+38,
        max: 3.4028E+38,
        decFormat: 'Real number',
        parse: function (modbusResponse) {
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getFloat32(0);

            // 'node'
            // let arr = new Float32Array(bytes);
            // return Buffer.from(arr).readFloatBE();
        },
        toBytesArray: function (value) {
            let f32     = new Float32Array(1);
                f32[0]  = value;
            let bytes   = new Uint8Array(f32.buffer);
                bytes.reverse();

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            return bytes;
        }
    },
    'Double': {
        bits: 64,
        min: -1.7977E+308,
        max: 1.7977E+308,
        decFormat: 'Real number',
        parse: function (modbusResponse) {
            let responseParsed  = JSON.parse(JSON.stringify(modbusResponse));
            let bytes           = responseParsed.payload.data;

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            let buffer  = new ArrayBuffer(this.bits / 8);
            let view    = new DataView(buffer);

            bytes.forEach((b, i) => { view.setUint8(i, b); });

            return view.getFloat64(0);

            // 'node'
            // return Buffer.from(new Float64Array(bytes)).readDoubleBE();
        },
        toBytesArray: function (value) {
            let f64     = new Float64Array(1);
                f64[0]  = value;
            let bytes   = new Uint8Array(f64.buffer);
                bytes.reverse();

            for (let i = 0, l = bytes.length; i < l - 1; i += 2) {
                let tmp      = bytes[i];
                bytes[i]     = bytes[i + 1];
                bytes[i + 1] = tmp;
            }

            return bytes;
        }
    }
};