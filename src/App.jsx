import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboardCliente/Dashboard';
import Login from './pages/login';
import Agendamento from './pages/agendamento';
import RecuperacaoSenha from './pages/recuperacaoSenha/recuperacao';
import Clientes from './pages/clientesGerenciamento/Clientes';

import Perfil from './pages/perfil/Perfil';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboardCliente" element={<Dashboard />} />
      <Route path="/agendamento" element={<Agendamento />} />
      <Route path="/recuperacaoSenha" element={<RecuperacaoSenha/>} />
      <Route path="/GerenciamentoCliente" element={<Clientes/>} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}

export default App;