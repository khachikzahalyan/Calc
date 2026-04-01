import React, { useState } from 'react';
import { ipToBinary } from '../utils/ip';
import './ResultDisplay.css';

const ResultDisplay = ({ result, onCopy, calculatorMode }) => {
  const [showBinary, setShowBinary] = useState(false);
  const [expandedSubnet, setExpandedSubnet] = useState(null);

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

          <div className="subnets-table-wrapper">
            <table className="vlsm-subnets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Required Hosts</th>
                  <th>Allocated Size</th>
                  <th>Prefix</th>
                  <th>Network</th>
                  <th>First IP</th>
                  <th>Last IP</th>
                  <th>Broadcast</th>
                  <th>Usable Hosts</th>
                </tr>
              </thead>
              <tbody>
                {result.subnets?.map((subnet, idx) => (
                  <tr
                    key={idx}
                    className="vlsm-subnet-row"
                    onClick={() =>
                      setExpandedSubnet(expandedSubnet === idx ? null : idx)
                    }
                  >
                    <td className="vlsm-index">{subnet.index + 1}</td>
                    <td className="required-hosts">{subnet.requiredHosts}</td>
                    <td className="allocated-size">{subnet.blockSize}</td>
                    <td className="vlsm-prefix">/{subnet.prefix}</td>
                    <td className="vlsm-network">
                      <div className="copy-cell">
                        <span>{subnet.network}</span>
                        <button
                          className="small-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(subnet.network, `Subnet ${subnet.index + 1} Network`);
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="vlsm-first-ip">
                      <div className="copy-cell">
                        <span>{subnet.firstUsableIp}</span>
                        <button
                          className="small-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(subnet.firstUsableIp, `Subnet ${subnet.index + 1} First IP`);
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="vlsm-last-ip">
                      <div className="copy-cell">
                        <span>{subnet.lastUsableIp}</span>
                        <button
                          className="small-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(subnet.lastUsableIp, `Subnet ${subnet.index + 1} Last IP`);
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="vlsm-broadcast">
                      <div className="copy-cell">
                        <span>{subnet.broadcast}</span>
                        <button
                          className="small-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(subnet.broadcast, `Subnet ${subnet.index + 1} Broadcast`);
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="vlsm-hosts">{subnet.usableHosts}</td>
                  </tr>
                )) || []}
              </tbody>
            </table>
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

          {/* Subnets Table */}
          <div className="subnets-section">
            <h4>Generated Subnets</h4>
            <div className="subnets-table-wrapper">
              <table className="subnets-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Network</th>
                    <th>Broadcast</th>
                    <th>First IP</th>
                    <th>Last IP</th>
                    <th>Hosts</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.subnets.map((subnet, idx) => (
                    <React.Fragment key={idx}>
                      <tr
                        className="subnet-row"
                        onClick={() =>
                          setExpandedSubnet(
                            expandedSubnet === idx ? null : idx
                          )
                        }
                      >
                        <td className="subnet-number">{subnet.index}</td>
                        <td className="network-cell">
                          <div className="copy-cell">
                            <span>{subnet.network}</span>
                            <button
                              className="small-copy-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(
                                  subnet.network,
                                  `Subnet ${subnet.index} Network`
                                );
                              }}
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="broadcast-cell">
                          <div className="copy-cell">
                            <span>{subnet.broadcast}</span>
                            <button
                              className="small-copy-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(
                                  subnet.broadcast,
                                  `Subnet ${subnet.index} Broadcast`
                                );
                              }}
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="first-ip">
                          <div className="copy-cell">
                            <span>{subnet.firstIp}</span>
                            <button
                              className="small-copy-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(
                                  subnet.firstIp,
                                  `Subnet ${subnet.index} First IP`
                                );
                              }}
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="last-ip">
                          <div className="copy-cell">
                            <span>{subnet.lastIp}</span>
                            <button
                              className="small-copy-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(
                                  subnet.lastIp,
                                  `Subnet ${subnet.index} Last IP`
                                );
                              }}
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td className="hosts-count">{formatNumber(subnet.usableHosts)}</td>
                        <td className="expand-btn">
                          {expandedSubnet === idx ? '▼' : '▶'}
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedSubnet === idx && (
                        <tr className="subnet-details-row">
                          <td colSpan="7">
                            <div className="subnet-details">
                              <div className="detail-item">
                                <label>Prefix:</label>
                                <span>/{result.newPrefix}</span>
                              </div>
                              <div className="detail-item">
                                <label>Mask:</label>
                                <span>{subnet.mask}</span>
                              </div>
                              <div className="detail-item">
                                <label>Total IPs:</label>
                                <span>{formatNumber(subnet.totalIps)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
