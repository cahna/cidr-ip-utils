# cidr-ip-tools

![cidr-ip-utils](https://github.com/cahna/cidr-ip-utils/workflows/cidr-ip-utils/badge.svg)

Utilities for converting, sorting, and merging CIDR notation into IP ranges.

## API

See [`test/index.js`](https://github.com/cahna/cidr-ip-utils/blob/master/test/index.js) for more examples.

### `mergeCidrRanges(cidrStrings)`

Merge and sort a list of CIDR strings into a list of IPv4 ranges.

```javascript
import { mergeCidrRanges } from 'cidr-ip-tools';

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
```

### `ip4ToInt(ipString)`

Useful for comparing IP addresses.

```javascript
import { ip4ToInt } from 'cidr-ip-tools';

assert.equal(ip4ToInt('192.168.1.1'), 3232235777);
```

### `compareIp4(ipA, ipB)`

Comparator to sort IP strings with Array.sort().

```javascript
import { compareIp4 } from 'cidr-ip-tools';

const ips = [
  '127.0.0.1',
  '200.255.0.0',
  '10.0.0.3',
];
ips.sort(copmareIp4);

assert.deepEqual(ips, [
  '10.0.0.3',
  '127.0.0.1',
  '200.255.0.0',
]);
```

