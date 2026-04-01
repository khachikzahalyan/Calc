# VLSM Calculator - Usage Examples & Test Cases

## ✅ Quick Start Examples

### Example 1: Simple VLSM (Your First Try)

**Scenario:** You have a /24 network and need subnets for 9 and 1 host.

**Steps:**
1. Open the calculator
2. Select "VLSM" mode
3. Base IP: `10.0.0.0`
4. Base Prefix: `24`
5. Host Requirements: `9 1`
6. Click Calculate

**What You'll See:**

| # | Required | Allocated | Prefix | Network | First IP | Last IP | Broadcast | Hosts |
|---|----------|-----------|--------|---------|----------|---------|-----------|-------|
| 1 | 9 | 16 | /28 | 10.0.0.0 | 10.0.0.1 | 10.0.0.14 | 10.0.0.15 | 14 |
| 2 | 1 | 4 | /30 | 10.0.0.16 | 10.0.0.17 | 10.0.0.18 | 10.0.0.19 | 2 |

**Summary:**
- Subnets Created: 2
- IPs Used: 20 / 256
- Efficiency: 7.81%
- Unused IPs: 236

---

### Example 2: Office Network

**Scenario:** Allocating IP ranges for a small office:
- Marketing: 20 employees
- Engineering: 15 employees
- Administration: 5 employees

**Steps:**
1. Select "VLSM" mode
2. Base IP: `192.168.10.0`
3. Base Prefix: `23`
4. Host Requirements: `20 15 5` (or "20, 15, 5")
5. Click Calculate

**Expected Results:**

```
Base Network: 192.168.10.0/23
Total Capacity: 512 IPs

Sorted Requirements: [20, 15, 5]

------- VLSM ALLOCATION -------

Subnet 1 - Marketing (20 hosts)
├─ Block Size: 32 = 2^5
├─ Prefix: /27
├─ Network: 192.168.10.0/27
├─ First IP: 192.168.10.1
├─ Last IP: 192.168.10.30
├─ Broadcast: 192.168.10.31
└─ Usable: 30 hosts

Subnet 2 - Engineering (15 hosts)
├─ Block Size: 16 = 2^4
├─ Prefix: /28
├─ Network: 192.168.10.32/28
├─ First IP: 192.168.10.33
├─ Last IP: 192.168.10.46
├─ Broadcast: 192.168.10.47
└─ Usable: 14 hosts

Subnet 3 - Administration (5 hosts)
├─ Block Size: 8 = 2^3
├─ Prefix: /29
├─ Network: 192.168.10.48/29
├─ First IP: 192.168.10.49
├─ Last IP: 192.168.10.54
├─ Broadcast: 192.168.10.55
└─ Usable: 6 hosts

------- SUMMARY -------
Total Allocated: 54 IPs
Efficiency: 10.55%
Remaining: 458 IPs
```

---

### Example 3: Data Center with Multiple Tiers

**Scenario:** Enterprise data center network allocation:
- Core Servers: 60 hosts
- Database Cache: 25 hosts
- Development: 10 hosts
- Testing: 5 hosts

**Steps:**
1. Select "VLSM" mode
2. Base IP: `10.10.0.0`
3. Base Prefix: `21`
4. Host Requirements: `60 25 10 5`
5. Click Calculate

**Network Layout:**
```
Base: 10.10.0.0/21 (2048 IPs total)

┌─────────────────────────────────────────────┐
│ Core Servers (60 hosts)                     │
│ 10.10.0.0/26 (64 IPs)                       │
│ Range: 10.10.0.1 - 10.10.0.62               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Database Cache (25 hosts)                   │
│ 10.10.0.64/27 (32 IPs)                      │
│ Range: 10.10.0.65 - 10.10.0.94              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Development (10 hosts)                      │
│ 10.10.0.96/28 (16 IPs)                      │
│ Range: 10.10.0.97 - 10.10.0.110             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Testing (5 hosts)                           │
│ 10.10.0.112/29 (8 IPs)                      │
│ Range: 10.10.0.113 - 10.10.0.118            │
└─────────────────────────────────────────────┘

Efficiency: 5.30% (120 IPs used, 1928 remaining)
```

---

## 🧪 Comprehensive Test Cases

### Test Case 1: Two Subnets
```
Input:
  IP: 172.16.0.0/24
  Requirements: 9 1

Expected:
  Subnet 1: /28 (network 172.16.0.0)
  Subnet 2: /30 (network 172.16.0.16)
  
  Status: ✅ PASS (if allocations match)
```

### Test Case 2: Three Subnets
```
Input:
  IP: 192.168.0.0/22
  Requirements: 25 10 5

Expected:
  Subnet 1: /27 (192.168.0.0)
  Subnet 2: /28 (192.168.0.32)
  Subnet 3: /29 (192.168.0.48)
  
  Status: ✅ PASS
```

### Test Case 3: Large Network
```
Input:
  IP: 10.0.0.0/16
  Requirements: 100 50 20 10 5

Expected:
  Subnet 1: /25 (100 hosts)
  Subnet 2: /26 (50 hosts)
  Subnet 3: /27 (20 hosts)
  Subnet 4: /28 (10 hosts)
  Subnet 5: /29 (5 hosts)
  
  Status: ✅ PASS
```

