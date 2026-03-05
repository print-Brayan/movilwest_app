import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Inventario from './components/Inventario';
import Recargas from './components/Recargas';
import AgregarProducto from './components/AgregarProducto';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Si entran a la dirección vacía, los enviamos al Login automáticamente */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Nuestras dos pantallas principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/recargas" element={<Recargas />} />
        <Route path="/agregar-producto" element={<AgregarProducto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;