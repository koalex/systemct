/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===    LIB FOR CHECK PATHS   ===
 ================================
 */

'use strict';

const pathToRegexp = require('path-to-regexp');
const paths     = [];
const ignores   = [];

module.exports = class PathListCheck {
    constructor () {
        this.ignore = {
            add: function (path) {
                if (path instanceof RegExp) {
                    ignores.push(path);
                } else if (typeof path == 'string') {
                    ignores.push(pathToRegexp(path));
                } else {
                    throw new Error('unsupported path type: ' + path);
                }
            },
            check: function (path) {
                for (let i = 0; i < ignores.length; i++) {
                    if (ignores[i].test(path)) {
                        return true;
                    }
                }
                return false;
            }
        }
    }

    get path () { return paths; }
    get ignores () { return ignores; }

    check (path) {
        for (let i = 0; i < paths.length; i++) {
            if (paths[i].test(path)) {
                return true;
            }
        }
        return false;
    }

    add (path) {
        if (path instanceof RegExp) {
            paths.push(path);
        } else if (typeof path == 'string') {
            paths.push(pathToRegexp(path));
        } else {
            throw new Error('unsupported path type: ' + path);
        }
    }
};
