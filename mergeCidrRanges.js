const { Address4 } = require('ip-address');

function ipToInt(ipString) {
    return ipString.split('.')
        .map(str => parseInt(str))
        .map((octet, i) => (octet ? octet * Math.pow(256, 3 - i) : 0))
        .reduce((a, b) => (a + b));
}

function mergeCidrRanges(cidrStrings) {
    const ipRanges = cidrStrings
        .map(s => new Address4(s))
        .map(ip => ({
            start: ip.startAddress(),
            end: ip.endAddress(),
        }))
        .map(({ start, end }) => ({
            start,
            startInt: ipToInt(start.address),
            end,
            endInt: ipToInt(end.address),
        }));
    ipRanges.sort((a, b) => a.startInt - b.endInt);

    let previous = ipRanges[0];
    const merged = [previous];

    for (var current of ipRanges) {
        if (current.startInt <= previous.endInt + 1) {
            if (previous.endInt + 1 <= current.endInt) {
                previous.end = current.end;
                previous.endInt = current.endInt;
            }
        } else {
            merged.push(current);
            previous = current;
        }
    }

    return merged.map(({ start, end }) => ({ start: start.address, end: end.address }));
}

/**
 * Tests
 */
const assert = require('assert').strict;

assert.deepEqual(mergeCidrRanges(['0.0.0.0/8']), [
    { start: '0.0.0.0', end: '0.255.255.255' },
]);

assert.deepEqual(mergeCidrRanges(['10.0.0.0/8']), [
    { start: '10.0.0.0', end: '10.255.255.255' },
]);

assert.deepEqual(mergeCidrRanges(['255.255.255.255/32']), [
    { start: '255.255.255.255', end: '255.255.255.255' },
]);

assert.deepEqual(mergeCidrRanges([
    '0.0.0.0/8',
    '10.0.0.0/8',
]), [
    { start: '0.0.0.0', end: '0.255.255.255' },
    { start: '10.0.0.0', end: '10.255.255.255' },
]);

assert.deepEqual(mergeCidrRanges([
    '192.168.0.0/16',
    '127.0.0.0/8',
]), [
    { start: '127.0.0.0', end: '127.255.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
]);

assert.deepEqual(mergeCidrRanges([
    '10.0.0.3/32',
    '10.0.0.4/30',
    '10.0.0.8/29',
    '10.0.2.0/23',
    '0.0.0.0/16',
]), [
    { start: '0.0.0.0', end: '0.0.255.255' },
    { start: '10.0.0.3', end: '10.0.0.15' },
    { start: '10.0.2.0', end: '10.0.3.255' }
]);
