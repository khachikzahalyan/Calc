import React, { useState, useMemo } from 'react';
import { calculateSubnet } from '../utils/ip';
import { calculateVLSM } from '../utils/vlsm';
import ResultDisplay from './ResultDisplay';
import './SubnetCalculator.css';

const SubnetCalculator = () => {
  // Network Information
  const [ip, setIp] = useState('10.0.0.0');
  const [prefix, setPrefix] = useState('24');
  
  // Standard Subnetting Mode
  const [numSubnets, setNumSubnets] = useState('');
  const [hostsPerSubnet, setHostsPerSubnet] = useState('');
  const [subnettingMode, setSubnettingMode] = useState('subnets'); // 'subnets' or 'hosts'
  
  // VLSM Mode
  const [hostRequirements, setHostRequirements] = useState('9 1');
  
  // Calculator Mode
  const [calculatorMode, setCalculatorMode] = useState('standard'); // 'standard' or 'vlsm'
  const [darkMode, setDarkMode] = useState(false);
  const [result, setResult] = useState(null);

  // Memoize calculation to avoid unnecessary re-renders
  const handleCalculate = useMemo(() => {
    return () => {
      if (calculatorMode === 'standard') {
        let numSubnetsVal = null;
        let hostsVal = null;

        if (subnettingMode === 'subnets' && numSubnets.trim()) {
          numSubnetsVal = parseInt(numSubnets, 10);
        } else if (subnettingMode === 'hosts' && hostsPerSubnet.trim()) {
          hostsVal = parseInt(hostsPerSubnet, 10);
        }

        const calcResult = calculateSubnet(ip, prefix, numSubnetsVal, hostsVal);
        setResult(calcResult);
      } else {
        // VLSM Mode
        const calcResult = calculateVLSM(ip, prefix, hostRequirements);
        setResult(calcResult);
      }
    };
  }, [
    ip,
    prefix,
    numSubnets,
    hostsPerSubnet,
    subnettingMode,
    hostRequirements,
    calculatorMode,
  ]);

  React.useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className={`subnet-calculator ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="calculator-header">
        <div className="header-content">
          <h1>IPv4 Subnet Calculator</h1>
          <p>Standard Subnetting & VLSM Calculation Tool</p>
        </div>
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="calculator-container">
        {/* Input Panel */}
        <div className="input-panel">
          {/* Calculator Mode Toggle */}
          <div className="section-title">Calculator Mode</div>
          <div className="mode-selector" style={{ marginBottom: '24px' }}>
            <button
              className={`mode-btn ${calculatorMode === 'standard' ? 'active' : ''}`}
              onClick={() => setCalculatorMode('standard')}
            >
              Standard Subnetting
            </button>
            <button
              className={`mode-btn ${calculatorMode === 'vlsm' ? 'active' : ''}`}
              onClick={() => setCalculatorMode('vlsm')}
            >
              VLSM
            </button>
          </div>

          <div className="section-title">Network Information</div>

          <div className="form-group">
            <label htmlFor="ip-input">Base IP Address</label>
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g., 10.0.0.0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prefix-input">Base CIDR Prefix</label>
            <div className="input-with-label">
              <input
                id="prefix-input"
                type="number"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                min="0"
                max="32"
                className="form-input"
              />
              <span className="input-suffix">/</span>
            </div>
          </div>

          {/* Standard Subnetting Section */}
          {calculatorMode === 'standard' && (
            <>
              <div className="section-title" style={{ marginTop: '24px' }}>
                Subnetting Options
              </div>

              <div className="mode-selector">
                <button
                  className={`mode-btn ${subnettingMode === 'subnets' ? 'active' : ''}`}
                  onClick={() => setSubnettingMode('subnets')}
                >
                  By Number of Subnets
                </button>
                <button
                  className={`mode-btn ${subnettingMode === 'hosts' ? 'active' : ''}`}
                  onClick={() => setSubnettingMode('hosts')}
                >
                  By Hosts per Subnet
                </button>
              </div>

              {subnettingMode === 'subnets' && (
                <div className="form-group">
                  <label htmlFor="subnets-input">Number of Subnets</label>
                  <input
                    id="subnets-input"
                    type="number"
                    value={numSubnets}
                    onChange={(e) => setNumSubnets(e.target.value)}
                    min="1"
                    placeholder="e.g., 3"
                    className="form-input"
                  />
                </div>
              )}

              {subnettingMode === 'hosts' && (
                <div className="form-group">
                  <label htmlFor="hosts-input">Hosts per Subnet</label>
                  <input
                    id="hosts-input"
                    type="number"
                    value={hostsPerSubnet}
                    onChange={(e) => setHostsPerSubnet(e.target.value)}
                    min="1"
                    placeholder="e.g., 250"
                    className="form-input"
                  />
                </div>
              )}
            </>
          )}

          {/* VLSM Section */}
          {calculatorMode === 'vlsm' && (
            <>
              <div className="section-title" style={{ marginTop: '24px' }}>
                Host Requirements
              </div>

              <div className="form-group">
                <label htmlFor="hosts-requirements">
                  Required Hosts
                  <span className="subtitle">
                    Space/comma separated (e.g., "9 1" or "10, 5, 2, 1")
                  </span>
                </label>
                <textarea
                  id="hosts-requirements"
                  value={hostRequirements}
                  onChange={(e) => setHostRequirements(e.target.value)}
                  placeholder="e.g., 9 1&#10;or 10, 5, 2, 1"
                  className="form-input textarea-input"
                  rows="3"
                />
              </div>

              <div className="info-box">
                <p>
                  <strong>How VLSM works:</strong> Allocates subnets with different
                  sizes based on host requirements. Largest subnet is assigned first to
                  minimize wasted IPs.
                </p>
              </div>
            </>
          )}

          <button className="calculate-btn" onClick={handleCalculate}>
            Calculate
          </button>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          {result && (
            <ResultDisplay
              result={result}
              onCopy={handleCopyToClipboard}
              mode={subnettingMode}
              calculatorMode={calculatorMode}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="calculator-footer">
        <p>
          Built with React • All calculations use bitwise operations • No external
          libraries
        </p>
      </div>
    </div>
  );
};

export default SubnetCalculator;
