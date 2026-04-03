import React, { useState } from 'react';
import { calculateSubnet } from '../utils/ip';
import { calculateVLSM } from '../utils/vlsm';
import ResultDisplay from './ResultDisplay';
import { useI18n } from '../contexts/I18nContext';
import './SubnetCalculator.css';

const SubnetCalculator = () => {
  const { t, language, changeLanguage } = useI18n();
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

  // Calculate only when button is clicked
  const handleCalculate = () => {
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

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className={`subnet-calculator ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="calculator-header">
        <div className="header-content">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
        <div className="header-controls">
          <div className="language-selector">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              title={t('language.en')}
            >
              ENG
            </button>
            <button
              className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
              onClick={() => changeLanguage('ru')}
              title={t('language.ru')}
            >
              РУС
            </button>
            <button
              className={`lang-btn ${language === 'hy' ? 'active' : ''}`}
              onClick={() => changeLanguage('hy')}
              title={t('language.hy')}
            >
              ARM
            </button>
          </div>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={t('darkMode.toggle')}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="calculator-container">
        {/* Input Panel */}
        <div className="input-panel">
          {/* Calculator Mode Toggle */}
          <div className="section-title">{t('calculator.mode')}</div>
          <div className="mode-selector" style={{ marginBottom: '24px' }}>
            <button
              className={`mode-btn ${calculatorMode === 'standard' ? 'active' : ''}`}
              onClick={() => setCalculatorMode('standard')}
            >
              {t('calculator.standardSubnetting')}
            </button>
            <button
              className={`mode-btn ${calculatorMode === 'vlsm' ? 'active' : ''}`}
              onClick={() => setCalculatorMode('vlsm')}
            >
              {t('calculator.vlsm')}
            </button>
          </div>

          <div className="section-title">{t('network.information')}</div>

          <div className="form-group">
            <label htmlFor="ip-input">{t('network.baseIpAddress')}</label>
            <input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={t('network.example10000')}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prefix-input">{t('network.baseCidrPrefix')}</label>
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
                {t('subnetting.options')}
              </div>

              <div className="mode-selector">
                <button
                  className={`mode-btn ${subnettingMode === 'subnets' ? 'active' : ''}`}
                  onClick={() => setSubnettingMode('subnets')}
                >
                  {t('subnetting.byNumberOfSubnets')}
                </button>
                <button
                  className={`mode-btn ${subnettingMode === 'hosts' ? 'active' : ''}`}
                  onClick={() => setSubnettingMode('hosts')}
                >
                  {t('subnetting.byHostsPerSubnet')}
                </button>
              </div>

              {subnettingMode === 'subnets' && (
                <div className="form-group">
                  <label htmlFor="subnets-input">{t('subnetting.numberOfSubnets')}</label>
                  <input
                    id="subnets-input"
                    type="number"
                    value={numSubnets}
                    onChange={(e) => setNumSubnets(e.target.value)}
                    min="1"
                    placeholder={t('subnetting.example3')}
                    className="form-input"
                  />
                </div>
              )}

              {subnettingMode === 'hosts' && (
                <div className="form-group">
                  <label htmlFor="hosts-input">{t('subnetting.hostsPerSubnet')}</label>
                  <input
                    id="hosts-input"
                    type="number"
                    value={hostsPerSubnet}
                    onChange={(e) => setHostsPerSubnet(e.target.value)}
                    min="1"
                    placeholder={t('subnetting.example250')}
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
                {t('vlsm.hostRequirements')}
              </div>

              <div className="form-group">
                <label htmlFor="hosts-requirements">
                  {t('vlsm.requiredHosts')}
                  <span className="subtitle">
                    {t('vlsm.spaceSeparated')}
                  </span>
                </label>
                <textarea
                  id="hosts-requirements"
                  value={hostRequirements}
                  onChange={(e) => setHostRequirements(e.target.value)}
                  placeholder={t('vlsm.example')}
                  className="form-input textarea-input"
                  rows="3"
                />
              </div>

              <div className="info-box">
                <p>
                  <strong>{t('vlsm.howItWorks')}</strong> {t('vlsm.description')}
                </p>
              </div>
            </>
          )}

          <button className="calculate-btn" onClick={handleCalculate}>
            {t('button.calculate')}
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
        <p>{t('footer')}</p>
      </div>
    </div>
  );
};

export default SubnetCalculator;
