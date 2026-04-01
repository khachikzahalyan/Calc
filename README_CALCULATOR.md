# IPv4 Subnet Calculator

A professional, interview-ready React application for calculating and visualizing IPv4 subnets. Built with functional components, clean code, and zero external library dependencies for calculations.

## Features

### Core Functionality
✅ **Basic Network Calculations**
- Subnet mask (decimal and binary)
- Network address
- Broadcast address
- First/last usable IPs
- Total IPs and usable hosts

✅ **Advanced Subnetting**
- Calculate subnets by count
- Calculate subnets by required hosts per subnet
- Automatic prefix calculation
- Complete subnet listing with all details

✅ **Binary Visualization**
- Show IPs in binary format
- Display subnet masks in binary
- Highlight network vs host bits

✅ **Smart Validation**
- IP format validation
- CIDR prefix validation (0-32)
- Graceful error handling
- Input constraints

✅ **User Experience**
- Dark mode support
- One-click copy to clipboard
- Responsive design (mobile-friendly)
- Real-time calculations
- Sticky input panel
- Expandable subnet details

### Code Quality
- ✨ All logic implemented manually using bitwise operations
- 🎯 Zero external libraries for calculations
- 📦 Clean separation of concerns
- ⚡ Performance optimized with memoization
- 🧪 Interview-ready code structure

## Project Structure

```
src/
├── components/
│   ├── SubnetCalculator.jsx       # Main component with UI
│   ├── SubnetCalculator.css       # Component styling
│   ├── ResultDisplay.jsx           # Results visualization
│   └── ResultDisplay.css           # Results styling
├── utils/
│   └── ip.js                       # All IP calculation logic (NO LIBRARIES)
├── App.js                          # Entry component
├── App.css                         # App styling
├── index.js                        # React entry point
└── index.css                       # Global styles
```

## Utility Functions (Implemented in `src/utils/ip.js`)

### Core Functions
- `ipToInt(ip)` - Convert IP string to 32-bit integer
- `intToIp(int)` - Convert integer back to IP string
- `prefixToMask(prefix)` - Convert CIDR /XX to subnet mask
- `maskToPrefix(mask)` - Convert subnet mask to CIDR notation
- `ipToBinary(ipInt)` - Get binary representation of IP

### Calculation Functions
- `calculateNetwork(ipInt, mask)` - Get network address
- `calculateBroadcast(network, hostBits)` - Get broadcast address
- `calculateHosts(hostBits)` - Calculate usable hosts
- `calculateTotalIps(hostBits)` - Calculate total IPs
- `calculatePrefixForHosts(requiredHosts)` - Find prefix for host count
- `calculateBitsForSubnets(subnets)` - Bits needed for subnet count
- `generateSubnets(baseNetwork, basePrefix, newPrefix)` - Generate all subnets

### Validation Functions
- `isValidIp(ip)` - Validate IPv4 address format
- `isValidPrefix(prefix)` - Validate CIDR prefix (0-32)

### Main Function
- `calculateSubnet(ip, prefix, numSubnets, hostsPerSubnet)` - Complete calculation

## Example Usage

### Example 1: Basic Network Analysis
```
Input: 192.168.1.0/24
Output:
  - Network: 192.168.1.0
  - Broadcast: 192.168.1.255
  - First IP: 192.168.1.1
  - Last IP: 192.168.1.254
  - Usable Hosts: 254
  - Subnet Mask: 255.255.255.0
```

### Example 2: Subnetting by Count (from requirements)
```
Input: 172.16.5.130/20, create 3 subnets
Calculation:
  - Need 2 bits for 3 subnets (2² = 4 subnets possible)
  - New prefix: /20 + 2 = /22
  
Output Subnets:
  1. 172.16.4.0/22 - 172.16.4.1 to 172.16.7.254 (1022 hosts)
  2. 172.16.8.0/22 - 172.16.8.1 to 172.16.11.254 (1022 hosts)
  3. 172.16.12.0/22 - 172.16.12.1 to 172.16.15.254 (1022 hosts)
  4. 172.16.0.0/22 - 172.16.0.1 to 172.16.3.254 (1022 hosts)
```

