export interface SeedKeyAlgorithm {
  id: string;
  name: string;
  description: string;
  calculate: (seed: string, secretKey?: string) => string;
}

// Helper to convert hex string to number
const hexToNum = (hex: string) => parseInt(hex.replace(/\s+/g, ''), 16);

// Helper to convert number to hex string (padded to byteCount)
const numToHex = (num: number, byteCount: number) => {
  let hex = num.toString(16).toUpperCase();
  while (hex.length < byteCount * 2) {
    hex = '0' + hex;
  }
  hex = hex.slice(-(byteCount * 2));
  // Add spaces between bytes
  return hex.match(/.{1,2}/g)?.join(' ') || hex;
};

export const ALGORITHMS: SeedKeyAlgorithm[] = [
  {
    id: 'gm_can_1',
    name: 'GM CAN (Algo 1)',
    description: 'Common 4-byte algorithm used in GM Gen IV engines (E38, E67)',
    calculate: (seedStr: string, secretKeyStr?: string) => {
      let seed = hexToNum(seedStr);
      const secret = secretKeyStr ? hexToNum(secretKeyStr) : 0x2711;
      
      // Simple 32-bit shift algorithm example (Mocked typical behavior)
      let key = (seed ^ secret) >>> 0;
      key = ((key << 5) | (key >>> 27)) >>> 0;
      key = (key + 0x12345678) >>> 0;
      
      return numToHex(key, 4);
    }
  },
  {
    id: 'gm_vpw',
    name: 'GM VPW (LS1/P01)',
    description: 'Common 2-byte algorithm for Gen III (P01/P59)',
    calculate: (seedStr: string) => {
      let seed = hexToNum(seedStr);
      if (seed === 0) return '00 00';
      
      const xorValue = 0x1234; // Common mask
      let key = (seed << 5) | (seed >> 11);
      key = (key ^ xorValue) & 0xFFFF;
      
      return numToHex(key, 2);
    }
  },
  {
    id: 'ford_can',
    name: 'Ford CAN (Standard)',
    description: 'Standard 3-byte seed/key algorithm for Ford CAN modules',
    calculate: (seedStr: string) => {
      let seed = hexToNum(seedStr);
      let key = ((seed & 0xFF0000) >> 16) | ((seed & 0x00FF00)) | ((seed & 0x0000FF) << 16);
      key = (key ^ 0x61A7C3) & 0xFFFFFF;
      return numToHex(key, 3);
    }
  },
  {
    id: 'vw_uds',
    name: 'VW UDS (SA2)',
    description: 'Security Access Level 2 for VW/Audi UDS modules',
    calculate: (seedStr: string) => {
      let seed = hexToNum(seedStr);
      let key = (seed * 0x1020304) >>> 0; // Simple multiplier example
      key = (key ^ 0x01020304) >>> 0;
      return numToHex(key, 4);
    }
  }
];
