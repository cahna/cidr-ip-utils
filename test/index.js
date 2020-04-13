import { expect } from 'chai';
import { mergeCidrToIp4, compareIp4, ip4ToInt } from '../src/index';

describe('ip4ToInt', () => {
  [
    { input: '0.0.0.0', expected: 0 },
    { input: '192.168.1.1', expected: 3232235777 },
    { input: '255.255.255.255', expected: 4294967295 },
  ].forEach(({ input, expected }) => {
    it(`converts ip string to int: ${input}`, () => {
      expect(ip4ToInt(input)).equals(expected);
    });
  });
});

describe('compareIp4', () => {
  [
    {
      input: ['127.0.0.1'],
      expected: ['127.0.0.1'],
    },
    {
      input: ['1.2.3.4', '10.10.10.1', '0.0.0.0','255.255.255.255', '10.10.9.9'],
      expected: ['0.0.0.0', '1.2.3.4', '10.10.9.9', '10.10.10.1', '255.255.255.255'],
    },
  ].forEach(({ input, expected }, index) => {
    it(`sorts ip array [${index}]`, () => {
      const inputCopy = [...input];
      inputCopy.sort(compareIp4);
      expect(inputCopy).to.deep.equal(expected);
    });
  });
});

describe('mergeCidrToIp4', () => {
  describe('one input range', () => {
    [
      {
        input: ['0.0.0.0/0'],
        expected: [{ start: '0.0.0.0', end: '255.255.255.255' }],
      },
      {
        input: ['1.2.3.4/0'],
        expected: [{ start: '0.0.0.0', end: '255.255.255.255' }],
      },
      {
        input: ['0.0.0.0/8'],
        expected: [{ start: '0.0.0.0', end: '0.255.255.255' }],
      },
      {
        input: ['192.168.1.50/32'],
        expected: [{ start: '192.168.1.50', end: '192.168.1.50' }],
      },
    ].forEach(({ input, expected }) => {
      it(`returns expected start/end for: ${input}`, () => {
        expect(mergeCidrToIp4(input)).to.deep.equal(expected);
      });
    });
  });

  describe('multiple input ranges', () => {
    describe('non-overlapping', () => {
      [
        {
          input: [
            '0.0.0.0/8',
            '10.0.0.0/8',
          ],
          expected: [
            { start: '0.0.0.0', end: '0.255.255.255' },
            { start: '10.0.0.0', end: '10.255.255.255' },
          ],
        },
        {
          input: [
            '10.0.0.3/32',
            '100.64.0.0/10',
            '208.0.0.0/7',
          ],
          expected: [
            { start: '10.0.0.3', end: '10.0.0.3' },
            { start: '100.64.0.0', end: '100.127.255.255' },
            { start: '208.0.0.0', end: '209.255.255.255' },
          ],
        },
      ].forEach(({ input, expected }, index) => {
        it(`returns expected ip ranges [${index}]`, () => {
          expect(mergeCidrToIp4(input)).to.deep.equal(expected);
        });
      });

      it('sorts the returned ip ranges', () => {
        expect(mergeCidrToIp4([
          '192.168.0.0/16',
          '203.0.113.0/24',
          '127.0.0.0/8',
        ])).to.deep.equal([
          { start: '127.0.0.0', end: '127.255.255.255' },
          { start: '192.168.0.0', end: '192.168.255.255' },
          { start: '203.0.113.0', end: '203.0.113.255' },
        ]);
      });
    });

    describe('overlapping', () => {
      [
        {
          input: [
            '10.0.0.3/32',
            '10.0.0.4/30',
            '10.0.0.8/29',
            '10.0.2.0/23',
            '0.0.0.0/16',
          ],
          expected: [
            { start: '0.0.0.0', end: '0.0.255.255' },
            { start: '10.0.0.3', end: '10.0.0.15' },
            { start: '10.0.2.0', end: '10.0.3.255' }
          ],
        },
        {
          input: [
            '0.0.0.0/8',
            '10.0.0.0/8',
            '100.64.0.0/10',
            '127.0.0.0/8',
            '169.254.0.0/16',
            '172.16.0.0/12',
            '192.0.0.0/24',
            '192.0.2.0/24',
            '192.88.99.0/24',
            '192.168.0.0/16',
            '198.18.0.0/15',
            '198.51.100.0/24',
            '203.0.113.0/24',
            '224.0.0.0/4',
            '240.0.0.0/4',
            '255.255.255.255/32',
          ],
          expected: [
            { start: '0.0.0.0', end: '0.255.255.255' },
            { start: '10.0.0.0', end: '10.255.255.255' },
            { start: '100.64.0.0', end: '100.127.255.255' },
            { start: '127.0.0.0', end: '127.255.255.255' },
            { start: '169.254.0.0', end: '169.254.255.255' },
            { start: '172.16.0.0', end: '172.31.255.255' },
            { start: '192.0.0.0', end: '192.0.0.255' },
            { start: '192.0.2.0', end: '192.0.2.255' },
            { start: '192.88.99.0', end: '192.88.99.255' },
            { start: '192.168.0.0', end: '192.168.255.255' },
            { start: '198.18.0.0', end: '198.19.255.255' },
            { start: '198.51.100.0', end: '198.51.100.255' },
            { start: '203.0.113.0', end: '203.0.113.255' },
            { start: '224.0.0.0', end: '255.255.255.255' }
          ],
        },
        {
          input: [
            '224.0.0.0/4',
            '10.0.0.3/32',
            '172.16.0.0/12',
            '10.0.2.0/0',
            '10.0.0.4/30',
            '10.0.0.8/29',
          ],
          expected: [
            { start: '0.0.0.0', end: '255.255.255.255' },
          ],
        },
        {
          input: [
            '0.0.0.0/32',
            '172.16.0.0/12',
            '10.0.2.0/0',
            '0.0.0.0/0',
          ],
          expected: [
            { start: '0.0.0.0', end: '255.255.255.255' },
          ],
        },
      ].forEach(({ input, expected }, index) => {
        it(`returns sorted & merged ip ranges [${index}]`, () => {
          expect(mergeCidrToIp4(input)).to.deep.equal(expected);
        });
      });
    });
  });
});

