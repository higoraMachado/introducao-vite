import { Routes, Route } from 'react-router-dom';

import Home from './pages/home';
import Atividades from './pages/atividades';
import Exemplos from './pages/exemplos';


function App() {

  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/atividades" element={<Atividades />} />
      <Route path="/exemplos" element={<Exemplos />} />

    </Routes>
  )
}

export default App;