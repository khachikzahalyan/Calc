import React, { useState } from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ result, onCopy, calculatorMode }) => {
  const [showBinary, setShowBinary] = useState(false);

  // Define CopyButton component
  const CopyButton = ({ text, label }) => (
    <button
      className="copy-btn"
      onClick={() => onCopy(text, label)}
      title="Copy to clipboard"
      aria-label={`Copy ${label}`}
    >
      📋
    </button>
  );

  // Check for errors first
  if (!result || result.error) {
    return (
      <div className="result-error">
        <div className="error-icon">⚠️</div>
        <h3>Calculation Error</h3>
        <p>{result?.error || 'Unknown error'}</p>
      </div>
    );
  }

  // Helper function to safely call toLocaleString
  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toLocaleString() : '0';
  };

  // ========== VLSM MODE ==========
  if (calculatorMode === 'vlsm') {
    return (
      <div className="result-display vlsm-display">
        {/* Base Network Info */}
        <div className="result-section">
          <div className="section-header">
            <h3>VLSM Allocation Details</h3>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>Base Network</label>
              <div className="value-row">
                <span className="value">
                  {result.baseNetwork}/{result.basePrefix}
                </span>
                <CopyButton
                  text={`${result.baseNetwork}/${result.basePrefix}`}
                  label="Base Network"
                />
              </div>
            </div>

            <div className="info-item">
              <label>Base Subnet Mask</label>
              <div className="value-row">
                <span className="value">{result.baseMask}</span>
                <CopyButton text={result.baseMask} label="Base Subnet Mask" />
              </div>
            </div>

            <div className="info-item">
              <label>Total IPs in Base Network</label>
              <span className="value">{formatNumber(result.baseTotalIps)}</span>
            </div>

            <div className="info-item">
              <label>Total Allocated IPs</label>
              <span className="value">{formatNumber(result.totalAllocatedIps)}</span>
            </div>

            <div className="info-item">
              <label>Remaining IPs</label>
              <span className="value">{formatNumber(result.remainingIps)}</span>
            </div>

            <div className="info-item">
              <label>Allocation Efficiency</label>
              <span className="value highlight">{result.allocationEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* VLSM Subnets Table */}
        <div className="result-section vlsm-section">
          <h3>VLSM Subnets</h3>
          <div className="vlsm-info">
            <p>
              <strong>Host Requirements (sorted):</strong> {result.originalOrder?.join(', ') || 'N/A'}
            </p>
          </div>

          <div className="vlsm-subnets-cards">
            {result.subnets?.map((subnet, idx) => (
              <div className="vlsm-subnet-card" key={idx}>
                <div className="subnet-card-header">
                  <h4>Subnet {subnet.index + 1}</h4>
                  <span className="subnet-prefix-badge">/{subnet.prefix}</span>
                </div>
                
                <div className="subnet-card-grid">
                  {/* Required & Allocated */}
                  <div className="card-section">
                    <div className="info-row">
                      <div className="info-col">
                        <label>Required Hosts</label>
                        <span className="value">{subnet.requiredHosts}</span>
                      </div>
                      <div className="info-col">
                        <label>Allocated Size</label>
                        <span className="value">{subnet.blockSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Network & Broadcast */}
                  <div className="card-section">
                    <div className="info-full">
                      <label>Network Address</label>
                      <div className="copy-cell">
                        <span className="value">{subnet.network}</span>
                        <button
                          className="small-copy-btn"
                          onClick={() => onCopy(subnet.network, `Subnet ${subnet.index + 1} Network`)}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div className="info-full">
                      <label>Broadcast Address</label>
                      <div className="copy-cell">
                        <span className="value">{subnet.broadcast}</span>
                        <button
                          className="small-copy-btn"
                          onClick={() => onCopy(subnet.broadcast, `Subnet ${subnet.index + 1} Broadcast`)}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* First & Last IP */}
                  <div className="card-section">
                    <div className="info-row">
                      <div className="info-col">
                        <label>First IP</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.firstUsableIp}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.firstUsableIp, `Subnet ${subnet.index + 1} First IP`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-col">
                        <label>Last IP</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.lastUsableIp}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.lastUsableIp, `Subnet ${subnet.index + 1} Last IP`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subnet Mask & Usable Hosts */}
                  <div className="card-section">
                    <div className="info-row">
                      <div className="info-col">
                        <label>Subnet Mask</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.subnetMask}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.subnetMask, `Subnet ${subnet.index + 1} Subnet Mask`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-col">
                        <label>Usable Hosts</label>
                        <span className="value highlight">{subnet.usableHosts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          <div className="explanation-box vlsm-explanation">
            <strong>VLSM Algorithm:</strong>
            <ol>
              <li>Sort host requirements in descending order</li>
              <li>For each requirement, calculate smallest matching subnet size (power of 2)</li>
              <li>Allocate subnets sequentially from base network</li>
              <li>Largest subnet is assigned first to minimize unused addresses</li>
            </ol>
          </div>
        </div>

        {/* Summary */}
        <div className="result-section vlsm-summary">
          <h3>Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Subnets Created:</span>
              <span className="value">{result.subnets?.length || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">IPs Used:</span>
              <span className="value">
                {formatNumber(result.totalAllocatedIps)} / {formatNumber(result.baseTotalIps)}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Efficiency:</span>
              <span className="value highlight">{result.allocationEfficiency}%</span>
            </div>
            <div className="summary-item">
              <span className="label">Unused IPs:</span>
              <span className="value">{formatNumber(result.remainingIps)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== STANDARD SUBNETTING MODE ==========
  return (
    <div className="result-display">
      {/* Basic Network Information */}
      <div className="result-section">
        <div className="section-header">
          <h3>Network Information</h3>
          <button
            className="binary-toggle"
            onClick={() => setShowBinary(!showBinary)}
          >
            {showBinary ? 'Hide Binary' : 'Show Binary'}
          </button>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>IP Address</label>
            <div className="value-row">
              <span className="value">{result.ip}</span>
              <CopyButton text={result.ip} label="IP Address" />
            </div>
            {showBinary && <div className="binary">{result.ipBinary}</div>}
          </div>

          <div className="info-item">
            <label>Prefix</label>
            <div className="value-row">
              <span className="value">/{result.prefix}</span>
            </div>
          </div>

          <div className="info-item">
            <label>Subnet Mask</label>
            <div className="value-row">
              <span className="value">{result.mask}</span>
              <CopyButton text={result.mask} label="Subnet Mask" />
            </div>
            {showBinary && <div className="binary">{result.maskBinary}</div>}
          </div>

          <div className="info-item">
            <label>Network Address</label>
            <div className="value-row">
              <span className="value">{result.network}</span>
              <CopyButton text={result.network} label="Network Address" />
            </div>
          </div>

          <div className="info-item">
            <label>Broadcast Address</label>
            <div className="value-row">
              <span className="value">{result.broadcast}</span>
              <CopyButton text={result.broadcast} label="Broadcast Address" />
            </div>
          </div>

          <div className="info-item">
            <label>First Usable IP</label>
            <div className="value-row">
              <span className="value">{result.firstUsableIp}</span>
              <CopyButton text={result.firstUsableIp} label="First Usable IP" />
            </div>
          </div>

          <div className="info-item">
            <label>Last Usable IP</label>
            <div className="value-row">
              <span className="value">{result.lastUsableIp}</span>
              <CopyButton text={result.lastUsableIp} label="Last Usable IP" />
            </div>
          </div>

          <div className="info-item">
            <label>Total IPs</label>
            <span className="value">{formatNumber(result.totalIps)}</span>
          </div>

          <div className="info-item">
            <label>Usable Hosts</label>
            <span className="value">{formatNumber(result.usableHosts)}</span>
          </div>

          <div className="info-item">
            <label>Host Bits</label>
            <span className="value">{result.hostBits}</span>
          </div>
        </div>
      </div>

      {/* Subnetting Information */}
      {result.subnets && result.subnets.length > 0 && (
        <div className="result-section subnetting-section">
          <div className="section-header">
            <h3>Subnetting Details</h3>
          </div>

          <div className="subnet-info-grid">
            <div className="subnet-info-item">
              <label>Original Prefix</label>
              <span className="value">/{result.prefix}</span>
            </div>
            <div className="subnet-info-item">
              <label>New Prefix</label>
              <span className="value highlight">/{result.newPrefix}</span>
            </div>
            <div className="subnet-info-item">
              <label>Subnet Bits Used</label>
              <span className="value">{result.subnetBitsUsed}</span>
            </div>
            <div className="subnet-info-item">
              <label>Number of Subnets</label>
              <span className="value">{result.subnetCount}</span>
            </div>
            <div className="subnet-info-item">
              <label>Hosts per Subnet</label>
              <span className="value">
                {formatNumber(Math.pow(2, 32 - result.newPrefix) - 2)}
              </span>
            </div>
          </div>

          <div className="explanation-box">
            <strong>Calculation:</strong>
            {result.subnetBitsUsed > 0 && (
              <p>
                To create {result.subnetCount} subnet{result.subnetCount > 1 ? 's' : ''},
                we need {result.subnetBitsUsed} bit{result.subnetBitsUsed > 1 ? 's' : ''} (2
                <sup>{result.subnetBitsUsed}</sup> = {result.subnetCount}). Original prefix /{result.prefix}
                + {result.subnetBitsUsed} bits = /<strong>{result.newPrefix}</strong>
              </p>
            )}
          </div>

          {/* Subnets Cards */}
          <div className="subnets-section">
            <h4>Generated Subnets</h4>
            <div className="subnets-cards">
              {result.subnets.map((subnet, idx) => (
                <div className="subnet-card" key={idx}>
                  <div className="subnet-card-header">
                    <h4>Subnet {subnet.index}</h4>
                    <span className="subnet-prefix-badge">/{result.newPrefix}</span>
                  </div>
                  
                  <div className="subnet-card-grid">
                    {/* Network & Broadcast */}
                    <div className="card-section">
                      <div className="info-full">
                        <label>Network Address</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.network}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.network, `Subnet ${subnet.index} Network`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-full">
                        <label>Broadcast Address</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.broadcast}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.broadcast, `Subnet ${subnet.index} Broadcast`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* First & Last IP */}
                    <div className="card-section">
                      <div className="info-row">
                        <div className="info-col">
                          <label>First IP</label>
                          <div className="copy-cell">
                            <span className="value">{subnet.firstIp}</span>
                            <button
                              className="small-copy-btn"
                              onClick={() => onCopy(subnet.firstIp, `Subnet ${subnet.index} First IP`)}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <div className="info-col">
                          <label>Last IP</label>
                          <div className="copy-cell">
                            <span className="value">{subnet.lastIp}</span>
                            <button
                              className="small-copy-btn"
                              onClick={() => onCopy(subnet.lastIp, `Subnet ${subnet.index} Last IP`)}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mask & Hosts */}
                    <div className="card-section">
                      <div className="info-row">
                        <div className="info-col">
                          <label>Subnet Mask</label>
                          <div className="copy-cell">
                            <span className="value">{subnet.mask}</span>
                            <button
                              className="small-copy-btn"
                              onClick={() => onCopy(subnet.mask, `Subnet ${subnet.index} Mask`)}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <div className="info-col">
                          <label>Usable Hosts</label>
                          <span className="value highlight">{formatNumber(subnet.usableHosts)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Info */}
                    <div className="card-section">
                      <div className="info-full">
                        <label>Total IPs / Block Size</label>
                        <span className="value">{formatNumber(subnet.totalIps)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
