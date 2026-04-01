// VLSM (Variable Length Subnet Mask) Calculator
// Implements RFC 3021 concepts for advanced subnetting

import {
  ipToInt,
  intToIp,
  prefixToMask,
  calculateNetwork,
  calculateBroadcast,
  calculateTotalIps,
  isValidIp,
  isValidPrefix,
} from './ip';

/**
 * Finds the next power of 2 greater than or equal to n
 * @param {number} n - Input number
 * @returns {number} Next power of 2
 */
export const getNextPowerOfTwo = (n) => {
  if (n <= 0) return 1;
  if ((n & (n - 1)) === 0) return n; // Already a power of 2
  
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
};

/**
 * Calculates prefix required for a specific number of hosts
 * @param {number} requiredHosts - Number of hosts needed
 * @returns {object} { prefix, blockSize, actualUsableHosts }
 */
export const calculatePrefixForHostCount = (requiredHosts) => {
  if (requiredHosts < 1) {
    return { error: 'At least 1 host required' };
  }

  // Need to account for network and broadcast addresses
  const requiredIPs = requiredHosts + 2;
  const blockSize = getNextPowerOfTwo(requiredIPs);
  
  // Calculate how many host bits are needed
  const hostBits = Math.log2(blockSize);
  const prefix = 32 - hostBits;
  
  // Calculate actual usable hosts
  let actualUsableHosts = blockSize - 2;
  
  // Special cases
  if (hostBits === 31) {
    actualUsableHosts = blockSize; // /31 point-to-point (RFC 3021)
  } else if (hostBits === 32) {
    actualUsableHosts = 1; // /32 single host
  }

  return {
    prefix,
    blockSize,
    actualUsableHosts,
    hostBits,
  };
};

/**
 * Parses host requirements from various input formats
 * @param {string|number|array} input - Input (can be "1 2 3", [1,2,3], 123, etc)
 * @returns {array} Array of host requirements or error
 */
export const parseHostRequirements = (input) => {
  let requirements = [];

  if (typeof input === 'string') {
    // Try space-separated: "1 2 3 4"
    if (input.includes(' ')) {
      requirements = input
        .split(' ')
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x > 0);
    }
    // Try comma-separated: "1,2,3,4"
    else if (input.includes(',')) {
      requirements = input
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x > 0);
    }
    // Try single number or array-like: "[1,2,3]"
    else {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num > 0) {
        requirements = [num];
      } else if (input.includes('[') || input.includes('{')) {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) {
            requirements = parsed
              .map((x) => parseInt(x, 10))
              .filter((x) => !isNaN(x) && x > 0);
          }
        } catch (e) {
          return { error: 'Invalid format. Use space/comma separated or JSON array.' };
        }
      }
    }
  } else if (Array.isArray(input)) {
    requirements = input
      .map((x) => parseInt(x, 10))
      .filter((x) => !isNaN(x) && x > 0);
  } else if (typeof input === 'number') {
    requirements = [input];
  }

  if (requirements.length === 0) {
    return { error: 'No valid host requirements found' };
  }

  return requirements;
};

/**
 * Calculates VLSM subnetting
 * @param {string} baseIp - Base IP address
 * @param {number} basePrefix - Base prefix
 * @param {array} hostRequirements - Array of required host counts
 * @returns {object} VLSM calculation result
 */
