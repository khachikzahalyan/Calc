# VLSM (Variable Length Subnet Mask) Calculator - Complete Guide

## 📌 Overview

This advanced IPv4 Subnet Calculator now supports both **Standard Subnetting** and **VLSM (Variable Length Subnet Mask)** calculations. VLSM allows for subnets of different sizes within the same network, optimizing IP address allocation and reducing waste.

## 🎯 Key Features

### 1. **Standard Subnetting**
- Divide a network into equal-sized subnets
- Two modes:
  - By subnet count (e.g., divide into 3 subnets)
  - By hosts per subnet (e.g., each subnet needs 250 hosts)
- Automatically calculates the required prefix

### 2. **VLSM (Variable Length Subnet Mask)**
- Allocate subnets with **different sizes** based on specific host requirements
- Optimizes IP address usage
- Minimizes wasted IP addresses
- Subnets can have /28, /30, /22, etc. within the same network

## 🔧 VLSM Algorithm Explained

### Step-by-Step Process

```
Input: Base Network: 10.0.0.0/24, Host Requirements: [9, 1]

1. Parse Requirements
   Input: [9, 1]

2. Sort in Descending Order
   Sorted: [9, 1]
   (Largest first to minimize waste)

3. Calculate Block Sizes
   - For 9 hosts: Need 2^4 = 16 IPs (includes network + broadcast)
     Prefix: 32 - 4 = /28
   
   - For 1 host: Need 2^2 = 4 IPs
     Prefix: 32 - 2 = /30

4. Allocate Sequentially
   - Subnet 1 (Req: 9, Size: /28)
     Network: 10.0.0.0
     Broadcast: 10.0.0.15
     First IP: 10.0.0.1
     Last IP: 10.0.0.14
     Usable: 14 hosts

   - Subnet 2 (Req: 1, Size: /30)
     Network: 10.0.0.16    (right after Subnet 1)
     Broadcast: 10.0.0.19
     First IP: 10.0.0.17
     Last IP: 10.0.0.18
     Usable: 2 hosts

5. Summary
   Total IPs used: 20 out of 256
   Efficiency: 7.81%
   Remaining: 236 IPs
```

### Key Concepts

#### Block Size Calculation
```
Block size must be a power of 2 and include:
- 1 Network address
- Required hosts
- 1 Broadcast address

Formula:
Block size = 2^n, where n is the smallest integer
such that 2^n >= (required_hosts + 2)
```

#### Prefix Calculation
```
Prefix = 32 - log₂(block_size)

Example:
Block size: 16 = 2^4
Prefix: 32 - 4 = /28

Block size: 4 = 2^2
Prefix: 32 - 2 = /30
```

#### Sequential Allocation
```
Each subnet starts immediately after the previous one's broadcast:

Subnet 1: 10.0.0.0 to 10.0.0.15
Subnet 2: 10.0.0.16 to 10.0.0.31   (starts at broadcast + 1)
Subnet 3: 10.0.0.32 to 10.0.0.47
```

## 📊 Real-World VLSM Examples

### Example 1: Small Office Network

**Requirements:**
- Main office: 27 hosts
- Branch office: 6 hosts
- Point-to-point link: 2 hosts

**Base Network:** 172.16.0.0/22 (1024 IPs)

**VLSM Allocation:**
```
1. Sort descending: [27, 6, 2]

2. Main Office (27 hosts)
   - Block size: 32 = 2^5
   - Prefix: /27
   - Network: 172.16.0.0/27
   - IPs: 172.16.0.1 - 172.16.0.30 (30 usable)

3. Branch Office (6 hosts)
   - Block size: 8 = 2^3
   - Prefix: /29
   - Network: 172.16.0.32/29
   - IPs: 172.16.0.33 - 172.16.0.38 (6 usable)

4. Point-to-Point (2 hosts)
   - Block size: 4 = 2^2
   - Prefix: /30
   - Network: 172.16.0.40/30
   - IPs: 172.16.0.41 - 172.16.0.42 (2 usable)

Total used: 72 IPs
Total capacity: 1024 IPs
Efficiency: 7.03%
Utilization: Very efficient allocation!
```

### Example 2: Data Center Network

**Requirements:**
- Database servers: 120 hosts
- Web servers: 50 hosts
- Cache servers: 20 hosts
- Management: 10 hosts

**Base Network:** 192.168.0.0/21 (2048 IPs)

**VLSM Allocation:**
```
1. Sort descending: [120, 50, 20, 10]

2. Database (120 hosts)
   - Block size: 128 = 2^7
   - Prefix: /25
   - Network: 192.168.0.0/25
   - Usable: 126 IPs

3. Web Servers (50 hosts)
   - Block size: 64 = 2^6
   - Prefix: /26
   - Network: 192.168.0.128/26
   - Usable: 62 IPs

4. Cache (20 hosts)
   - Block size: 32 = 2^5
   - Prefix: /27
   - Network: 192.168.0.192/27
   - Usable: 30 IPs

5. Management (10 hosts)
   - Block size: 16 = 2^4
   - Prefix: /28
   - Network: 192.168.0.224/28
   - Usable: 14 IPs

Total used: 232 IPs
Efficiency: 11.32%
```

## 🧮 Using the Calculator

### Standard Subnetting

1. Enter Base IP: `172.16.0.0`
2. Select "Standard Subnetting" mode
3. Enter Base Prefix: `/20`
4. Choose subnetting option:
   - **By Number of Subnets:** Enter `3`
     - Calculator determines: New prefix = /22 (needs 2 bits)
     - Creates 4 equal subnets
   
   - **By Hosts per Subnet:** Enter `250`
     - Calculator determines: Requires /22 (512 IPs per subnet)

### VLSM Mode

