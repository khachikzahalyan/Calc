import React, { useState } from 'react';
import { calculateSubnet } from '../utils/ip';
import { calculateVLSM } from '../utils/vlsm';
import ResultDisplay from './ResultDisplay';
import { useI18n } from '../contexts/I18nContext';
import './SubnetCalculator.css';

const SubnetCalculator = () => {
  const { t, language, changeLanguage } = useI18n();
  const [ip, setIp] = useState('10.0.0.0');
  const [prefix, setPrefix] = useState('24');
  const [numSubnets, setNumSubnets] = useState('');
  const [hostsPerSubnet, setHostsPerSubnet] = useState('');
  const [subnettingMode, setSubnettingMode] = useState('subnets');
  const [hostRequirements, setHostRequirements] = useState('9 1');
  const [calculatorMode, setCalculatorMode] = useState('standard');
  const [darkMode, setDarkMode] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastInputs, setLastInputs] = useState(null);
  const [toast, setToast] = useState(null);
  const resultsPanelRef = React.useRef(null);

  const getCurrentInputs = () => ({
    ip,
    prefix,
    numSubnets,
    hostsPerSubnet,
    hostRequirements,
    calculatorMode,
    subnettingMode,
  });

  const inputsChanged = () => {
    if (!lastInputs) return true;
    const current = getCurrentInputs();
    return JSON.stringify(current) !== JSON.stringify(lastInputs);
  };

  // Calculate only when button is clicked
  const handleCalculate = () => {
    if (!inputsChanged()) return;

    setLoading(true);
    
    setTimeout(() => {
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
      
      setLastInputs(getCurrentInputs());
      setLoading(false);
      setTimeout(() => {
        if (resultsPanelRef.current && window.innerWidth <= 1024) {
          resultsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 650);
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setToast(label);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className={`subnet-calculator ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="calculator-header">
        <h1 className="header-title">{t('title')}</h1>
        <div className="header-controls">
          <button
            className={`header-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
            title={t('language.en')}
          >
            ENG
          </button>
          <button
            className={`header-btn ${language === 'ru' ? 'active' : ''}`}
            onClick={() => changeLanguage('ru')}
            title={t('language.ru')}
          >
            РУС
          </button>
          <button
            className={`header-btn ${language === 'hy' ? 'active' : ''}`}
            onClick={() => changeLanguage('hy')}
            title={t('language.hy')}
          >
            ARM
          </button>
          <button
            className="header-btn dark-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={t('darkMode.toggle')}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
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
              onClick={() => { setCalculatorMode('standard'); setResult(null); setLastInputs(null); }}
            >
              {t('calculator.standardSubnetting')}
            </button>
            <button
              className={`mode-btn ${calculatorMode === 'vlsm' ? 'active' : ''}`}
              onClick={() => { setCalculatorMode('vlsm'); setResult(null); setLastInputs(null); }}
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
                <input
                  id="hosts-requirements"
                  type="text"
                  value={hostRequirements}
                  onChange={(e) => setHostRequirements(e.target.value)}
                  placeholder="100 50 20 10 5 2"
                  className="form-input"
                />
              </div>

            </>
          )}

          <button className="calculate-btn" onClick={handleCalculate}>
            {t('button.calculate')}
          </button>
        </div>

        {/* Results Panel */}
        <div className="results-panel" ref={resultsPanelRef}>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">{t('ui.loading') || 'Loading...'}</p>
            </div>
          ) : result ? (
            <ResultDisplay
              result={result}
              onCopy={handleCopyToClipboard}
              mode={subnettingMode}
              calculatorMode={calculatorMode}
            />
          ) : null}
        </div>
      </div>

      {toast && (
        <div className="copy-toast" key={toast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
};

export default SubnetCalculator;
