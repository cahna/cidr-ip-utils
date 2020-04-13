import { Address4 } from 'ip-address';

export const ip4ToInt = ipString => ipString.split('.')
  .map(str => parseInt(str, 10))
  .map((octet, i) => (octet ? octet * 256 ** (3 - i) : 0))
  .reduce((a, b) => (a + b));

export const compareIp4 = (ipA, ipB) => ip4ToInt(ipA) - ip4ToInt(ipB);

export function mergeCidrToIp4(cidrStrings) {
  const ipRanges = cidrStrings
    .map(s => new Address4(s))
    .map(ip => ({
      start: ip.startAddress(),
      end: ip.endAddress(),
    }))
    .map(({ start, end }) => ({
      start,
      startInt: ip4ToInt(start.address),
      end,
      endInt: ip4ToInt(end.address),
    }));
  ipRanges.sort((a, b) => a.startInt - b.startInt);

  let previous = ipRanges[0];
  const merged = [previous];

  for (const current of ipRanges) {
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

  return merged.map(({ start, end }) => ({
    start: start.address,
    end: end.address,
  }));
}

