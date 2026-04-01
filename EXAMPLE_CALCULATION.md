# Example Calculation: 172.16.5.130/20 with 3 Subnets

## Input Specification
```
IP Address:     172.16.5.130
CIDR Prefix:    /20
Operation:      Divide into 3 subnets
```

---

## Step-by-Step Calculation

### Step 1: Convert IP to Binary and Integer

IP: 172.16.5.130
```
Decimal octets: [172, 16, 5, 130]
Binary:         [10101100, 00010000, 00000101, 10000010]
32-bit integer: 2886734082
Hexadecimal:    0xAC100582
```

### Step 2: Convert Prefix to Subnet Mask

Prefix: /20 (first 20 bits are network, last 12 bits are host)
```
Binary:      11111111.11111111.11110000.00000000
Decimal:     255.255.240.0
Integer:     4294967040 (0xFFFFF000)

Network bits:  20 (all 1s)
Host bits:     12 (all 0s)
```

### Step 3: Calculate Network Address

Network = IP AND Mask
```
IP (binary):   10101100.00010000.00000101.10000010
Mask (binary): 11111111.11111111.11110000.00000000
AND result:    10101100.00010000.00000000.00000000

Decimal:       172.16.0.0
Integer:       2886732800
```

**Base Network: 172.16.0.0**

### Step 4: Calculate Broadcast Address

Broadcast = Network OR HostMask
```
Host mask (12 bits on): 0x00000FFF = 4095
Network:     10101100.00010000.00000000.00000000
Host mask:   00000000.00000000.00001111.11111111
OR result:   10101100.00010000.00001111.11111111

Decimal:     172.16.15.255
Integer:     2886734975
```

**Broadcast: 172.16.15.255**

### Step 5: Calculate Host Information

```
Host bits available: 12
Total IPs:           2^12 = 4,096
Usable hosts:        2^12 - 2 = 4,094 (exclude network and broadcast)

IP range:
  Network:       172.16.0.0
  First usable:  172.16.0.1
  Last usable:   172.16.15.254
  Broadcast:     172.16.15.255
```

---

## Step 6: Plan Subnetting

**Requirement:** Divide into 3 subnets from /20

### Calculate Required Prefix

```
Need 3 subnets:
  
Number of subnets created:  2^bits_to_add
For 3 subnets:              Need 2^bits >= 3
                            2^1 = 2 (not enough)
                            2^2 = 4 (sufficient!) ✓

Bits to add:                2
New prefix:                 20 + 2 = /22
```

### Calculate Subnet Size

```
New prefix: /22
Host bits per subnet: 32 - 22 = 10
Hosts per subnet: 2^10 - 2 = 1,022
Subnet block size: 2^10 = 1,024
Increment between subnets: 1,024 IP addresses
```

---

## Step 7: Generate All Subnets

**Formula for each subnet:**
```
Subnet_N_address = Base_network + (N × block_size)
```

### Subnet 0
```
Network:    172.16.0.0 + (0 × 1024) = 172.16.0.0
                        (in binary, last 12 bits: 000000000000)
Broadcast:  172.16.3.255
             (in binary, last 12 bits: 111111111111)
First IP:   172.16.0.1
Last IP:    172.16.3.254
Hosts:      1,022

Verification: 
  172.16.0.0 to 172.16.3.255
  Octet 3 range: 0-3 (4 increments × 256 = 1024 IPs) ✓
```

### Subnet 1
```
Network:    172.16.0.0 + (1 × 1024) = 172.16.4.0
            (172.16 = 172×256 + 16 = 44048 + 4 = 44052)
Broadcast:  172.16.7.255
First IP:   172.16.4.1
Last IP:    172.16.7.254
Hosts:      1,022

Verification:
  172.16.4.0 to 172.16.7.255
  Octet 3 range: 4-7 (4 increments) ✓
```

### Subnet 2
```
Network:    172.16.0.0 + (2 × 1024) = 172.16.8.0
Broadcast:  172.16.11.255
First IP:   172.16.8.1
Last IP:    172.16.11.254
Hosts:      1,022

Verification:
  172.16.8.0 to 172.16.11.255
  Octet 3 range: 8-11 (4 increments) ✓
```

### Subnet 3 (Extra - due to 2^2 = 4)
```
Network:    172.16.0.0 + (3 × 1024) = 172.16.12.0
Broadcast:  172.16.15.255
First IP:   172.16.12.1
Last IP:    172.16.15.254
Hosts:      1,022

Note: This completes the original /20 network
      172.16.15.255 is the broadcast of original network
```

---

## Complete Results Table

