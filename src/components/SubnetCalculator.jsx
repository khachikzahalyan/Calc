import React, { useState, useMemo } from 'react';
import { calculateSubnet, ipToBinary } from '../utils/ip';
import ResultDisplay from './ResultDisplay';
import './SubnetCalculator.css';

const SubnetCalculator = () => {
  const [ip, setIp] = useState('172.16.5.130');
  const [prefix, setPrefix] = useState('20');
  const [numSubnets, setNumSubnets] = useState('3');
  const [hostsPerSubnet, setHostsPerSubnet] = useState('');
  const [mode, setMode] = useState('subnets'); // 'subnets' or 'hosts'
  const [darkMode, setDarkMode] = useState(false);
  const [result, setResult] = useState(null);

  // Memoize calculation to avoid unnecessary re-renders
  const handleCalculate = useMemo(() => {
    return () => {
      let numSubnetsVal = null;
      let hostsVal = null;

      if (mode === 'subnets' && numSubnets.trim()) {
        numSubnetsVal = parseInt(numSubnets, 10);
      } else if (mode === 'hosts' && hostsPerSubnet.trim()) {
        hostsVal = parseInt(hostsPerSubnet, 10);
      }

      const calcResult = calculateSubnet(ip, prefix, numSubnetsVal, hostsVal);
      setResult(calcResult);
    };
  }, [ip, prefix, numSubnets, hostsPerSubnet, mode]);

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
          <p>Professional subnet analysis and planning tool</p>
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
          <div className="section-title">Network Information</div>

          <div className="form-group">
            <label htmlFor="ip-input">IP Address</label>
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g., 192.168.1.0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prefix-input">CIDR Prefix</label>
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

          <div className="section-title" style={{ marginTop: '24px' }}>
            Subnetting Options
          </div>

          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'subnets' ? 'active' : ''}`}
              onClick={() => setMode('subnets')}
            >
              By Number of Subnets
            </button>
            <button
              className={`mode-btn ${mode === 'hosts' ? 'active' : ''}`}
              onClick={() => setMode('hosts')}
            >
              By Hosts per Subnet
            </button>
          </div>

          {mode === 'subnets' && (
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

          {mode === 'hosts' && (
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
              mode={mode}
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
