# VLSM Implementation - Technical Deep Dive

## 🏗️ Architecture Overview

```
SubnetCalculator Component
    ↓
┌─────────────────────────────┐
│  Input Parser               │
│  - Validate IP, Prefix      │
│  - Parse host requirements  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Mode Selector              │
│  - Standard or VLSM         │
│  - Route to appropriate     │
│    calculation function     │
└──────────────┬──────────────┘
               ↓
         ┌─────┴──────┐
         ↓            ↓
    ┌────────┐   ┌─────────┐
    │Standard│   │  VLSM   │
    │Engine  │   │ Engine  │
    └────┬───┘   └────┬────┘
         │            │
         └─────┬──────┘
              ↓
    ┌─────────────────────────┐
    │  Result Display         │
    │  - Format results       │
    │  - Show summary         │
    │  - Display tables       │
    └─────────────────────────┘
```

## 🔧 Core Algorithms

### 1. IP to Integer Conversion

**Purpose:** Convert dotted-quad notation to 32-bit integer

```javascript
// Input:  "192.168.1.1"
// Output: 3232235777 (unsigned 32-bit)

export const ipToInt = (ip) => {
  const parts = ip.split('.');
  let result = 0;
  
  for (let i = 0; i < 4; i++) {
    const num = parseInt(parts[i], 10);
    // Shift left by 8 bits and add next octet
    result = (result << 8) | num;
  }
  
  return result >>> 0; // Unsigned 32-bit conversion
};

// How it works:
// "192.168.1.1"
// parts = ["192", "168", "1", "1"]
// 
// i=0: result = 0 << 8 | 192 = 192
// i=1: result = 192 << 8 | 168 = 49320
// i=2: result = 49320 << 8 | 1 = 12615681
// i=3: result = 12615681 << 8 | 1 = 3232235777
```

### 2. Integer to IP Conversion

**Purpose:** Convert 32-bit integer back to dotted-quad notation

```javascript
// Input:  3232235777
// Output: "192.168.1.1"

export const intToIp = (int) => {
  return [
    (int >>> 24) & 0xff,    // Shift right 24, mask last 8 bits
    (int >>> 16) & 0xff,    // Shift right 16, mask last 8 bits
    (int >>> 8) & 0xff,     // Shift right 8,  mask last 8 bits
    int & 0xff,             // Mask last 8 bits
  ].join('.');
};

// How it works:
// int = 3232235777 = 0xC0A80101
// 
// (3232235777 >>> 24) & 0xff = 0xC0 = 192
// (3232235777 >>> 16) & 0xff = 0xA8 = 168
// (3232235777 >>> 8)  & 0xff = 0x01 = 1
// (3232235777)        & 0xff = 0x01 = 1
```

### 3. CIDR Prefix to Subnet Mask

**Purpose:** Convert /24 to 255.255.255.0

```javascript
// Input:  24 (CIDR prefix)
// Output: 0xFFFFFF00 (255.255.255.0)

export const prefixToMask = (prefix) => {
  if (prefix === 0) return 0;
  if (prefix === 32) return 0xffffffff;
  
  // Create mask with 'prefix' bits set to 1
  // (0xffffffff << (32 - prefix)) shifts left
  // >>> 0 converts to unsigned 32-bit
  return (0xffffffff << (32 - prefix)) >>> 0;
};

// How it works:
// prefix = 24
// 0xffffffff = 11111111111111111111111111111111
// 32 - 24 = 8
// 0xffffffff << 8 = 11111111111111111111111100000000
// This equals 0xFFFFFF00 = 255.255.255.0
//
// Verification:
// 255 = 11111111
// 255 = 11111111
// 255 = 11111111
// 0   = 00000000
```

### 4. Calculate Network Address

**Purpose:** Get network address using bitwise AND

```javascript
// Input:  IP = 192.168.1.100, Mask = 255.255.255.0
// Output: 192.168.1.0

export const calculateNetwork = (ipInt, mask) => {
  // Bitwise AND isolates network portion
  return (ipInt & mask) >>> 0;
};

// How it works:
// IP:   192.168.1.100 = 11000000.10101000.00000001.01100100
// Mask: 255.255.255.0 = 11111111.11111111.11111111.00000000
// AND:  11000000.10101000.00000001.00000000
//       = 192.168.1.0
```

### 5. Calculate Broadcast Address

**Purpose:** Get broadcast address using bitwise OR

