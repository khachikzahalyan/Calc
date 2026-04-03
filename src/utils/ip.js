// IPv4 Subnet Calculator Utilities
// All calculations done with bitwise operations, no external libraries

/**
 * Converts IPv4 address string to 32-bit integer
 * @param {string} ip - IP address (e.g., "192.168.1.1")
 * @returns {number} 32-bit integer representation
 */
export const ipToInt = (ip) => {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const num = parseInt(parts[i], 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    result = (result << 8) | num;
  }
  return result >>> 0; // Convert to unsigned 32-bit
};

/**
 * Converts 32-bit integer to IPv4 address string
 * @param {number} int - 32-bit integer
 * @returns {string} IP address (e.g., "192.168.1.1")
 */
export const intToIp = (int) => {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join('.');
};

/**
 * Converts CIDR prefix to subnet mask
 * @param {number} prefix - CIDR prefix (0-32)
 * @returns {number} Subnet mask as 32-bit integer
 */
export const prefixToMask = (prefix) => {
  if (prefix < 0 || prefix > 32) return null;
  if (prefix === 0) return 0;
  if (prefix === 32) return 0xffffffff;
  return (0xffffffff << (32 - prefix)) >>> 0;
};

/**
 * Converts subnet mask to CIDR prefix
 * @param {number} mask - Subnet mask as 32-bit integer
 * @returns {number} CIDR prefix (0-32)
 */
export const maskToPrefix = (mask) => {
  if (mask === 0) return 0;
  if (mask === 0xffffffff) return 32;

  let prefix = 0;
  let testBit = 0x80000000;

  while ((mask & testBit) === testBit && prefix < 32) {
    prefix++;
    testBit >>>= 1;
  }

  return prefix;
};

/**
 * Calculates network address
 * @param {number} ipInt - IP as integer
 * @param {number} mask - Subnet mask as integer
 * @returns {number} Network address as integer
 */
export const calculateNetwork = (ipInt, mask) => {
  return (ipInt & mask) >>> 0;
};

/**
 * Calculates broadcast address
 * @param {number} network - Network address as integer
 * @param {number} hostBits - Number of host bits
 * @returns {number} Broadcast address as integer
 */
export const calculateBroadcast = (network, hostBits) => {
  const hostMask = (Math.pow(2, hostBits) - 1) >>> 0;
  return (network | hostMask) >>> 0;
};

/**
 * Calculates total hosts in a subnet
 * @param {number} hostBits - Number of host bits
 * @returns {number} Total number of usable hosts
 */
export const calculateHosts = (hostBits) => {
  if (hostBits <= 0) return 0;
  return Math.pow(2, hostBits) - 2; // Exclude network and broadcast
};

/**
 * Calculates total IPs in a subnet
 * @param {number} hostBits - Number of host bits
 * @returns {number} Total number of IPs
 */
export const calculateTotalIps = (hostBits) => {
  return Math.pow(2, hostBits);
};

/**
 * Converts IP integer to binary string
 * @param {number} ipInt - IP as integer
 * @returns {string} Binary representation with dots (e.g., "11000000.10101000...")
 */
export const ipToBinary = (ipInt) => {
  const bytes = [
    ((ipInt >>> 24) & 0xff).toString(2).padStart(8, '0'),
    ((ipInt >>> 16) & 0xff).toString(2).padStart(8, '0'),
    ((ipInt >>> 8) & 0xff).toString(2).padStart(8, '0'),
    (ipInt & 0xff).toString(2).padStart(8, '0'),
  ];
  return bytes.join('.');
};

/**
 * Validates IPv4 address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid
 */
export const isValidIp = (ip) => {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
};

/**
 * Validates CIDR prefix
 * @param {number} prefix - CIDR prefix
 * @returns {boolean} True if valid
 */
export const isValidPrefix = (prefix) => {
  const num = parseInt(prefix, 10);
  return !isNaN(num) && num >= 0 && num <= 32;
};

/**
 * Calculates required prefix for a given number of hosts
 * @param {number} requiredHosts - Number of required hosts
 * @returns {number} Prefix bits needed for hosts (returns -1 if impossible)
 */
export const calculatePrefixForHosts = (requiredHosts) => {
  if (requiredHosts < 1) return -1;

  // We need at least 2 host bits (for network and broadcast)
  for (let hostBits = 1; hostBits <= 30; hostBits++) {
    const availableHosts = Math.pow(2, hostBits) - 2;
    if (availableHosts >= requiredHosts) {
      return 32 - hostBits;
    }
  }
  return -1;
};

/**
 * Calculates required prefix bits for a given number of subnets
 * @param {number} subnets - Number of subnets needed
 * @returns {number} Number of bits needed
 */
