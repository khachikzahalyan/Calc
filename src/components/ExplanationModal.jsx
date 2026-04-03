import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import './ExplanationModal.css';

const ExplanationModal = ({ isOpen, onClose, type, data }) => {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'firstIp': {
        const subnetNum = data.subnetIndex + 1;
        return {
          title: t('modal.firstIpTitle').replace('{subnet}', subnetNum),
          value: data.value,
          explanation: t('modal.firstIpExplanation'),
          formula: [
            `${t('formula.networkAddress')}: ${data.network}`,
            `${t('formula.add1')}: ${data.network} + 1 = ${data.value}`,
            t('formula.firstHostAssignable'),
          ],
          example: `${t('formula.inThisSubnet')}:
• ${t('formula.networkAddressReserved')}: ${data.network}
• ${t('formula.firstUsableIp')}: ${data.value}
• ${t('formula.lastUsableIp')}: ${data.lastIp}
• ${t('formula.broadcastReserved')}: ${data.broadcast}`
        };
      }
      case 'lastIp': {
        const subnetNum = data.subnetIndex + 1;
        return {
          title: t('modal.lastIpTitle').replace('{subnet}', subnetNum),
          value: data.value,
          explanation: t('modal.lastIpExplanation'),
          formula: [
            `${t('formula.broadcastAddress')}: ${data.broadcast}`,
            `${t('formula.subtract1')}: ${data.broadcast} - 1 = ${data.value}`,
            t('formula.lastHostAssignable'),
          ],
          example: `${t('formula.inThisSubnet')}:
• ${t('formula.networkAddressReserved')}: ${data.network}
• ${t('formula.firstUsableIp')}: ${data.firstIp}
• ${t('formula.lastUsableIp')}: ${data.value}
• ${t('formula.broadcastReserved')}: ${data.broadcast}`
        };
      }
      case 'subnetMask': {
        const subnetNum = data.subnetIndex + 1;
        const prefix = data.prefix;
        const hostBits = 32 - prefix;
        return {
          title: t('modal.subnetMaskTitle').replace('{subnet}', subnetNum),
          value: data.value,
          explanation: t('modal.subnetMaskExplanation'),
          formula: [
            `${t('formula.prefix')}: /${prefix} ${t('formula.meansBits')} ${prefix} ${t('formula.networkBits')} + ${hostBits} ${t('formula.hostBits')}`,
            `${t('formula.networkBitsValue')}: ${prefix} ${t('formula.ones')}: ${data.value}`,
            `${t('formula.binaryRepresentation')}: ${' '.repeat(0)}${data.maskBinary?.substring(0, 16)}...${data.maskBinary?.substring(-16) || ''}`,
            `${t('formula.decimalRepresentation')}: ${data.value}`,
          ],
          example: `${t('formula.forPrefix')} /${prefix}:
• ${t('formula.networkBits')}: ${prefix} (${t('formula.onesInBinary')})
• ${t('formula.hostBits')}: ${hostBits} (${t('formula.zerosInBinary')})
• ${t('formula.subnetMask')}: ${data.value}
• ${t('formula.allowsForUsableHosts').replace('{hosts}', data.usableHosts)}`
        };
      }
      case 'usableHosts': {
        const subnetNum = data.subnetIndex + 1;
        const blockSize = data.blockSize;
        return {
          title: t('modal.usableHostsTitle').replace('{subnet}', subnetNum),
          value: data.value,
          explanation: t('modal.usableHostsExplanation'),
          formula: [
            `${t('formula.blockSize')} (${t('formula.totalIps')}): ${blockSize}`,
            `${t('formula.subtractNetworkAddress')}: 1`,
            `${t('formula.subtractBroadcastAddress')}: 1`,
            `${t('formula.usableHosts')} = ${blockSize} - 2 = ${data.value}`,
            `${t('formula.formula')}: 2^(32 - ${t('formula.prefix')}) - 2 = 2^(${32 - data.prefix}) - 2 = ${data.value}`,
          ],
          example: `${t('formula.inThisPrefix')} /${data.prefix} ${t('formula.subnet')}:
• ${t('formula.totalIpAddresses')}: ${blockSize}
• ${t('formula.networkAddressNotUsable')}: 1
• ${t('formula.broadcastAddressNotUsable')}: 1
• ${t('formula.usableHosts')}: ${data.value}
• ${t('formula.canSupport').replace('{devices}', data.value)}`
        };
      }
      case 'networkMask': {
        const prefix = data.prefix;
        const hostBits = 32 - prefix;
        const networkBits = prefix;
        
        // Generate binary representation safely
        const generateBinary = () => {
          let binary = '';
          for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0) binary += '.';
            binary += i < networkBits ? '1' : '0';
          }
          return binary;
        };
        
        return {
          title: t('modal.networkMaskTitle'),
          value: data.value,
          explanation: t('modal.networkMaskExplanation'),
          formula: [
            `/${prefix} = ${networkBits} ${t('formula.networkBits')} (${t('formula.ones')}) + ${hostBits} ${t('formula.hostBits')} (${t('formula.zeros')})`,
            `${t('formula.binary')}: ${generateBinary()}`,
            `${t('formula.decimalRepresentation')}: ${data.value}`,
            `Итого адресов: ${data.totalIps}, можно использовать ${data.usableHosts} ${t('formula.usableHostAddresses')}`,
          ],
          example: `Для /${prefix}:
• Сетевые биты: ${networkBits} (определяют сеть)
• Хост биты: ${hostBits} (определяют хост в сети)
• Маска: ${data.value}
• Всего адресов: ${data.totalIps}
• Можно использовать: ${data.usableHosts}
• На ${data.usableHosts} устройств`
        };
      }
      case 'networkAddress': {
        return {
          title: t('modal.networkAddressTitle'),
          value: data.value,
          explanation: t('modal.networkAddressExplanation'),
          formula: [
            `${t('formula.ipAddressBinary')}: ${data.ipBinary || t('formula.binaryFormOf') + ' ' + data.ip}`,
            `${t('formula.subnetMaskBinary')}`,
            `${t('formula.bitwiseAnd')}`,
            `${t('formula.result')}: ${data.value}`,
            t('formula.allHostBitsZero'),
          ],
          example: `${t('formula.networkAddress')}: ${data.value}
• ${t('formula.firstAddressNetwork')}
• ${t('formula.cannotAssignDevice')}
• ${t('formula.usedIdentifyNetwork')}
• ${t('formula.exampleClassUsed')} "${data.value}/${data.prefix}"`
        };
      }
      case 'broadcastAddress': {
        return {
          title: t('modal.broadcastAddressTitle'),
          value: data.value,
          explanation: t('modal.broadcastAddressExplanation'),
          formula: [
            `${t('formula.networkAddress')}: ${data.networkAddress}`,
            t('formula.setAllHostBits'),
            `${t('formula.result')}: ${data.value}`,
            `${t('formula.totalIpsInNetwork')}: ${data.totalIps}`,
            `${t('formula.broadcast')} = ${t('formula.networkAddress')} + (${data.totalIps} - 1)`,
          ],
          example: `${t('formula.broadcastAddress')}: ${data.value}
• ${t('formula.lastAddressNetwork')}
• ${t('formula.usedSendMessagesAll')}
• ${t('formula.cannotAssignDevice')}
• ${t('formula.networkSize')}: ${data.totalIps} ${t('formula.totalIpsLabel')}
• ${t('formula.firstIp')}: ${data.firstUsableIp}
• ${t('formula.lastIp')}: ${data.lastUsableIp}
• ${t('formula.broadcast')}: ${data.value}`
        };
      }
      default:
        return { title: t('modal.information'), value: '', explanation: '', formula: [], example: '' };
    }
  };

  const content = getContent();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        
        <h2 className="modal-title">{content.title}</h2>
        
        <div className="modal-body">
          <div className="modal-section value-section">
            <h3>{t('modal.value')}</h3>
            <div className="modal-value">
              <span className="value-text">{content.value}</span>
              <button 
                className="copy-btn-modal" 
                onClick={() => navigator.clipboard.writeText(content.value)}
                title={t('modal.copyToClipboard')}
              >
                📋 {t('modal.copy')}
              </button>
            </div>
          </div>

          <div className="modal-section explanation-section">
            <h3>{t('modal.explanation')}</h3>
            <p className="explanation-text">{content.explanation}</p>
          </div>

          <div className="modal-section formula-section">
            <h3>{t('modal.formulaCalculation')}</h3>
            <div className="formula-steps">
              {content.formula.map((step, idx) => (
                <div key={idx} className="formula-step">
                  <span className="step-number">{idx + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-section example-section">
            <h3>{t('modal.exampleInThisSubnet')}</h3>
            <pre className="example-text">{content.example}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;
