'use strict';

const util = require('util');
const { sprintf } = require('sprintf-js');

const MINUTE = 60;
const HOUR = 60 * MINUTE;

function getTimeLeftStr(secs) {
    if (secs == Infinity) {
        return "--:--:--"
    }

    const h = Math.floor(secs / HOUR);
    const m = Math.floor((secs % HOUR) / MINUTE);
    const s = secs % MINUTE;
    return sprintf('%02d:%02d:%02d', h, m, s);
}

function getProgress(status) {
    // Calc progress raio for each chunk
    const prog = status.chunks.map((chunk) => {
        return sprintf('%3d%%', Math.floor(chunk.downloaded*100 / chunk.size));
    });

    // Calc time left
    const elapsedSec = Math.floor((Date.now() - status.startAt) / 1000);
    let timeLeft = Infinity;
    if (status.downloaded > 0) {
        timeLeft = Math.floor((status.size / status.downloaded - 1) * elapsedSec);
    }

    process.stdout.write(
        util.format('Progress: [%s] - %s\r', prog.join(' '), getTimeLeftStr(timeLeft))
    );
}

exports.getTimeLeftStr = getTimeLeftStr;
exports.getProgress = getProgress;
