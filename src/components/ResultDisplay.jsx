import React, { useState } from 'react';
import { ipToBinary } from '../utils/ip';
import './ResultDisplay.css';

const ResultDisplay = ({ result, onCopy, mode }) => {
  const [showBinary, setShowBinary] = useState(false);
  const [expandedSubnet, setExpandedSubnet] = useState(null);

  if (result.error) {
    return (
      <div className="result-error">
        <div className="error-icon">⚠️</div>
        <h3>Calculation Error</h3>
        <p>{result.error}</p>
      </div>
    );
  }

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

  return (
    <div className="result-display">
      {/* Error Alert */}
      {result.error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {result.error}
        </div>
      )}

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
            <span className="value">{result.totalIps.toLocaleString()}</span>
          </div>

          <div className="info-item">
            <label>Usable Hosts</label>
            <span className="value">{result.usableHosts.toLocaleString()}</span>
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
              <span className="value">{calculateHostsPerSubnet(result)}</span>
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
                        <td className="hosts-count">{subnet.usableHosts}</td>
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
                                <span>/{subnet.prefix}</span>
                              </div>
                              <div className="detail-item">
                                <label>Total IPs:</label>
                                <span>{subnet.totalIps}</span>
                              </div>
                              <div className="detail-item">
                                <label>Usable Hosts:</label>
                                <span>{subnet.usableHosts}</span>
                              </div>
                              <div className="detail-item">
                                <label>Subnet Mask:</label>
                                <span>255.255.255.0</span>
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

      {/* Quick Reference */}
      <div className="result-section quick-reference">
        <h3>Quick Reference</h3>
        <div className="reference-grid">
          <div className="reference-item">
            <strong>Network Size</strong>
            <p>/{result.prefix}</p>
          </div>
          <div className="reference-item">
            <strong>Subnet Mask</strong>
            <p>{result.mask}</p>
          </div>
          <div className="reference-item">
            <strong>Usable Range</strong>
            <p>
              {result.firstUsableIp} - {result.lastUsableIp}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to calculate hosts per subnet based on result
const calculateHostsPerSubnet = (result) => {
  if (result.subnets && result.subnets.length > 0) {
    return result.subnets[0].usableHosts;
  }
  return result.usableHosts;
};

export default ResultDisplay;
