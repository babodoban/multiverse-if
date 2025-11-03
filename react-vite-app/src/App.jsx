import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { LandingPage } from './pages/LandingPage';
import { BasicInfoPage } from './pages/BasicInfoPage';
import { ScenarioInputPage } from './pages/ScenarioInputPage';
import { LoadingPage } from './pages/LoadingPage';
import { ResultPage } from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/if-start" />} />
          <Route path="/if-start" element={<LandingPage />} />
          <Route path="/basic-info" element={<BasicInfoPage />} />
          <Route path="/scenario" element={<ScenarioInputPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
