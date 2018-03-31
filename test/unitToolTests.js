'use strict';

const tool = require('../lib/tool');
const url = require('url');
const assert = require('assert');
const sinon = require('sinon');

describe('Tool tests', function () {
    let sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('determinePortNumber', function () {
        it('default port for http', function () {
            const parsedUrl = url.parse('http://localhost');
            assert.strictEqual(tool.determinePortNumber(parsedUrl), 80);
        });
        it('default port for https', function () {
            const parsedUrl = url.parse('https://localhost');
            assert.strictEqual(tool.determinePortNumber(parsedUrl), 443);
        });
        it('Explicit port number', function () {
            const parsedUrl = url.parse('https://localhost:123');
            assert.strictEqual(tool.determinePortNumber(parsedUrl), 123);
        });
    });
});