```javascript
// Input:  Network = 192.168.1.0, HostBits = 8
// Output: 192.168.1.255

export const calculateBroadcast = (network, hostBits) => {
  // Create host mask with all 1 bits
  const hostMask = (Math.pow(2, hostBits) - 1) >>> 0;
  
  // Bitwise OR sets all host bits to 1
  return (network | hostMask) >>> 0;
};

// How it works:
// network = 192.168.1.0 = 11000000.10101000.00000001.00000000
// hostBits = 8
// hostMask = 2^8 - 1 = 256 - 1 = 255 = 00000000.00000000.00000000.11111111
// OR:       11000000.10101000.00000001.11111111
//         = 192.168.1.255
```

### 6. Get Next Power of Two

**Purpose:** Find smallest power of 2 >= n

```javascript
// Critical for VLSM: block sizes must be powers of 2

export const getNextPowerOfTwo = (n) => {
  if (n <= 0) return 1;
  
  // If already a power of 2, return as-is
  if ((n & (n - 1)) === 0) return n;
  
  // Otherwise, find next power of 2
  let power = 1;
  while (power < n) {
    power *= 2;  // Equivalent to power <<= 1
  }
  return power;
};

// Examples:
// n=5:   not power of 2 → return 8 = 2^3
// n=9:   not power of 2 → return 16 = 2^4
// n=16:  already 2^4    → return 16
// n=33:  not power of 2 → return 64 = 2^6

// Bitwise check explained:
// For any power of 2 (n = 2^k):
//   n =     0001 0000
//   n-1 =   0000 1111
//   n & (n-1) = 0000 0000 ← Always 0 for power of 2
```

## 🧮 VLSM Algorithm (Step-by-Step)

### Complete VLSM Calculation Function

```javascript
export const calculateVLSM = (baseIp, basePrefix, hostRequirements) => {
  // ═══════════════════════════════════════════════════════
  // STEP 1: INPUT VALIDATION
  // ═══════════════════════════════════════════════════════
  
  if (!isValidIp(baseIp)) {
    return { error: 'Invalid base IP address' };
  }
  
  const basePrefixNum = parseInt(basePrefix, 10);
  if (!isValidPrefix(basePrefixNum)) {
    return { error: 'Invalid base prefix (use 0-32)' };
  }
  
  // Parse host requirements (can be string/array/number)
  const requirements = Array.isArray(hostRequirements)
    ? hostRequirements
    : parseHostRequirements(hostRequirements);
  
  if (requirements.error) return requirements;
  
  // ═══════════════════════════════════════════════════════
  // STEP 2: CALCULATE BASE NETWORK CAPACITY
  // ═══════════════════════════════════════════════════════
  
  const baseIpInt = ipToInt(baseIp);
  const baseMask = prefixToMask(basePrefixNum);
  const baseNetwork = calculateNetwork(baseIpInt, baseMask);
  const baseHostBits = 32 - basePrefixNum;
  const baseTotalIps = calculateTotalIps(baseHostBits);  // 2^hostBits
  
  // Example:
  // baseIp = "10.0.0.0"
  // basePrefix = 24
  // baseNetwork = 10.0.0.0
  // baseTotalIps = 2^(32-24) = 2^8 = 256
  
  // ═══════════════════════════════════════════════════════
  // STEP 3: VALIDATE TOTAL CAPACITY
  // ═══════════════════════════════════════════════════════
  
  const totalRequiredIps = requirements.reduce((sum, hosts) => {
    const prefixInfo = calculatePrefixForHostCount(hosts);
    return sum + prefixInfo.blockSize;
  }, 0);
  
  if (totalRequiredIps > baseTotalIps) {
    return {
      error: `Total required IPs (${totalRequiredIps}) exceed base network capacity (${baseTotalIps})`,
    };
  }
  
  // ═══════════════════════════════════════════════════════
  // STEP 4: SORT REQUIREMENTS (LARGEST FIRST)
  // ═══════════════════════════════════════════════════════
  
  const sortedRequirements = requirements
    .map((hosts, originalIndex) => ({ hosts, originalIndex }))
    .sort((a, b) => b.hosts - a.hosts);  // Descending order
  
  // Why sort descending?
  // Allocating largest first:
  // 1. Minimizes fragmentation
  // 2. Maximizes efficiency
  // 3. Reduces wasted IPs
  
  // ═══════════════════════════════════════════════════════
  // STEP 5: ALLOCATE SUBNETS SEQUENTIALLY
  // ═══════════════════════════════════════════════════════
  
  const subnets = [];
  let currentNetworkInt = baseNetwork;  // Start from base network
  
  for (const req of sortedRequirements) {
    const { hosts, originalIndex } = req;
    
    // ─────────────────────────────────────────────────
    // 5.1: Calculate prefix for this host requirement
    // ─────────────────────────────────────────────────
    
    const prefixInfo = calculatePrefixForHostCount(hosts);
    // Example: hosts=9 → blockSize=16 → prefix=/28
    
    const subnetPrefix = prefixInfo.prefix;
    const blockSize = prefixInfo.blockSize;
    const subnetHostBits = 32 - subnetPrefix;
    const subnetMask = prefixToMask(subnetPrefix);
    
    // ─────────────────────────────────────────────────
    // 5.2: Calculate network & broadcast for this subnet
    // ─────────────────────────────────────────────────
    
    const network = currentNetworkInt;
    const broadcast = calculateBroadcast(network, subnetHostBits);
    
    // ─────────────────────────────────────────────────
    // 5.3: Calculate usable IP range
    // ─────────────────────────────────────────────────
    
    let firstUsableIp, lastUsableIp, usableHosts;
    
    if (subnetHostBits >= 2) {
      // Standard case: network + hosts + broadcast
      firstUsableIp = (network + 1) >>> 0;
      lastUsableIp = (broadcast - 1) >>> 0;
      usableHosts = blockSize - 2;
    } else if (subnetHostBits === 1) {
      // /31: Point-to-point (RFC 3021)
      // No network/broadcast distinction
      firstUsableIp = network;
      lastUsableIp = broadcast;
      usableHosts = 2;
    } else {
      // /32: Single host
      firstUsableIp = network;
      lastUsableIp = network;
      usableHosts = 1;
    }
    
    // ─────────────────────────────────────────────────
    // 5.4: Store subnet information
    // ─────────────────────────────────────────────────
    
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
    
    // ─────────────────────────────────────────────────
    // 5.5: Move pointer to next available network
    // ─────────────────────────────────────────────────
    
    // Next subnet starts immediately after broadcast
    currentNetworkInt = (broadcast + 1) >>> 0;
  }
  
  // ═══════════════════════════════════════════════════════
  // STEP 6: CALCULATE STATISTICS & RETURN RESULTS
  // ═══════════════════════════════════════════════════════
  
  const totalAllocatedIps = subnets.reduce(
    (sum, subnet) => sum + subnet.blockSize,
    0
  );
  
  const remainingIps = baseTotalIps - totalAllocatedIps;
  const efficiency = ((totalAllocatedIps / baseTotalIps) * 100).toFixed(2);
  
  // Sort back to original input order for display
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
    remainingIps,
    allocationEfficiency: efficiency,
  };
};
```

