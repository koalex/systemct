/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===    LIB FOR CHECK PATHS   ===
 ================================
 */

'use strict';

const pathToRegexp = require('path-to-regexp');

module.exports = class PathListCheck {
    constructor () {
        this.paths = [];
    }

    get show () { return this.paths; }

    check (path) {
        for (let i = 0; i < this.paths.length; i++) {
            if (this.paths[i].test(path)) {
                return true;
            }
        }
        return false;
    }

    add (path) {
        if (path instanceof RegExp) {
            this.paths.push(path);
        } else if (typeof path == 'string') {
            this.paths.push(pathToRegexp(path));
        } else {
            throw new Error('unsupported path type: ' + path);
        }
    }
};
