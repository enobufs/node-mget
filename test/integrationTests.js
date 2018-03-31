'use strict';

const mget = require('..');
const { getProgress } = mget.tool;
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const md5File = require('md5-file');
const http = require('http');
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const serve = serveStatic('test/data', {'index': ['index.html', 'index.htm']})

const samples = {
    File5B: {
        url: 'http://localhost:1337/5B.zip',
        md5: '295a4a2afbced1fb360d8b0e3395e99b'
    },
    File5MB: {
        url: 'http://localhost:1337/5MB.zip',
        md5: 'b3215c06647bc550406a9c8ccc378756'
    },
    File404: {
        url: 'http://localhost:1337/invalid.zip',
        md5: 'badbadbadbadbadbadbadbadbadbaaad'
    }
};

describe('Integration tests', function () {
    let server;

    before(function (done) {
        server = http.createServer(function onRequest (req, res) {
            serve(req, res, finalhandler(req, res))
        })
        server.listen(1337, done)
    });

    after(function () {
        server.close();
        server = null;
    });

    function verify(res, concurrency, sample) {
        const hash = md5File.sync(res.output);
        assert.strictEqual(hash, sample.md5);
        assert.equal(res.chunks.length, concurrency);
        assert.ok(!res.hadError);
        res.chunks.forEach((chunk) => {
            assert.strictEqual(chunk.downloaded, chunk.size);
            assert.strictEqual(chunk.code, 0);
            assert.ok(!chunk.error);
        });
    }

    describe('download', function () {
        it('5MB concurrency=1', function () {
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 1});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then((res) => {
                verify(res, 1, sample);
            });
        });
        it('5MB concurrency=4', function () {
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 4});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then((res) => {
                verify(res, 4, samples.File5MB);
            });
        });
        it('5MB concurrency=8', function () {
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 8});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then((res) => {
                verify(res, 8, sample);
            });
        });
        it('5B concurrency=1', function () {
            const sample = samples.File5B;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 1});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then((res) => {
                verify(res, 1, sample);
            });
        });
        it('5B concurrency=3', function () {
            const sample = samples.File5B;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 1});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then((res) => {
                verify(res, 1, sample);
            });
        });
    });

    describe('download error', function () {
        it('Fail with 404', function () {
            const sample = samples.File404;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 2});
            m.on('progress', getProgress);

            return m.start(sample.url, output)
            .then(() => {
                assert.fail("should have failed!");
            }, (err) => {
                console.log('Actual error:', err);
            })
        });

        it('Fail with file write', function () {
            // This test require more than one chunk to work correctly.
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 2});
            m.once('progress', function () {
                fs.closeSync(m._fd); // Close the fd on purpose
                m._fd = null;
            });

            return m.start(sample.url, output)
            .then(() => {
                assert.fail("should have failed!");
            }, (err) => {
                console.log('Actual error:', err);
            })
        });

        it('Fail with unexptected SIGTERM on a child', function () {
            // This test require more than one chunk to work correctly.
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 2});
            m.once('progress', function (res, childIdx) {
                const chunk = res.chunks[childIdx];
                console.log('sending SIGTERM to child %d', childIdx);
                chunk._child.kill('SIGTERM')
            });

            return m.start(sample.url, output)
            .then((res) => {
                console.log("RESULT:", res);
                assert.fail("should have failed!");
            }, (err) => {
                console.log('Actual error:', err);
                assert.ok(err.res.hadError);
            })
        });

        it('Fail with an fake error on a child', function () {
            // This test require more than one chunk to work correctly.
            const sample = samples.File5MB;
            const output = path.join(__dirname, './output');
            const m = mget.create({concurrency: 2});
            m.once('progress', function (res, childIdx) {
                const chunk = res.chunks[childIdx];
                chunk._child.emit('error', new Error('fake error'));
            });

            return m.start(sample.url, output)
            .then((res) => {
                console.log("RESULT:", res);
                assert.fail("should have failed!");
            }, (err) => {
                console.log('Actual error:', err);
                assert.ok(err.res.hadError);
            })
        });
    });
});
