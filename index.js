'use strict';

// Promise#finally
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(fn) {
        return this.then((res) => {
            return Promise.resolve()
            .then(() => {
                return fn();
            })
            .catch(() => {})
            .then(() => {
                return res;
            });
        }, (err) => {
            return Promise.resolve()
            .then(() => {
                return fn()
            })
            .then(() => { throw err; }, () => { throw err; });
        })
    }
}

const MultiGet = require('./lib/multiGet');

exports.create = function(config) {
    return new MultiGet(config);
}

exports.tool = require('./lib/tool');

