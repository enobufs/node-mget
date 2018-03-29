'use strict';

const MultiGet = require('./lib/multiGet');

exports.create = function(config) {
    return new MultiGet(config);
}

exports.tool = require('./lib/tool');

