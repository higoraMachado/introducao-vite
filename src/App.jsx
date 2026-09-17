import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboardCliente/Dashboard';
import Login from './pages/login';
import Agendamento from './pages/agendamento';
<<<<<<< HEAD
import RecuperacaoSenha from './pages/recuperacaoSenha/recuperacao';
import Clientes from './pages/clientesGerenciamento/Clientes';

=======
>>>>>>> 4917432d8e5cb6b10d5e02313cfb5b546388473b
import Perfil from './pages/perfil/Perfil';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboardCliente" element={<Dashboard />} />
      <Route path="/agendamento" element={<Agendamento />} />
<<<<<<< HEAD
      <Route path="/recuperacaoSenha" element={<RecuperacaoSenha/>} />
      <Route path="/GerenciamentoCliente" element={<Clientes/>} />
      <Route path="/perfil" element={<Perfil />} />

=======
      <Route path="/perfil" element={<Perfil />} />
>>>>>>> 4917432d8e5cb6b10d5e02313cfb5b546388473b
    </Routes>
  );
}

export default App;