'use strict';

const MultiGet = require('../lib/multiGet');
const assert = require('assert');

describe('MultiGet class tests', function () {
    describe('constructor', function () {
        it('default config', function () {
            const mg = new MultiGet();
            assert.strictEqual(mg._config.minChunkSize, 8*1024);
            assert.strictEqual(mg._config.concurrency, require('os').cpus().length);
        });
        it('config.concurrency', function () {
            const mg = new MultiGet({concurrency: 4});
            assert.strictEqual(mg._config.concurrency, 4);
        });
    });
});
