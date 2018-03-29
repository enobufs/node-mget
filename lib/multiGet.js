'use strict';

const { EventEmitter } = require('events');
const { URL } = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const util = require('util');
const path = require('path');
const _ = require('lodash');
const assert = require('assert');

class MultiGet extends EventEmitter {
    constructor(config) {
        super()
        this._config = _.defaults(config || config, {
            minChunkSize: 8*1024, // 8 KiB
            concurrency: 0        // auto (the number of CPUs)
        });

        if (!this._config.concurrency) {
            this._config.concurrency = require('os').cpus().length;
        }
    }

    getStatus() {
        return this._res;
    }

    start(url, output) {
        this._url = new URL(url);
        this._res = {
            url: url,
            output: output? output : path.basename(this._url.pathname),
            chunks: [],
            downloaded: 0,
            hadError: false,
            startAt: Date.now()
        };

        const cleanUp = () => {
            this._res.endAt = Date.now();

            if (this._fd) {
                fs.fsyncSync(this._fd);
                fs.closeSync(this._fd);
                delete this._fd; 
            }
        };

        return this._determineContentLength()
        .then(() => {
            // Define chunk size
            let offset = 0;
            let remaining = this._res.size;
            let chunkSize = Math.max(
                Math.floor(this._res.size / this._config.concurrency),
                this._config.minChunkSize);

            while(remaining > 0) {
                if (remaining >= chunkSize) {
                    remaining -= chunkSize;
                } else {
                    chunkSize = remaining;
                    remaining = 0;
                }
                this._res.chunks.push({
                    offset: offset,
                    size: chunkSize,
                    downloaded: 0
                });
                offset += chunkSize;
            }

            this._fd = fs.openSync(this._res.output, 'w');
            fs.ftruncateSync(this._fd, this._res.size);

            // Start concurrent downloads
            const promises = this._res.chunks.map((chunk, index) => {
                return this._download(chunk, index);
            });
            return Promise.all(promises);
        })
        .then(() => {
            cleanUp();
            return this._res;
        }, (err) => {
            cleanUp();
            throw err;
        });
    }

    _determineContentLength() {
        return new Promise((resolve, reject) => {
            const proto = (this._url.protocol === 'http:')? http : https;
            const options = {
                host: this._url.host,
                port: this._url.port? this._url.port : (this._url.protocol === 'http:')? 80 : 443,
                path: this._url.pathname,
                method: 'HEAD'
            };

            const req = proto.request(options, (res) => {
                const { statusCode } = res;

                if (statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`Requested failed. Status code: ${statusCode}`));
                }

                this._res.type = res.headers['content-type'],
                this._res.size = res.headers['content-length']
                return resolve();
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.end();
        });
    }

    _download(chunk, index) {
        chunk.startAt = Date.now();

        return new Promise((resolve, reject) => {
            const { spawn } = require('child_process');
            const range = `${chunk.offset}-${chunk.offset + chunk.size - 1}`;
            const args = ['-X', 'GET', '-r',  range, this._url.href];
            const child = spawn('curl', args, { encoding: 'binary' });

            child.stdout.on('data', (data) => {
                //const data = Buffer.from(str, 'binary');
                assert.ok(Buffer.isBuffer(data));
                try {
                    const written = fs.writeSync(this._fd, data, 0, data.length, chunk.offset + chunk.downloaded);
                    chunk.downloaded += written;
                    this._res.downloaded += written;
                    //console.log('[%d] received %d bytes, now %d bytes of %d bytes', index, data.length, chunk.downloaded, chunk.size);
                } catch (e) {
                    reject(e);
                }

                this.emit('progress', this._res, index);
            });
            child.stderr.on('data', (data) => { void(data); });
            child.on('close', (code) => {
                resolve(code);
            });
            child.on('exit', (code, signal) => {
                chunk.code = code;
                chunk.endAt = Date.now();
                if (signal) {
                    this._res.signal = signal;
                }
            });
            child.on('error', (err) => {
                chunk.error = err;
                this._res.hadError = true;
                reject(err);
            });
        });
    }
}

module.exports = MultiGet;