### calculatePrefixForHostCount() - Helper Function

```javascript
export const calculatePrefixForHostCount = (requiredHosts) => {
  if (requiredHosts < 1) {
    return { error: 'At least 1 host required' };
  }
  
  // ═══════════════════════════════════════════════════════
  // Calculate block size (must be power of 2)
  // ═══════════════════════════════════════════════════════
  
  // We need: 1 network address + hosts + 1 broadcast address
  const requiredIPs = requiredHosts + 2;
  const blockSize = getNextPowerOfTwo(requiredIPs);
  
  // Examples:
  // requiredHosts=9  → requiredIPs=11 → blockSize=16 (2^4)
  // requiredHosts=1  → requiredIPs=3  → blockSize=4 (2^2)
  // requiredHosts=25 → requiredIPs=27 → blockSize=32 (2^5)
  
  // ═══════════════════════════════════════════════════════
  // Calculate host bits (exponent of block size)
  // ═══════════════════════════════════════════════════════
  
  const hostBits = Math.log2(blockSize);
  // blockSize=16 → log2(16)=4 → 4 host bits
  // blockSize=4  → log2(4)=2  → 2 host bits
  // blockSize=32 → log2(32)=5 → 5 host bits
  
  // ═══════════════════════════════════════════════════════
  // Calculate prefix (network bits)
  // ═══════════════════════════════════════════════════════
  
  const prefix = 32 - hostBits;
  // 32 - 4 = 28 → /28 for 9 hosts
  // 32 - 2 = 30 → /30 for 1 host
  // 32 - 5 = 27 → /27 for 25 hosts
  
  // ═══════════════════════════════════════════════════════
  // Calculate actual usable hosts
  // ═══════════════════════════════════════════════════════
  
  let actualUsableHosts = blockSize - 2;  // Standard case
  
  if (hostBits === 31) {
    actualUsableHosts = blockSize;  // /31 point-to-point
  } else if (hostBits === 32) {
    actualUsableHosts = 1;          // /32 single host
  }
  
  return {
    prefix,
    blockSize,
    actualUsableHosts,
    hostBits,
  };
};
```

