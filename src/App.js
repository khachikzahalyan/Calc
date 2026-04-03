import './App.css';
import SubnetCalculator from './components/SubnetCalculator';
import { I18nProvider } from './contexts/I18nContext';

function App() {
  return (
    <I18nProvider>
      <SubnetCalculator />
    </I18nProvider>
  );
}

export default App;