export const calculateVLSM = (baseIp, basePrefix, hostRequirements) => {
  // Validate inputs
  if (!isValidIp(baseIp)) {
    return { error: 'Invalid base IP address' };
  }

  const basePrefixNum = parseInt(basePrefix, 10);
  if (!isValidPrefix(basePrefixNum)) {
    return { error: 'Invalid base prefix (use 0-32)' };
  }

  // Parse host requirements
  const requirements = Array.isArray(hostRequirements)
    ? hostRequirements
    : parseHostRequirements(hostRequirements);

  if (requirements.error) {
    return requirements;
  }

  // Validate that requirements are positive
  if (!requirements.every((x) => x > 0)) {
    return { error: 'All host requirements must be positive' };
  }

  // Check if total hosts exceed base network capacity
  const baseIpInt = ipToInt(baseIp);
  const baseMask = prefixToMask(basePrefixNum);
  const baseNetwork = calculateNetwork(baseIpInt, baseMask);
  const baseHostBits = 32 - basePrefixNum;
  const baseTotalIps = calculateTotalIps(baseHostBits);

  const totalRequiredIps = requirements.reduce((sum, hosts) => {
    const prefixInfo = calculatePrefixForHostCount(hosts);
    return sum + prefixInfo.blockSize;
  }, 0);

  if (totalRequiredIps > baseTotalIps) {
    return {
      error: `Total required IPs (${totalRequiredIps}) exceed base network capacity (${baseTotalIps})`,
    };
  }

  // Sort requirements in descending order (biggest first)
  const sortedRequirements = requirements
    .map((hosts, originalIndex) => ({ hosts, originalIndex }))
    .sort((a, b) => b.hosts - a.hosts);

  // Calculate subnets
  const subnets = [];
  let currentNetworkInt = baseNetwork;
  let totalAllocatedIps = 0;

  for (const req of sortedRequirements) {
    const { hosts, originalIndex } = req;

    // Calculate prefix for this host requirement
    const prefixInfo = calculatePrefixForHostCount(hosts);
    const subnetPrefix = prefixInfo.prefix;
    const blockSize = prefixInfo.blockSize;
    const subnetHostBits = 32 - subnetPrefix;
    const subnetMask = prefixToMask(subnetPrefix);

    // Ensure network is properly aligned
    const network = currentNetworkInt;
    const broadcast = calculateBroadcast(network, subnetHostBits);

    // Calculate usable IPs
    let firstUsableIp, lastUsableIp, usableHosts;
    
    if (subnetHostBits >= 2) {
      firstUsableIp = (network + 1) >>> 0;
      lastUsableIp = (broadcast - 1) >>> 0;
      usableHosts = blockSize - 2;
    } else if (subnetHostBits === 1) {
      // /31 point-to-point (RFC 3021)
      firstUsableIp = network;
      lastUsableIp = broadcast;
      usableHosts = 2;
    } else {
      // /32 single host
      firstUsableIp = network;
      lastUsableIp = network;
      usableHosts = 1;
    }

    subnets.push({
      index: originalIndex,
      order: subnets.length,
      requiredHosts: hosts,
      allocatedHosts: usableHosts,
      blockSize,
      prefix: subnetPrefix,
      subnetMask: intToIp(subnetMask),
      network: intToIp(network),
      networkInt: network,
      broadcast: intToIp(broadcast),
      broadcastInt: broadcast,
      firstUsableIp: intToIp(firstUsableIp),
      firstUsableIpInt: firstUsableIp,
      lastUsableIp: intToIp(lastUsableIp),
      lastUsableIpInt: lastUsableIp,
      totalIps: blockSize,
      usableHosts,
    });

    // Move to next network
    currentNetworkInt = (broadcast + 1) >>> 0;
    totalAllocatedIps += blockSize;

    // Check if we've run out of space
    if (currentNetworkInt > (baseNetwork + baseTotalIps - 1)) {
      break; // Would exceed base network
    }
  }

  // Sort back by original index for display
  subnets.sort((a, b) => a.index - b.index);

  return {
    error: null,
    baseIp,
    basePrefix: basePrefixNum,
    baseMask: intToIp(baseMask),
    baseNetwork: intToIp(baseNetwork),
    baseNetworkInt: baseNetwork,
    baseTotalIps,
    hostRequirements: requirements,
    originalOrder: sortedRequirements.map((r) => r.hosts),
    subnets,
    totalAllocatedIps,
    remainingIps: baseTotalIps - totalAllocatedIps,
    allocationEfficiency: ((totalAllocatedIps / baseTotalIps) * 100).toFixed(2),
  };
};

/**
 * Generates step-by-step explanation of VLSM calculation
 * @param {array} hostRequirements - Original host requirements
 * @returns {array} Step-by-step explanations
 */
export const generateVLSMExplanation = (hostRequirements) => {
  const steps = [];

  steps.push({
    step: 1,
    title: 'Parse Input',
    description: `Input: ${Array.isArray(hostRequirements) ? hostRequirements.join(', ') : hostRequirements}`,
  });

  steps.push({
    step: 2,
    title: 'Sort Descending',
    description: `Rearrange from largest to smallest to minimize waste`,
  });

  const sorted = Array.isArray(hostRequirements)
    ? [...hostRequirements].sort((a, b) => b - a)
    : hostRequirements;

  steps.push({
    step: 3,
    title: 'Calculate Block Sizes',
    description: `For each requirement, find next power of 2 including network + broadcast`,
  });

  if (Array.isArray(sorted)) {
    sorted.forEach((hosts) => {
      const blockSize = getNextPowerOfTwo(hosts + 2);
      const hostBits = Math.log2(blockSize);
      const prefix = 32 - hostBits;
      steps.push({
        step: `3.${sorted.indexOf(hosts) + 1}`,
        title: `Hosts: ${hosts}`,
        description: `Block size: ${blockSize} IPs → ${hostBits} host bits = /${prefix}`,
      });
    });
  }

  steps.push({
    step: 4,
    title: 'Allocate Sequentially',
    description: `Assign largest subnet first, continue from next available IP`,
  });

  steps.push({
    step: 5,
    title: 'Calculate Per Subnet',
    description: `For each: network, broadcast, first/last usable IPs`,
  });

  return steps;
};
