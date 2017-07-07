'use strict';

export default {
    /*'Unsigned char': {
        bits: 8,
        min: 0,
        max: 255
    },
    'Signed char': {
        bits: 8,
        min: -128,
        max: 127
    },*/
    'Unsigned short': {
        bits: 16,
        min: 0,
        max: 65535
    },
    'Signed short': {
        bits: 16,
        min: -32768,
        max: 32767
    },
    'Unsigned int': {
        bits: 32,
        min: 0,
        max: 4294967295
    },
    'Signed int': {
        bits: 32,
        min: -2147483648,
        max: 2147483647
    },
    'Float': {
        bits: 32,
        min: -3.4028E+38,
        max: 3.4028E+38
    },
    'Double': {
        bits: 64,
        min: -1.7977E+308,
        max: 1.7977E+308
    }
};