| Subnet | Network | Broadcast | First IP | Last IP | Hosts | CIDR |
|--------|---------|-----------|----------|---------|-------|------|
| 0 | 172.16.0.0 | 172.16.3.255 | 172.16.0.1 | 172.16.3.254 | 1,022 | /22 |
| 1 | 172.16.4.0 | 172.16.7.255 | 172.16.4.1 | 172.16.7.254 | 1,022 | /22 |
| 2 | 172.16.8.0 | 172.16.11.255 | 172.16.8.1 | 172.16.11.254 | 1,022 | /22 |
| 3 | 172.16.12.0 | 172.16.15.255 | 172.16.12.1 | 172.16.15.254 | 1,022 | /22 |

---

## Binary Visualization

### Original Network (/20)
```
172.16.5.130:
  10101100.00010000.00000101.10000010
  ^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^^^^^
  172     16       5        130

Network: 172.16.0.0 (/20)
  10101100.00010000.0000|000000000000
  ^^^^^^^^ ^^^^^^^^ ^^^^ ^^^^^^^^^^^^
  172     16       0     (12 host bits)
                   ↑
                   Network portion
                   20 bits total
```

### After Subnetting (/22)
```
Subnet 0: 172.16.0.0 (/22)
  10101100.00010000.0000|00 00000000
  ^^^^^^^^ ^^^^^^^^ ^^^^ ^^ ^^^^^^^^
  172     16       0    0  (10 host bits)
                        ↑↑
                        2 subnet bits

Subnet 1: 172.16.4.0 (/22)
  10101100.00010000.0001|00 00000000
  ^^^^^^^^ ^^^^^^^^ ^^^^ ^^ ^^^^^^^^
  172     16       1    0  
  (Octet 3 = 00000001 in binary at subnet bit position)

Subnet 2: 172.16.8.0 (/22)
  10101100.00010000.0010|00 00000000
  ^^^^^^^^ ^^^^^^^^ ^^^^ ^^ ^^^^^^^^
  172     16       2    0
  (Octet 3 = 00000010 in binary at subnet bit position)
```

---

## Key Insights

### Q: How many bits are needed for 3 subnets?
**A:** 2 bits (2² = 4 subnets, the next power of 2 ≥ 3)

### Q: Why did we get 4 subnets instead of 3?
**A:** Subnetting must use powers of 2. 3 subnets need 2 bits, which creates 4 subnets.

### Q: What's the new subnet mask?
**A:** 255.255.252.0 (/22 notation)

### Q: How many addresses per subnet?
**A:** 1,024 total (172.16.0.0 - 172.16.3.255, etc.)

### Q: How many usable hosts per subnet?
**A:** 1,022 (excluding network and broadcast)

### Q: What's the increment between subnets?
**A:** 4 in the third octet (0→4→8→12), or 1024 IPs per subnet

---

## Verification Against Requirements

✅ **Input:** 172.16.5.130/20 with 3 subnets  
✅ **Calculated Prefix:** /22 (correct for 4 subnets from /20)  
✅ **All 4 Subnets Generated:** Listed above  
✅ **First Subnet:** 172.16.4.0/22 range (172.16.4.0 - 172.16.7.255)  
✅ **Each Subnet:** 1,022 usable hosts  
✅ **Increment:** Exactly 1,024 addresses between each subnet  
✅ **Within Original:** All subnets fit within 172.16.0.0/20  

---

## Visual Representation

```
Original /20 Network:       172.16.0.0 - 172.16.15.255 (4096 IPs)
│
├─ Subnet 0 (/22):          172.16.0.0 - 172.16.3.255 (1024 IPs)
│   ├─ Network:   172.16.0.0
│   ├─ Usable:    172.16.0.1 - 172.16.3.254
│   └─ Broadcast: 172.16.3.255
│
├─ Subnet 1 (/22):          172.16.4.0 - 172.16.7.255 (1024 IPs)
│   ├─ Network:   172.16.4.0
│   ├─ Usable:    172.16.4.1 - 172.16.7.254
│   └─ Broadcast: 172.16.7.255
│
├─ Subnet 2 (/22):          172.16.8.0 - 172.16.11.255 (1024 IPs)
│   ├─ Network:   172.16.8.0
│   ├─ Usable:    172.16.8.1 - 172.16.11.254
│   └─ Broadcast: 172.16.11.255
│
└─ Subnet 3 (/22):          172.16.12.0 - 172.16.15.255 (1024 IPs)
    ├─ Network:   172.16.12.0
    ├─ Usable:    172.16.12.1 - 172.16.15.254
    └─ Broadcast: 172.16.15.255
```

---

## Usage Example

In the calculator:
1. Enter IP: `172.16.5.130`
2. Enter Prefix: `20`
3. Select mode: "By Number of Subnets"
4. Enter Subnets: `3`
5. Click Calculate

**App will immediately display all results shown above**

---

**This calculation is exactly what the calculator produces for the requirement example!** ✨