1. Enter Base IP: `10.0.0.0`
2. Select "VLSM" mode
3. Enter Base Prefix: `/24`
4. Enter Host Requirements in one of these formats:
   - Space-separated: `9 1` or `10 5 2 1`
   - Comma-separated: `9, 1` or `10, 5, 2, 1`
   - JSON array: `[9, 1]`
   - Single number: `9` (creates one subnet)

5. Click "Calculate"

### Output Display

The calculator shows:
- **Base Network Information**
  - Network address and prefix
  - Subnet mask
  - Total IPs capacity

- **VLSM Allocation Details**
  - Each subnet's requirements and allocation
  - Prefix for each subnet
  - Network, broadcast, first/last usable IPs
  - Number of usable hosts

- **Efficiency Summary**
  - Total IPs used
  - Allocation efficiency percentage
  - Remaining unallocated IPs

## ⚠️ Validation & Error Handling

The calculator validates:

1. **IP Address Format**
   - Must be valid IPv4 (e.g., 10.0.0.0)
   - Each octet: 0-255

2. **CIDR Prefix**
   - Range: 0-32
   - /24 = 256 IPs
   - /30 = 4 IPs

3. **Host Requirements**
   - Each must be ≥ 1
   - Total IPs cannot exceed base network capacity
   - Proper format (space or comma separated)

4. **Error Messages**
   - Clear, actionable error messages
   - Explains what went wrong
   - Suggests corrections

## 🧪 Test Cases

### Test 1: VLSM with 10.0.0.0/24 and [9, 1]

**Input:**
- Base IP: 10.0.0.0
- Prefix: /24
- Host Requirements: 9 1

**Expected Output:**
```
Subnet 1 (9 hosts):
- Prefix: /28 (block size 16)
- Network: 10.0.0.0
- Usable IPs: 10.0.0.1 - 10.0.0.14

Subnet 2 (1 host):
- Prefix: /30 (block size 4)
- Network: 10.0.0.16
- Usable IPs: 10.0.0.17 - 10.0.0.18

Efficiency: 7.81% (20 IPs used out of 256)
```

### Test 2: VLSM with 192.168.0.0/22 and [25, 10, 5]

**Input:**
- Base IP: 192.168.0.0
- Prefix: /22
- Host Requirements: 25 10 5

**Expected Output:**
```
Subnet 1 (25 hosts):
- Prefix: /27 (block size 32)
- Network: 192.168.0.0
- Usable IPs: 30

Subnet 2 (10 hosts):
- Prefix: /28 (block size 16)
- Network: 192.168.0.32
- Usable IPs: 14

Subnet 3 (5 hosts):
- Prefix: /29 (block size 8)
- Network: 192.168.0.48
- Usable IPs: 6

Total: 50 IPs used out of 1024
Efficiency: 4.88%
```

### Test 3: Standard Subnetting with 172.16.0.0/20 and 3 subnets

**Input:**
- Base IP: 172.16.0.0
- Prefix: /20
- Mode: By Number of Subnets
- Count: 3

**Expected Output:**
```
New Prefix: /22 (need 2 bits for 4 subnets)
Number of Subnets: 4

Subnet 0: 172.16.0.0/22 - 172.16.3.255
Subnet 1: 172.16.4.0/22 - 172.16.7.255
Subnet 2: 172.16.8.0/22 - 172.16.11.255
Subnet 3: 172.16.12.0/22 - 172.16.15.255

Each subnet: 1024 IPs, 1022 usable hosts
```

## 📚 Network Engineering Concepts

### Why VLSM Matters

1. **IP Efficiency**
   - Reduces wasted IP addresses
   - Maximizes network capacity utilization
   - Critical for large deployments

2. **Network Design**
   - Allows flexible subnetting
   - Matches subnet size to actual requirements
   - Supports hierarchical network design

3. **Routing**
   - Works with CIDR notation (classless routing)
   - Requires routers that support VLSM
   - Modern networks use VLSM extensively

### RFC Standards

- **RFC 2550** - IP Network Design Principles
- **RFC 3021** - Point-to-Point Links with /31 Prefixes
- **RFC 4632** - Classless Inter-domain Routing (CIDR)

### Special Cases

#### /31 Prefixes (Point-to-Point Links)
- Typically reserved for host-to-host links
- 2 usable IP addresses (RFC 3021)
- No network/broadcast distinction
- Common in router-to-router connections

#### /32 Prefixes (Host Routes)
- Single IP address
- Used for host routes
- Not suitable for subnetting

## 💡 Best Practices

1. **Always Sort by Size**
   - Calculate largest subnets first
   - Minimizes fragmentation

2. **Plan Ahead**
   - Allocate with future growth in mind
   - Leave unallocated space for expansion

3. **Document Allocations**
   - Keep records of what's allocated
   - Prevents overlapping assignments

4. **Test Before Deployment**
   - Verify calculations
   - Check for conflicts
   - Validate routing

5. **Use Consistent Notation**
   - CIDR notation (e.g., /24)
   - Decimal subnet masks
   - Clear documentation

## 🔗 Related Concepts

- **CIDR Notation:** Classless Inter-Domain Routing
- **Subnetting:** Dividing networks into smaller networks
- **Routing:** Forwarding packets between networks
- **NAT:** Network Address Translation
- **DHCP:** Dynamic Host Configuration Protocol

## 📞 Getting Help

If calculations don't match expectations:

1. **Check Input Format**
   - Verify IP address is valid
   - Ensure prefix is 0-32
   - Check host requirements syntax

2. **Validate Requirements**
   - Total hosts shouldn't exceed network capacity
   - Each requirement must be positive
   - Check for typos

3. **Review Calculations**
   - Look at the explanation steps
   - Verify block size calculations
   - Check sequential allocation

---

**Built with React | All calculations use bitwise operations | No external libraries**
