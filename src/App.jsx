import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ScannerModal from './components/ScannerModal';
import { Toast, Ticker } from './components/ui';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Escaner from './pages/Escaner';
import Voz from './pages/Voz';
import Semaforo from './pages/Semaforo';
import Comunidad from './pages/Comunidad';
import Asistente from './pages/Asistente';
import Capital from './pages/Capital';
import Score from './pages/Score';
import './styles/global.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <TopBar />
          <div className="layout">
            <Sidebar />
            <main className="main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/escaner" element={<Escaner />} />
                <Route path="/voz" element={<Voz />} />
                <Route path="/semaforo" element={<Semaforo />} />
                <Route path="/comunidad" element={<Comunidad />} />
                <Route path="/asistente" element={<Asistente />} />
                <Route path="/capital" element={<Capital />} />
                <Route path="/score" element={<Score />} />
              </Routes>
            </main>
          </div>
          <Ticker />
          <ScannerModal />
          <Toast />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
