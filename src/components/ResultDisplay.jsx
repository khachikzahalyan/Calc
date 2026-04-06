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
      aria-label={explainType ? `${t('modal.explanation')} — ${label}` : `${t('modal.copy')} — ${label}`}
    >
      {explainType ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
    </button>
  );

  // Check for errors first
  if (!result || result.error) {
    const errorKey = result?.error || 'result.unknownError';
    return (
      <div className="result-error">
        <div className="error-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
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

          <div className="net-info-compact">
            <div className="net-row">
              <div className="net-field">
                <label>{t('result.baseNetwork')}</label>
                <div className="net-val">
                  <span className="value">{result.baseNetwork}/{result.basePrefix}</span>
                  <CopyButton
                    text={`${result.baseNetwork}/${result.basePrefix}`}
                    label={t('result.baseNetwork')}
                  />
                </div>
              </div>
              <div className="net-field">
                <label>{t('result.baseSubnetMask')}</label>
                <div className="net-val">
                  <span className="value">{result.baseMask}</span>
                  <CopyButton text={result.baseMask} label={t('result.baseSubnetMask')} />
                </div>
              </div>
              <div className="net-field">
                <label>{t('result.totalIpsInBaseNetwork')}</label>
                <span className="value">{formatNumber(result.baseTotalIps)}</span>
              </div>
            </div>
            <div className="net-row">
              <div className="net-field">
                <label>{t('result.ipsUsedLabel')}</label>
                <span className="value">{formatNumber(result.totalAllocatedIps)} / {formatNumber(result.baseTotalIps)}</span>
              </div>
              <div className="net-field">
                <label>{t('result.remainingIps')}</label>
                <span className="value">{formatNumber(result.remainingIps)}</span>
              </div>
              <div className="net-field">
                <label>{t('result.efficiencyLabel')}</label>
                <span className={`value efficiency-value ${parseFloat(result.allocationEfficiency) >= 80 ? 'eff-green' : parseFloat(result.allocationEfficiency) >= 30 ? 'eff-orange' : 'eff-red'}`}>
                  {result.allocationEfficiency}%
                </span>
              </div>
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

          <div className="subnets-table-wrap">
            <table className="subnets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('result.networkAddress')}</th>
                  <th>{t('result.ipRange')}</th>
                  <th>{t('result.broadcastAddress')}</th>
                  <th>{t('result.subnetMaskLabel')}</th>
                  <th>{t('result.requiredHosts')}</th>
                  <th>{t('result.usableHostsLabel')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.subnets?.map((subnet, idx) => (
                  <tr className="subnet-table-row" key={idx}>
                    <td data-label={t('result.subnet')} className="subnet-id-cell">
                      <span className="subnet-idx">{subnet.index + 1}</span>
                      <span className="subnet-prefix-badge table-badge">/{subnet.prefix}</span>
                    </td>
                    <td data-label={t('result.networkAddress')} className="mono-cell">
                      <button
                        className="table-info-btn"
                        onClick={() => openModal('networkAddress', {
                          value: subnet.network,
                          ip: result.baseNetwork,
                          prefix: subnet.prefix,
                          totalIps: subnet.blockSize,
                          usableHosts: subnet.usableHosts
                        })}
                        title={t('ui.explainClick')}
                      >
                        {subnet.network}
                      </button>
                    </td>
                    <td data-label={t('result.ipRange')} className="mono-cell">
                      <span className="ip-range-content">
                        <button
                          className="table-info-btn"
                          onClick={() => openModal('firstIp', {
                            value: subnet.firstUsableIp,
                            network: subnet.network,
                            lastIp: subnet.lastUsableIp,
                            broadcast: subnet.broadcast,
                            subnetIndex: idx,
                            prefix: subnet.prefix,
                            blockSize: subnet.blockSize,
                            usableHosts: subnet.usableHosts,
                            maskBinary: subnet.maskBinary
                          })}
                          title={t('ui.explainClick')}
                        >
                          {subnet.firstUsableIp}
                        </button>
                        <span className="range-sep">–</span>
                        <button
                          className="table-info-btn"
                          onClick={() => openModal('lastIp', {
                            value: subnet.lastUsableIp,
                            network: subnet.network,
                            firstIp: subnet.firstUsableIp,
                            broadcast: subnet.broadcast,
                            subnetIndex: idx,
                            prefix: subnet.prefix,
                            blockSize: subnet.blockSize,
                            usableHosts: subnet.usableHosts,
                            maskBinary: subnet.maskBinary
                          })}
                          title={t('ui.explainClick')}
                        >
                          {subnet.lastUsableIp}
                        </button>
                      </span>
                    </td>
                    <td data-label={t('result.broadcastAddress')} className="mono-cell">
                      <button
                        className="table-info-btn"
                        onClick={() => openModal('broadcastAddress', {
                          value: subnet.broadcast,
                          networkAddress: subnet.network,
                          totalIps: subnet.blockSize,
                          firstUsableIp: subnet.firstUsableIp,
                          lastUsableIp: subnet.lastUsableIp,
                          prefix: subnet.prefix
                        })}
                        title={t('ui.explainClick')}
                      >
                        {subnet.broadcast}
                      </button>
                    </td>
                    <td data-label={t('result.subnetMaskLabel')} className="mono-cell">
                      <button
                        className="table-info-btn"
                        onClick={() => openModal('subnetMask', {
                          value: subnet.subnetMask,
                          prefix: subnet.prefix,
                          usableHosts: subnet.usableHosts,
                          blockSize: subnet.blockSize,
                          maskBinary: subnet.maskBinary,
                          subnetIndex: idx
                        })}
                        title={t('ui.explainClick')}
                      >
                        {subnet.subnetMask}
                      </button>
                    </td>
                    <td data-label={t('result.requiredHosts')}>
                      {subnet.requiredHosts}
                    </td>
                    <td data-label={t('result.usableHostsLabel')} className="hosts-cell">
                      <button
                        className="table-info-btn highlight"
                        onClick={() => openModal('usableHosts', {
                          value: subnet.usableHosts,
                          blockSize: subnet.blockSize,
                          prefix: subnet.prefix,
                          subnetIndex: idx,
                          firstIp: subnet.firstUsableIp,
                          lastIp: subnet.lastUsableIp,
                          network: subnet.network,
                          broadcast: subnet.broadcast
                        })}
                        title={t('ui.explainClick')}
                      >
                        {subnet.usableHosts}
                      </button>
                    </td>
                    <td className="copy-cell-td">
                      <button
                        className="row-copy-btn"
                        onClick={() => onCopy(
                          `${subnet.network} | ${subnet.firstUsableIp} - ${subnet.lastUsableIp} | ${subnet.broadcast} | ${subnet.subnetMask} (/${subnet.prefix}) | Hosts: ${subnet.usableHosts}`,
                          `${t('result.subnet')} ${subnet.index + 1}`
                        )}
                        title={t('ui.copyClipboard')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </td>
                  </tr>
                )) || []}
              </tbody>
            </table>
          </div>

        </div>

        {/* Explanation Modal */}
        <ExplanationModal 
          isOpen={modalOpen} 
          onClose={closeModal} 
          type={modalData?.type} 
          data={modalData}
        />
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

        <div className="net-info-compact">
          <div className="net-row">
            <div className={`net-field${showBinary ? ' has-binary' : ''}`}>
              <label>{t('result.ipAddress')}</label>
              <div className="net-val">
                <span className="value">{result.ip}</span>
                <CopyButton text={result.ip} label={t('result.ipAddress')} />
              </div>
              {showBinary && <div className="binary">{result.ipBinary}</div>}
            </div>
            <div className="net-field">
              <label>{t('result.prefix')}</label>
              <span className="value">/{result.prefix}</span>
            </div>
            <div className={`net-field${showBinary ? ' has-binary' : ''}`}>
              <label>{t('result.subnetMask')}</label>
              <div className="net-val">
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
          </div>

          <div className="net-row">
            <div className="net-field">
              <label>{t('result.networkAddress')}</label>
              <div className="net-val">
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
            <div className="net-field">
              <label>{t('result.broadcastAddress')}</label>
              <div className="net-val">
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
            <div className="net-field">
              <label>{t('result.ipRange')}</label>
              <div className="net-val">
                <span className="value">{result.firstUsableIp}</span>
                <span className="range-sep">–</span>
                <span className="value">{result.lastUsableIp}</span>
              </div>
            </div>
          </div>

          <div className="net-row">
            <div className="net-field">
              <label>{t('result.totalIps')}</label>
              <span className="value">{formatNumber(result.totalIps)}</span>
            </div>
            <div className="net-field">
              <label>{t('result.usableHosts')}</label>
              <span className="value highlight">{formatNumber(result.usableHosts)}</span>
            </div>
            <div className="net-field">
              <label>{t('result.hostBits')}</label>
              <span className="value">{result.hostBits}</span>
            </div>
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

          {/* Subnets Table */}
          <div className="subnets-section">
            <h4>{t('result.generatedSubnets')}</h4>
            <div className="subnets-table-wrap">
              <table className="subnets-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('result.networkAddress')}</th>
                    <th>{t('result.ipRange')}</th>
                    <th>{t('result.broadcastAddress')}</th>
                    <th>{t('result.subnetMaskLabel')}</th>
                    <th>{t('result.usableHostsLabel')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.subnets.map((subnet, idx) => (
                    <tr className="subnet-table-row" key={idx}>
                      <td data-label={t('result.subnet')} className="subnet-id-cell">
                        <span className="subnet-idx">{subnet.index}</span>
                        <span className="subnet-prefix-badge table-badge">/{result.newPrefix}</span>
                      </td>
                      <td data-label={t('result.networkAddress')} className="mono-cell">
                        {subnet.network}
                      </td>
                      <td data-label={t('result.ipRange')} className="mono-cell">
                        <span className="ip-range-content">
                          <button
                            className="table-info-btn"
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
                          <span className="range-sep">–</span>
                          <button
                            className="table-info-btn"
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
                        </span>
                      </td>
                      <td data-label={t('result.broadcastAddress')} className="mono-cell">
                        {subnet.broadcast}
                      </td>
                      <td data-label={t('result.subnetMaskLabel')} className="mono-cell">
                        <button
                          className="table-info-btn"
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
                      </td>
                      <td data-label={t('result.usableHostsLabel')} className="hosts-cell">
                        <button
                          className="table-info-btn highlight"
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
                      </td>
                      <td className="copy-cell-td">
                        <button
                          className="row-copy-btn"
                          onClick={() => onCopy(
                            `${subnet.network} | ${subnet.firstIp} - ${subnet.lastIp} | ${subnet.broadcast} | ${subnet.mask} | Hosts: ${subnet.usableHosts}`,
                            `${t('result.subnet')} ${subnet.index}`
                          )}
                          title={t('ui.copyClipboard')}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
