const ip = require('ip-address');

export function mergeCidrRanges(cidrStrings) {
    const ipRanges = cidrStrings
        .map(s => new ip.Address4(s))
        .map(ip => ({
            start: ip.startAddress(),
            end: ip.endAddress(),
        }));
    ipRanges.sort((a, b) => a.start.bigInteger()[0] - b.start.bigInteger()[0]);

    let previous = ipRanges[0];
    const merged = [previous];

    for (var current of ipRanges) {
        if (current.start.bigInteger()[0] <= previous.end.bigInteger()[0] + 1) {
            previous.end = previous.end.bigInteger()[0] + 1 >= current.end.bigInteger()[0]
                ? previous.end
                : current.end;
        } else {
            merged.push(current);
            previous = current;
        }
    }

    return merged.map(({ start, end }) => ({ start: start.address, end: end.address }));
}
