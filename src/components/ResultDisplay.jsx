import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import ExplanationModal from './ExplanationModal';
import './ResultDisplay.css';

const ResultDisplay = ({ result, onCopy, calculatorMode }) => {
  const { t } = useI18n();
  const [showBinary, setShowBinary] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Open explanation modal
  const openModal = (type, data) => {
    setModalData({ type, ...data });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  // Define CopyButton component - Opens explanation modal instead of copying
  const CopyButton = ({ text, label, explainType, explainData }) => (
    <button
      className="copy-btn"
      onClick={() => explainType ? openModal(explainType, explainData) : onCopy(text, label)}
      title={explainType ? t('ui.explainClick') : t('ui.copyClipboard')}
      aria-label={explainType ? `Explain ${label}` : `Copy ${label}`}
    >
      {explainType ? '💡' : '📋'}
    </button>
  );

  // Check for errors first
  if (!result || result.error) {
    const errorKey = result?.error || 'result.unknownError';
    return (
      <div className="result-error">
        <div className="error-icon">⚠️</div>
        <h3>{t('result.error')}</h3>
        <p>{t(errorKey)}</p>
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
            <h3>{t('result.vlsmAllocationDetails')}</h3>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>{t('result.baseNetwork')}</label>
              <div className="value-row">
                <span className="value">
                  {result.baseNetwork}/{result.basePrefix}
                </span>
                <CopyButton
                  text={`${result.baseNetwork}/${result.basePrefix}`}
                  label={t('result.baseNetwork')}
                />
              </div>
            </div>

            <div className="info-item">
              <label>{t('result.baseSubnetMask')}</label>
              <div className="value-row">
                <span className="value">{result.baseMask}</span>
                <CopyButton text={result.baseMask} label={t('result.baseSubnetMask')} />
              </div>
            </div>

            <div className="info-item">
              <label>{t('result.totalIpsInBaseNetwork')}</label>
              <span className="value">{formatNumber(result.baseTotalIps)}</span>
            </div>

            <div className="info-item">
              <label>{t('result.totalAllocatedIps')}</label>
              <span className="value">{formatNumber(result.totalAllocatedIps)}</span>
            </div>

            <div className="info-item">
              <label>{t('result.remainingIps')}</label>
              <span className="value">{formatNumber(result.remainingIps)}</span>
            </div>

            <div className="info-item">
              <label>{t('result.allocationEfficiency')}</label>
              <span className="value highlight">{result.allocationEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* VLSM Subnets Table */}
        <div className="result-section vlsm-section">
          <h3>{t('result.vlsmSubnets')}</h3>
          <div className="vlsm-info">
            <p>
              <strong>{t('result.hostRequirementsSorted')}</strong> {result.originalOrder?.join(', ') || t('result.notAvailable')}
            </p>
          </div>

          <div className="vlsm-subnets-cards">
            {result.subnets?.map((subnet, idx) => (
              <div className="vlsm-subnet-card" key={idx}>
                <div className="subnet-card-header">
                  <h4>{t('result.subnet')} {subnet.index + 1}</h4>
                  <span className="subnet-prefix-badge">/{subnet.prefix}</span>
                </div>
                
                <div className="subnet-card-grid">
                  {/* Required & Allocated */}
                  <div className="card-section">
                    <div className="info-row">
                      <div className="info-col">
                        <label>{t('result.requiredHosts')}</label>
                        <span className="value">{subnet.requiredHosts}</span>
                      </div>
                      <div className="info-col">
                        <label>{t('result.allocatedSize')}</label>
                        <span className="value">{subnet.blockSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Network & Broadcast */}
                  <div className="card-section">
                    <div className="info-full">
                      <label>{t('result.networkAddress')}</label>
                      <div className="copy-cell">
                        <span className="value">{subnet.network}</span>
                        <button
                          className="small-copy-btn"
                          onClick={() => onCopy(subnet.network, `${t('result.subnet')} ${subnet.index + 1} ${t('result.networkAddress')}`)}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div className="info-full">
                      <label>{t('result.broadcastAddress')}</label>
                      <div className="copy-cell">
                        <span className="value">{subnet.broadcast}</span>
                        <button
                          className="small-copy-btn"
                          onClick={() => onCopy(subnet.broadcast, `${t('result.subnet')} ${subnet.index + 1} ${t('result.broadcastAddress')}`)}
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
                        <label>{t('result.firstIp')}</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.firstUsableIp}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.firstUsableIp, `${t('result.subnet')} ${subnet.index + 1} ${t('result.firstIp')}`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-col">
                        <label>{t('result.lastIp')}</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.lastUsableIp}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.lastUsableIp, `${t('result.subnet')} ${subnet.index + 1} ${t('result.lastIp')}`)}
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
                        <label>{t('result.subnetMaskLabel')}</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.subnetMask}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.subnetMask, `${t('result.subnet')} ${subnet.index + 1} ${t('result.subnetMaskLabel')}`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-col">
                        <label>{t('result.usableHostsLabel')}</label>
                        <span className="value highlight">{subnet.usableHosts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          <div className="explanation-box vlsm-explanation">
            <strong>{t('result.vlsmAlgorithmLabel')}</strong>
            <ol>
              <li>{t('result.vlsmStep1')}</li>
              <li>{t('result.vlsmStep2')}</li>
              <li>{t('result.vlsmStep3')}</li>
              <li>{t('result.vlsmStep4')}</li>
            </ol>
          </div>
        </div>

        {/* Summary */}
        <div className="result-section vlsm-summary">
          <h3>{t('result.summaryLabel')}</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">{t('result.subnetsCreatedLabel')}</span>
              <span className="value">{result.subnets?.length || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">{t('result.ipsUsedLabel')}</span>
              <span className="value">
                {formatNumber(result.totalAllocatedIps)} / {formatNumber(result.baseTotalIps)}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">{t('result.efficiencyLabel')}</span>
              <span className="value highlight">{result.allocationEfficiency}%</span>
            </div>
            <div className="summary-item">
              <span className="label">{t('result.unusedIpsLabel')}</span>
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
          <h3>{t('result.networkInfo')}</h3>
          <button
            className="binary-toggle"
            onClick={() => setShowBinary(!showBinary)}
          >
            {showBinary ? t('binary.hide') : t('binary.show')}
          </button>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>{t('result.ipAddress')}</label>
            <div className="value-row">
              <span className="value">{result.ip}</span>
              <CopyButton text={result.ip} label={t('result.ipAddress')} />
            </div>
            {showBinary && <div className="binary">{result.ipBinary}</div>}
          </div>

          <div className="info-item">
            <label>{t('result.prefix')}</label>
            <div className="value-row">
              <span className="value">/{result.prefix}</span>
            </div>
          </div>

          <div className="info-item">
            <label>{t('result.subnetMask')}</label>
            <div className="value-row">
              <span className="value">{result.mask}</span>
              <CopyButton 
                text={result.mask} 
                label={t('result.subnetMask')}
                explainType="networkMask"
                explainData={{
                  value: result.mask,
                  prefix: result.prefix,
                  usableHosts: result.usableHosts,
                  totalIps: result.totalIps
                }}
              />
            </div>
            {showBinary && <div className="binary">{result.maskBinary}</div>}
          </div>

          <div className="info-item">
            <label>{t('result.networkAddress')}</label>
            <div className="value-row">
              <span className="value">{result.network}</span>
              <CopyButton 
                text={result.network} 
                label={t('result.networkAddress')}
                explainType="networkAddress"
                explainData={{
                  value: result.network,
                  ip: result.ip,
                  ipBinary: result.ipBinary,
                  prefix: result.prefix,
                  totalIps: result.totalIps,
                  usableHosts: result.usableHosts
                }}
              />
            </div>
          </div>

          <div className="info-item">
            <label>{t('result.broadcastAddress')}</label>
            <div className="value-row">
              <span className="value">{result.broadcast}</span>
              <CopyButton 
                text={result.broadcast} 
                label={t('result.broadcastAddress')}
                explainType="broadcastAddress"
                explainData={{
                  value: result.broadcast,
                  networkAddress: result.network,
                  totalIps: result.totalIps,
                  firstUsableIp: result.firstUsableIp,
                  lastUsableIp: result.lastUsableIp,
                  prefix: result.prefix
                }}
              />
            </div>
          </div>

          <div className="info-item">
            <label>{t('result.firstUsableIp')}</label>
            <div className="value-row">
              <span className="value">{result.firstUsableIp}</span>
              <CopyButton text={result.firstUsableIp} label={t('result.firstUsableIp')} />
            </div>
          </div>

          <div className="info-item">
            <label>{t('result.lastUsableIp')}</label>
            <div className="value-row">
              <span className="value">{result.lastUsableIp}</span>
              <CopyButton text={result.lastUsableIp} label={t('result.lastUsableIp')} />
            </div>
          </div>

          <div className="info-item">
            <label>{t('result.totalIps')}</label>
            <span className="value">{formatNumber(result.totalIps)}</span>
          </div>

          <div className="info-item">
            <label>{t('result.usableHosts')}</label>
            <span className="value">{formatNumber(result.usableHosts)}</span>
          </div>

          <div className="info-item">
            <label>{t('result.hostBits')}</label>
            <span className="value">{result.hostBits}</span>
          </div>
        </div>
      </div>

      {/* Subnetting Information */}
      {result.subnets && result.subnets.length > 0 && (
        <div className="result-section subnetting-section">
          <div className="section-header">
            <h3>{t('result.subnettingDetails')}</h3>
          </div>

          <div className="subnet-info-grid">
            <div className="subnet-info-item">
              <label>{t('result.originalPrefix')}</label>
              <span className="value">/{result.prefix}</span>
            </div>
            <div className="subnet-info-item">
              <label>{t('result.newPrefix')}</label>
              <span className="value highlight">/{result.newPrefix}</span>
            </div>
            <div className="subnet-info-item">
              <label>{t('result.subnetBitsUsed')}</label>
              <span className="value">{result.subnetBitsUsed}</span>
            </div>
            <div className="subnet-info-item">
              <label>{t('result.numberOfSubnets')}</label>
              <span className="value">{result.subnetCount}</span>
            </div>
            <div className="subnet-info-item">
              <label>{t('result.hostsPerSubnet')}</label>
              <span className="value">
                {formatNumber(Math.pow(2, 32 - result.newPrefix) - 2)}
              </span>
            </div>
          </div>

          <div className="explanation-box">
            <strong>{t('result.calculation')}</strong>
            {result.subnetBitsUsed > 0 && (
              <p>
                {t('result.toCreate')} {result.subnetCount} {result.subnetCount > 1 ? t('result.subnets') : t('result.subnet')},
                {t('result.weneed')} {result.subnetBitsUsed} {result.subnetBitsUsed > 1 ? t('result.bits') : t('result.bits')} (2
                <sup>{result.subnetBitsUsed}</sup> = {result.subnetCount}). {t('result.originalPrefixText')} /{result.prefix}
                + {result.subnetBitsUsed} {t('result.bits')} = /<strong>{result.newPrefix}</strong>
              </p>
            )}
          </div>

          {/* Subnets Cards */}
          <div className="subnets-section">
            <h4>{t('result.generatedSubnets')}</h4>
            <div className="subnets-cards">
              {result.subnets.map((subnet, idx) => (
                <div className="subnet-card" key={idx}>
                  <div className="subnet-card-header">
                    <h4>{t('result.subnet')} {subnet.index}</h4>
                    <span className="subnet-prefix-badge">/{result.newPrefix}</span>
                  </div>
                  
                  <div className="subnet-card-grid">
                    {/* Network & Broadcast */}
                    <div className="card-section">
                      <div className="info-full">
                        <label>{t('result.networkAddress')}</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.network}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.network, `${t('result.subnet')} ${subnet.index} ${t('result.networkAddress')}`)}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div className="info-full">
                        <label>{t('result.broadcastAddress')}</label>
                        <div className="copy-cell">
                          <span className="value">{subnet.broadcast}</span>
                          <button
                            className="small-copy-btn"
                            onClick={() => onCopy(subnet.broadcast, `${t('result.subnet')} ${subnet.index} ${t('result.broadcastAddress')}`)}
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
                          <label>{t('result.firstIp')}</label>
                          <div className="copy-cell">
                            <button 
                              className="value info-button"
                              onClick={() => openModal('firstIp', {
                                value: subnet.firstIp,
                                network: subnet.network,
                                lastIp: subnet.lastIp,
                                broadcast: subnet.broadcast,
                                subnetIndex: idx,
                                prefix: result.newPrefix,
                                blockSize: subnet.totalIps,
                                usableHosts: subnet.usableHosts,
                                maskBinary: subnet.maskBinary
                              })}
                              title={t('ui.explainClick')}
                            >
                              {subnet.firstIp}
                            </button>
                            <button
                              className="small-copy-btn"
                              onClick={() => onCopy(subnet.firstIp, `${t('result.subnet')} ${subnet.index} ${t('result.firstIp')}`)}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <div className="info-col">
                          <label>{t('result.lastIp')}</label>
                          <div className="copy-cell">
                            <button 
                              className="value info-button"
                              onClick={() => openModal('lastIp', {
                                value: subnet.lastIp,
                                network: subnet.network,
                                firstIp: subnet.firstIp,
                                broadcast: subnet.broadcast,
                                subnetIndex: idx,
                                prefix: result.newPrefix,
                                blockSize: subnet.totalIps,
                                usableHosts: subnet.usableHosts,
                                maskBinary: subnet.maskBinary
                              })}
                              title={t('ui.explainClick')}
                            >
                              {subnet.lastIp}
                            </button>
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
                          <label>{t('result.subnetMaskLabel')}</label>
                          <div className="copy-cell">
                            <button 
                              className="value info-button"
                              onClick={() => openModal('subnetMask', {
                                value: subnet.mask,
                                prefix: result.newPrefix,
                                usableHosts: subnet.usableHosts,
                                blockSize: subnet.totalIps,
                                maskBinary: subnet.maskBinary,
                                subnetIndex: idx
                              })}
                              title={t('ui.explainClick')}
                            >
                              {subnet.mask}
                            </button>
                            <button
                              className="small-copy-btn"
                              onClick={() => onCopy(subnet.mask, `Subnet ${subnet.index} Mask`)}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <div className="info-col">
                          <label>{t('result.usableHostsLabel')}</label>
                          <button 
                            className="value highlight info-button"
                            onClick={() => openModal('usableHosts', {
                              value: subnet.usableHosts,
                              blockSize: subnet.totalIps,
                              prefix: result.newPrefix,
                              subnetIndex: idx,
                              firstIp: subnet.firstIp,
                              lastIp: subnet.lastIp,
                              network: subnet.network,
                              broadcast: subnet.broadcast
                            })}
                            title={t('ui.explainClick')}
                          >
                            {formatNumber(subnet.usableHosts)}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total Info */}
                    <div className="card-section">
                      <div className="info-full">
                        <label>{t('result.totalIpsBlockSize')}</label>
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
      
      {/* Explanation Modal */}
      <ExplanationModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        type={modalData?.type} 
        data={modalData}
      />
    </div>
  );
};

export default ResultDisplay;
