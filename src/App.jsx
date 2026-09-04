import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboardCliente/Dashboard';
import Login from './pages/login';
import Agendamento from './pages/agendamento';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboardCliente" element={<Dashboard />} />
      <Route path="/agendamento" element={<Agendamento />} />
    </Routes>
  );
}

export default App;