### Example 3: Subnetting by Hosts
```
Input: 10.0.0.0/16, need 500 hosts per subnet
Calculation:
  - Need 9 bits for 500 hosts (2⁹ - 2 = 510 hosts)
  - New prefix: /16 + 8 = /24
  
Output: 256 subnets of /24 with 254 usable hosts each
```

## How It Works

### Mathematical Foundation

**IPv4 Address Structure:**
```
Address: 192.168.1.130
Prefix: /24 (first 24 bits are network)
         11000000.10101000.00000001.10000010
Network: 11000000.10101000.00000001.00000000 (192.168.1.0)
Host:    00000000.00000000.00000000.10000010
```

**Bitwise Operations Used:**
1. **AND Operation:** `IP & Mask = Network`
2. **OR Operation:** `Network | HostMask = Broadcast`
3. **Bit Shifting:** Calculate subnet increments and masks
4. **Bit Counting:** Determine required bits for specific counts

### Subnetting Algorithm
1. Calculate bits needed: `log₂(required_count)`
2. Add bits to existing prefix
3. For each subnet index:
   - Network = Base + (index × increment)
   - Increment = 2^(32 - newPrefix)
   - Broadcast = Network + increment - 1

## Performance Optimization

- **useMemo:** Memoizes calculation function to prevent unnecessary re-renders
- **useState:** Efficient state management
- **No unnecessary re-renders:** Input changes trigger recalculation only when needed
- **Scroll optimization:** Results panel has max-height with scrolling

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation
```bash
cd calc
npm install
```

### Development
```bash
npm start
```
Runs on http://localhost:3000 (or next available port)

### Production Build
```bash
npm run build
```
Creates optimized production build in `build/` directory

### Running Tests
```bash
npm test
```

## Component Architecture

### SubnetCalculator.jsx
- Main orchestrator component
- Handles all state (IP, prefix, mode, dark mode)
- Manages user inputs
- Triggers calculations
- Props to: ResultDisplay

### ResultDisplay.jsx
- Displays calculation results
- Handles binary visualization toggle
- Expandable subnet details
- Copy-to-clipboard functionality
- Responsive table layout

### Styled with CSS Modules
- SubnetCalculator.css: Layout, inputs, controls
- ResultDisplay.css: Results display, tables, responsive

## Real Interview Application

This calculator demonstrates:

✅ **Networking Knowledge**
- Understanding of CIDR notation
- Subnetting calculations
- Binary/decimal conversion
- Network address calculations

✅ **Frontend Skills**
- React functional components
- State management with hooks
- Performance optimization (useMemo)
- Responsive CSS Grid layout
- Dark mode implementation
- Clipboard API usage

✅ **Algorithm Development**
- Bitwise operations
- Complex calculations without libraries
- Efficient algorithms
- Input validation

✅ **Code Quality**
- Clean, readable code
- Proper separation of concerns
- Comprehensive comments
- Professional UI/UX
- Error handling

## Validation Rules

### IP Address
- Must be 4 octets separated by dots
- Each octet: 0-255

### CIDR Prefix
- Must be integer
- Range: 0-32

### Subnets
- Minimum 1, maximum (32 - current_prefix)
- Prevents invalid calculations

### Hosts per Subnet
- Minimum 1
- Maximum: (2^(32-prefix) - 2)

## Tips for Interview

When discussing this project:

1. **Explain the math:** Be ready to explain binary operations, CIDR notation, and subnetting
2. **Discuss trade-offs:** Why no external libraries? Performance? Learning? Simplicity?
3. **Performance:** Discuss memoization and why unnecessary re-renders were avoided
4. **Edge cases:** Handle /31 and /32 subnets correctly
5. **User Experience:** Discuss dark mode, copy buttons, responsive design choices
6. **Testing:** Mention how you would test (unit tests for ip.js, integration tests for components)

## License

MIT - Feel free to use for portfolio or interviews

---

**Built with:** React, JavaScript (ES6+), CSS3, Bitwise Operations
**No External Calculation Libraries Used** ✨