export const calculateBitsForSubnets = (subnets) => {
  if (subnets < 1) return 0;
  if (subnets === 1) return 0;

  // Find minimum bits needed: 2^bits >= subnets
  return Math.ceil(Math.log2(subnets));
};

/**
 * Generates subnets from a base network
 * @param {number} baseNetwork - Base network address as integer
 * @param {number} basePrefix - Original prefix
 * @param {number} newPrefix - New subnet prefix
 * @returns {Array} Array of subnet objects
 */
export const generateSubnets = (baseNetwork, basePrefix, newPrefix) => {
  if (newPrefix <= basePrefix) return [];

  const subnetBits = newPrefix - basePrefix;
  const increment = Math.pow(2, 32 - newPrefix);
  const subnetCount = Math.pow(2, subnetBits);
  const mask = prefixToMask(newPrefix);
  const maskBinary = ipToBinary(mask);

  const subnets = [];
  for (let i = 0; i < subnetCount; i++) {
    const network = (baseNetwork + i * increment) >>> 0;
    const broadcast = calculateBroadcast(network, 32 - newPrefix);

    subnets.push({
      index: i,
      network: intToIp(network),
      networkInt: network,
      broadcast: intToIp(broadcast),
      broadcastInt: broadcast,
      firstIp: intToIp((network + 1) >>> 0),
      lastIp: intToIp((broadcast - 1) >>> 0),
      prefix: newPrefix,
      mask: intToIp(mask),
      maskBinary: maskBinary,
      totalIps: calculateTotalIps(32 - newPrefix),
      usableHosts: calculateHosts(32 - newPrefix),
    });
  }

  return subnets;
};

/**
 * Performs complete subnet calculation
 * @param {string} ip - IP address
 * @param {number} prefix - CIDR prefix
 * @param {number} [numSubnets] - Number of subnets (optional)
 * @param {number} [hostsPerSubnet] - Hosts per subnet (optional)
 * @returns {object} Calculation result with all information
 */
export const calculateSubnet = (ip, prefix, numSubnets = null, hostsPerSubnet = null) => {
  // Validate inputs
  if (!isValidIp(ip)) {
    return { error: 'error.invalidIpAddress' };
  }

  const prefixNum = parseInt(prefix, 10);
  if (!isValidPrefix(prefixNum)) {
    return { error: 'error.invalidPrefix' };
  }

  const ipInt = ipToInt(ip);
  const mask = prefixToMask(prefixNum);
  const network = calculateNetwork(ipInt, mask);
  const hostBits = 32 - prefixNum;
  const broadcast = calculateBroadcast(network, hostBits);

  const result = {
    error: null,
    ip,
    prefix: prefixNum,
    ipInt,
    mask: intToIp(mask),
    maskInt: mask,
    maskBinary: ipToBinary(mask),
    network: intToIp(network),
    networkInt: network,
    broadcast: intToIp(broadcast),
    broadcastInt: broadcast,
    firstUsableIp: hostBits === 31 ? intToIp(network) : intToIp((network + 1) >>> 0),
    lastUsableIp: hostBits === 31 ? intToIp(broadcast) : intToIp((broadcast - 1) >>> 0),
    totalIps: calculateTotalIps(hostBits),
    usableHosts: calculateHosts(hostBits),
    hostBits,
    ipBinary: ipToBinary(ipInt),
  };

  // Handle subnetting
  let subnets = [];
  let newPrefix = prefixNum;

  if (numSubnets && numSubnets > 1) {
    const bitsNeeded = calculateBitsForSubnets(numSubnets);
    newPrefix = prefixNum + bitsNeeded;

    if (newPrefix > 32) {
      return {
        ...result,
        error: `Cannot create ${numSubnets} subnets - would exceed /32`,
      };
    }

    subnets = generateSubnets(network, prefixNum, newPrefix);
    result.subnets = subnets;
    result.newPrefix = newPrefix;
    result.subnetBitsUsed = bitsNeeded;
    result.subnetCount = subnets.length;
  } else if (hostsPerSubnet && hostsPerSubnet > 0) {
    newPrefix = calculatePrefixForHosts(hostsPerSubnet);

    if (newPrefix < 0 || newPrefix < prefixNum) {
      return {
        ...result,
        error: `Cannot fit ${hostsPerSubnet} hosts per subnet with prefix /${prefixNum}`,
      };
    }

    const bitsNeeded = newPrefix - prefixNum;
    subnets = generateSubnets(network, prefixNum, newPrefix);
    result.subnets = subnets;
    result.newPrefix = newPrefix;
    result.subnetBitsUsed = bitsNeeded;
    result.subnetCount = subnets.length;
  }

  return result;
};
