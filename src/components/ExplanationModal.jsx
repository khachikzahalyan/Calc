import React from 'react';
import './ExplanationModal.css';

const ExplanationModal = ({ isOpen, onClose, type, data }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'firstIp': {
        const subnetNum = data.subnetIndex + 1;
        return {
          title: `First Usable IP - Subnet ${subnetNum}`,
          value: data.value,
          explanation: `The first usable IP address in this subnet. After the network address, the first IP becomes usable for host assignment.`,
          formula: [
            `Network Address: ${data.network}`,
            `Add 1 to network address: ${data.network} + 1 = ${data.value}`,
            `This is the first host-assignable address in the subnet.`,
          ],
          example: `In this subnet:
• Network Address (reserved): ${data.network}
• First Usable IP (first host): ${data.value}
• Last Usable IP: ${data.lastIp}
• Broadcast Address (reserved): ${data.broadcast}`
        };
      }
      case 'lastIp': {
        const subnetNum = data.subnetIndex + 1;
        return {
          title: `Last Usable IP - Subnet ${subnetNum}`,
          value: data.value,
          explanation: `The last usable IP address in this subnet. It's one address before the broadcast address.`,
          formula: [
            `Broadcast Address: ${data.broadcast}`,
            `Subtract 1 from broadcast: ${data.broadcast} - 1 = ${data.value}`,
            `This is the last host-assignable address in the subnet.`,
          ],
          example: `In this subnet:
• Network Address (reserved): ${data.network}
• First Usable IP: ${data.firstIp}
• Last Usable IP (last host): ${data.value}
• Broadcast Address (reserved): ${data.broadcast}`
        };
      }
      case 'subnetMask': {
        const subnetNum = data.subnetIndex + 1;
        const prefix = data.prefix;
        const hostBits = 32 - prefix;
        return {
          title: `Subnet Mask - Subnet ${subnetNum}`,
          value: data.value,
          explanation: `The subnet mask defines which bits identify the network and which identify hosts within that network.`,
          formula: [
            `Prefix: /${prefix} means ${prefix} network bits + ${hostBits} host bits`,
            `Network bits: ${prefix} ones = ${data.value.split('.')[0]}.${data.value.split('.')[1]}.${data.value.split('.')[2]}.${data.value.split('.')[3]}`,
            `Binary representation: ${' '.repeat(0)}${data.maskBinary?.substring(0, 16)}...${data.maskBinary?.substring(-16) || ''}`,
            `Decimal representation: ${data.value}`,
          ],
          example: `For /${prefix} prefix:
• Network bits: ${prefix} (ones in binary)
• Host bits: ${hostBits} (zeros in binary)
• Subnet Mask: ${data.value}
• This allows for ${data.usableHosts} usable host addresses`
        };
      }
      case 'usableHosts': {
        const subnetNum = data.subnetIndex + 1;
        const blockSize = data.blockSize;
        return {
          title: `Usable Hosts - Subnet ${subnetNum}`,
          value: data.value,
          explanation: `Total number of IP addresses that can be assigned to devices in this subnet, excluding network and broadcast addresses.`,
          formula: [
            `Block Size (Total IPs): ${blockSize}`,
            `Subtract Network Address: 1`,
            `Subtract Broadcast Address: 1`,
            `Usable Hosts = ${blockSize} - 2 = ${data.value}`,
            `Formula: 2^(32 - Prefix) - 2 = 2^(${32 - data.prefix}) - 2 = ${data.value}`,
          ],
          example: `In this /${data.prefix} subnet:
• Total IP addresses: ${blockSize}
• Network Address (not usable): 1
• Broadcast Address (not usable): 1
• Usable Hosts: ${data.value}
• This subnet can support ${data.value} devices`
        };
      }
      default:
        return { title: 'Information', value: '', explanation: '', formula: [], example: '' };
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
            <h3>Value</h3>
            <div className="modal-value">
              <span className="value-text">{content.value}</span>
              <button 
                className="copy-btn-modal" 
                onClick={() => navigator.clipboard.writeText(content.value)}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="modal-section explanation-section">
            <h3>Explanation</h3>
            <p className="explanation-text">{content.explanation}</p>
          </div>

          <div className="modal-section formula-section">
            <h3>Formula & Calculation</h3>
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
            <h3>Example in This Subnet</h3>
            <pre className="example-text">{content.example}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;