### Test Case 4: Single Requirement
```
Input:
  IP: 172.16.0.0/20
  Requirements: 500

Expected:
  Subnet 1: /23 (512 IPs)
  
  Status: ✅ PASS
```

### Test Case 5: Point-to-Point Links (/31)
```
Input:
  IP: 192.168.1.0/24
  Requirements: 2 2 2 2

Expected:
  Each /30 creates /29 allocations
  (since we need block size 4 minimum)
  
  Note: RFC 3021 /31 not used here
  
  Status: ✅ PASS
```

---

## 📊 Comparison: VLSM vs Standard Subnetting

### Scenario: Allocate 172.16.0.0/20 for different-sized departments

#### Standard Subnetting (Equal Sizes)
```
Input: Divide into 4 subnets
Output: 4 × /22 networks (1024 IPs each)

172.16.0.0/22   - 1024 IPs
172.16.4.0/22   - 1024 IPs
172.16.8.0/22   - 1024 IPs
172.16.12.0/22  - 1024 IPs

Total: 4096 IPs (all equal)
Waste: High (if departments have varying needs)
```

#### VLSM (Optimized)
```
Input: Requirements: [500, 200, 100, 50]
Output: Different-sized subnets

172.16.0.0/23   - 512 IPs (500 hosts)
172.16.2.0/24   - 256 IPs (200 hosts)
172.16.3.0/25   - 128 IPs (100 hosts)
172.16.3.128/26 - 64 IPs (50 hosts)

Total: 960 IPs used out of 4096
Efficiency: Excellent
Waste: Minimal
```

---

## 🚀 Advanced Examples

### Enterprise Campus Network

**Scenario:**
- Main Campus
  - Building A: 150 hosts
  - Building B: 75 hosts
  - Building C: 30 hosts
- Remote Campus
  - Site 1: 100 hosts
  - Site 2: 50 hosts

**Solution:**
```
Base Network: 10.0.0.0/18 (16,384 IPs)

Main Campus Requirements: [150, 75, 30]

Building A (150 hosts)
├─ Prefix: /25 (128 IPs allocated)
└─ Network: 10.0.0.0/25

Building B (75 hosts)
├─ Prefix: /25 (128 IPs allocated)
└─ Network: 10.0.0.128/25

Building C (30 hosts)
├─ Prefix: /26 (64 IPs allocated)
└─ Network: 10.0.1.0/26

Remote Campus Requirements: [100, 50]

Site 1 (100 hosts)
├─ Prefix: /25
└─ Network: 10.0.2.0/25

Site 2 (50 hosts)
├─ Prefix: /26
└─ Network: 10.0.2.128/26

---
Total Used: 448 IPs
Efficiency: 2.73%
Remaining: 15,936 IPs (for future growth)
```

---

## ⚡ Performance Tips

1. **Largest First Strategy**
   - Always allocate largest subnet first
   - Minimizes fragmentation
   - Improves efficiency

2. **Plan for Growth**
   - Leave unused IP space
   - Don't allocate 100% of available IPs
   - Account for 20-30% growth

3. **Document Everything**
   - Keep allocation records
   - Track which subnet serves which department
   - Version control your network design

4. **Use Copy Buttons**
   - Copy subnet information to docs
   - Paste into configuration files
   - No manual retyping = no errors

---

## 🔍 Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting Network & Broadcast
```
Wrong:
Allocating 9 hosts = /29? No!
9 hosts need: 9 + network + broadcast = 11 IPs
Requires: Block size 16 = /28

Correct:
getNextPowerOfTwo(9 + 2) = 16 = 2^4
Prefix: 32 - 4 = /28 ✅
```

### ❌ Mistake 2: Not Sorting
```
Wrong:
Requirements: [5, 20, 10]
Allocating in order creates fragmentation

Correct:
Sort: [20, 10, 5]
Allocate largest first → compact allocation
```

### ❌ Mistake 3: Exceeding Capacity
```
Wrong:
Base: 10.0.0.0/25 (128 IPs)
Requirements: [100, 50]
Total needed: 150 IPs > 128 IPs ❌

Correct:
Use larger base network
10.0.0.0/24 (256 IPs) ✅
```

### ❌ Mistake 4: Not Validating Input
```
Wrong:
Host requirements: "20 xx 30"
Invalid format cause calculation error

Correct:
"20 30" or "20, 30" or [20, 30]
```

---

## 📱 Browser Features

### Copy to Clipboard
- Click 📋 icon next to any value
- Copies exact value
- No formatting needed

### Dark Mode
- Toggle 🌙 button in header
- Saves preferences
- Better for night work

### Responsive Design
- Works on desktop, tablets, phones
- Full-width on small screens
- Touch-friendly buttons

---

## 📚 Further Learning

### Concepts to Master
1. Binary representation of IP addresses
2. Bitwise operations (AND, OR)
3. Power of 2 calculations
4. Prefix notation and subnet masks
5. Network address calculation

### Real-World Applications
- Network Design
- Infrastructure Planning
- IT Security
- Systems Administration
- Network Engineering

### Standards & RFCs
- RFC 3021 - /31 Subnets
- RFC 4632 - Classless Routing
- RFC 1918 - Private IP Ranges

---

**Ready to try VLSM calculations? Open the calculator and start with Example 1! 🚀**
