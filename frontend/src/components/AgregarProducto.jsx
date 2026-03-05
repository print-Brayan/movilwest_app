import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearSession, getToken } from '../utils/auth';

export default function AgregarProducto() {
  const navigate = useNavigate();
  const location = useLocation();
  const productoBase = location.state?.productoBase;

  const [formData, setFormData] = useState({
    sku: '',
    categoria: productoBase?.categoria || 'SMARTPHONE',
    marca: productoBase?.marca || '',
    modelo: productoBase?.modelo || '',
    costo_usd: '',
    precio_venta_usd: '',
    stock: ''
  });
  const [foto, setFoto] = useState(null);
  const [fotoExistente, setFotoExistente] = useState(productoBase?.foto_url || null);
  const [preview, setPreview] = useState(productoBase?.foto_url ? `${import.meta.env.VITE_API_URL}${productoBase.foto_url}` : null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!productoBase) return;

    setFormData((prev) => ({
      ...prev,
      categoria: productoBase.categoria || 'SMARTPHONE',
      marca: productoBase.marca || '',
      modelo: productoBase.modelo || ''
    }));
    setFotoExistente(productoBase.foto_url || null);
    setPreview(productoBase.foto_url ? `${import.meta.env.VITE_API_URL}${productoBase.foto_url}` : null);
  }, [productoBase]);

  const manejarCambioFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoExistente(null);
      setPreview(URL.createObjectURL(file));
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setCargando(true);

    const token = getToken();
    if (!token) {
      setCargando(false);
      navigate('/login', { replace: true });
      return;
    }

    const data = new FormData();
    data.append('sku', formData.sku);
    data.append('categoria', formData.categoria);
    data.append('marca', formData.marca);
    data.append('modelo', formData.modelo);
    // Convertimos a números para evitar el error de base de datos que viste
    data.append('costo_usd', parseFloat(formData.costo_usd) || 0);
    data.append('precio_venta_usd', parseFloat(formData.precio_venta_usd) || 0);
    data.append('stock', parseInt(formData.stock) || 0);
    
    if (foto) {
      data.append('foto', foto);
    } else if (fotoExistente) {
      data.append('foto_url', fotoExistente);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/nuevo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        alert("¡Producto registrado con éxito!");
        navigate('/inventario');
      } else {
        const errorData = await res.json();
        if (res.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
          return;
        }
        alert("Error: " + (errorData.error || "No se pudo registrar"));
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h2 className="text-xl font-bold text-white text-center">Registro de Mercancía</h2>
        </div>

        <form onSubmit={enviarFormulario} className="p-6 space-y-4">
          {/* Cámara / Foto */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
            {preview ? (
              <img src={preview} alt="Vista previa" className="h-40 w-40 object-cover rounded-lg mb-2" />
            ) : (
              <p className="text-gray-400 text-xs">Opcional: Foto del equipo</p>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={manejarCambioFoto} className="text-xs" />
          </div>

          {/* Fila 1: SKU y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">SKU / Código</label>
              <input type="text" placeholder="Ej: RM13P" required className="w-full border p-2 rounded-lg"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
              <select className="w-full border p-2 rounded-lg bg-white"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                <option value="SMARTPHONE">Smartphone</option>
                <option value="ACCESORIO">Accesorio</option>
                <option value="REPUESTO">Repuesto</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Marca</label>
              <input type="text" placeholder="Xiaomi" required className="w-full border p-2 rounded-lg"
                value={formData.marca}
                onChange={(e) => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Modelo</label>
              <input type="text" placeholder="Redmi Note 13" required className="w-full border p-2 rounded-lg"
                value={formData.modelo}
                onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
            </div>
          </div>

          {/* Fila 3: Financiero (Costo vs Venta) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <label className="text-xs font-bold text-blue-700 uppercase">Costo (Inversión)</label>
              <input type="number" step="0.01" placeholder="0.00" required className="w-full border p-2 rounded-lg"
                value={formData.costo_usd}
                onChange={(e) => setFormData({...formData, costo_usd: e.target.value})} />
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <label className="text-xs font-bold text-green-700 uppercase">Precio Venta</label>
              <input type="number" step="0.01" placeholder="0.00" required className="w-full border p-2 rounded-lg"
                value={formData.precio_venta_usd}
                onChange={(e) => setFormData({...formData, precio_venta_usd: e.target.value})} />
            </div>
          </div>

          {/* Fila 4: Stock */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Cantidad en Inventario</label>
            <input type="number" placeholder="Ej: 5" required className="w-full border p-2 rounded-lg"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})} />
          </div>

          <button type="submit" disabled={cargando}
            className={`w-full py-3 rounded-xl font-bold text-white transition ${cargando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {cargando ? 'Guardando...' : 'Registrar Equipo'}
          </button>
          
          <button type="button" onClick={() => navigate('/inventario')} className="w-full text-gray-400 text-sm">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}