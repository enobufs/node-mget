'use strict';

const MultiGet = require('../lib/multiGet');
const assert = require('assert');
const sinon = require('sinon');

describe('MultiGet class tests', function () {
    let sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

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

    describe('#start', function () {
        it('default output', function () {
            const expOutput = 'myFile.zip';
            const testUrl = 'http://abc.com/foo/' + expOutput;
            sandbox.stub(MultiGet.prototype, '_determineContentLength').resolves();
            const mg = new MultiGet();
            return mg.start(testUrl)
            .then(() => {
                assert.equal(mg._res.output, expOutput);
            });
        })
    });
});