## 📊 Complexity Analysis

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| ipToInt() | O(1) | Fixed 4 octets |
| intToIp() | O(1) | Fixed 4 octets |
| prefixToMask() | O(1) | Bitwise operations |
| calculateNetwork() | O(1) | Single bitwise AND |
| calculateBroadcast() | O(1) | Single bitwise OR |
| getNextPowerOfTwo() | O(1) | Fixed loop, ≤ 32 iterations |
| **calculateVLSM()** | **O(n log n)** | **Sort dominates** (n = # of requirements) |
| | | - Sort: O(n log n) |
| | | - Allocation loop: O(n) |
| | | - Each iteration: O(1) |

### Space Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| ipToInt() / intToIp() | O(1) | Constants variables |
| calculateVLSM() | O(n) | Subnets array has n elements |
| | | Each subnet: Fixed-size object |
| | | Total: ~200 bytes per subnet |

## 🔐 Bitwise Operations Used

### AND Operation (Network Address)
```
Network = IP & Mask

Example: 192.168.1.100 & 255.255.255.0 = 192.168.1.0

IP:     11000000.10101000.00000001.01100100
Mask:   11111111.11111111.11111111.00000000
Result: 11000000.10101000.00000001.00000000
        = 192.168.1.0
```

### OR Operation (Broadcast Address)
```
Broadcast = Network | HostMask

Example: 192.168.1.0 | 255 = 192.168.1.255

Network:  11000000.10101000.00000001.00000000
HostMask: 00000000.00000000.00000000.11111111
Result:   11000000.10101000.00000001.11111111
        = 192.168.1.255
```

### Left Shift (Multiply by 2)
```
value << n  ≡  value * 2^n

Example: 192 << 8 = 49152
192 = 11000000
192 << 8 = 1100000000000000 = 49152
```

### Right Shift (Divide by 2)
```
value >> n  ≡  value / 2^n

Example: 3232235777 >> 16 = 49320
This extracts the second and third octets
```

### Bitwise NOT (Invert All Bits)
```
~0xFFFFFF00 = 0x000000FF (host mask for /24)

0xFFFFFF00 = 11111111111111111111111100000000
~(above)   = 00000000000000000000000011111111 = 0xFF = 255
```

## 🧪 Unit Test Examples

```javascript
// Test 1: IP to Integer Conversion
test('ipToInt("192.168.1.1")', () => {
  expect(ipToInt("192.168.1.1")).toBe(3232235777);
  expect(ipToInt("10.0.0.0")).toBe(167772160);
  expect(ipToInt("255.255.255.255")).toBe(4294967295);
});

// Test 2: Integer to IP Conversion
test('intToIp(3232235777)', () => {
  expect(intToIp(3232235777)).toBe("192.168.1.1");
  expect(intToIp(167772160)).toBe("10.0.0.0");
});

// Test 3: Prefix to Mask
test('prefixToMask(24)', () => {
  expect(intToIp(prefixToMask(24))).toBe("255.255.255.0");
  expect(intToIp(prefixToMask(16))).toBe("255.255.0.0");
  expect(intToIp(prefixToMask(8))).toBe("255.0.0.0");
});

// Test 4: Network Calculation
test('calculateNetwork("10.0.0.0", /16)', () => {
  const ipInt = ipToInt("10.200.50.75");
  const mask = prefixToMask(16);
  const network = calculateNetwork(ipInt, mask);
  expect(intToIp(network)).toBe("10.200.0.0");
});

// Test 5: VLSM with [9, 1]
test('calculateVLSM("10.0.0.0/24", [9, 1])', () => {
  const result = calculateVLSM("10.0.0.0", "24", [9, 1]);
  
  expect(result.error).toBeNull();
  expect(result.subnets.length).toBe(2);
  
  // Subnet 1 (9 hosts)
  expect(result.subnets[0].prefix).toBe(28);
  expect(result.subnets[0].network).toBe("10.0.0.0");
  expect(result.subnets[0].blockSize).toBe(16);
  
  // Subnet 2 (1 host)
  expect(result.subnets[1].prefix).toBe(30);
  expect(result.subnets[1].network).toBe("10.0.0.16");
  expect(result.subnets[1].blockSize).toBe(4);
});
```

## 🎯 Performance Optimization

### Current Implementation
- ✅ Minimal allocations
- ✅ Bitwise operations (fastest)
- ✅ Single-pass allocation
- ✅ Efficient sorting

### Future Improvements
- Caching masks for repeated calculations
- Web Worker for large calculations
- Incremental rendering for huge networks

---

**All code is written to be clear, maintainable, and interview-ready.**
