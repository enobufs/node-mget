'use strict';

const mget = require('..');
const { getProgress } = mget.tool;
const assert = require('assert');
const path = require('path');
const md5File = require('md5-file');

const samples = {
    File512MB: {
        url: 'http://ipv4.download.thinkbroadband.com/512MB.zip',
        md5: 'dfe6504e0e8283357a3443234b266246'
    },
    File5MB: {
        url: 'http://ipv4.download.thinkbroadband.com/5MB.zip',
        md5: 'b3215c06647bc550406a9c8ccc378756'
    }
};

const sampleUrl4 = 'http://ipv4.download.thinkbroadband.com/5MB.zip' // 5 MiB

describe('Integration tests', function () {
    describe('download', function () {
        it('5MB concurrency=1', function () {
            this.timeout(0);
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 1});
            m.on('progress', getProgress);

            return m.start(samples.File5MB.url, output)
            .then((res) => {
                const hash = md5File.sync(output);
                assert.strictEqual(hash, samples.File5MB.md5);
            });
        });
        it('5MB concurrency=4', function () {
            this.timeout(0);
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 4});
            m.on('progress', getProgress);

            return m.start(samples.File5MB.url, output)
            .then((res) => {
                const hash = md5File.sync(output);
                assert.strictEqual(hash, samples.File5MB.md5);
            });
        });
        it('5MB concurrency=8', function () {
            this.timeout(0);
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 8});
            m.on('progress', getProgress);

            return m.start(samples.File5MB.url, output)
            .then((res) => {
                const hash = md5File.sync(output);
                assert.strictEqual(hash, samples.File5MB.md5);
            });
        });
    });
});
