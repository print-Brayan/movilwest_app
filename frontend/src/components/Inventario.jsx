import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fotoEnGrande, setFotoEnGrande] = useState(null);
  const [productoVenta, setProductoVenta] = useState(null);
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const timeoutExitoRef = useRef(null);

  const cargarProductos = useCallback(async () => {
    const token = localStorage.getItem('token_movilwest');
    if (!token) { navigate('/login'); return; }

    try {
      setError('');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(datos);
      } else {
        localStorage.removeItem('token_movilwest');
        navigate('/login');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  }, [navigate]);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;

    return productos.filter((producto) =>
      (producto.sku || '').toLowerCase().includes(termino) ||
      (producto.marca || '').toLowerCase().includes(termino) ||
      (producto.modelo || '').toLowerCase().includes(termino)
    );
  }, [productos, busqueda]);

  const ejecutarVenta = async () => {
    const token = localStorage.getItem('token_movilwest');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/vender/${productoVenta.producto_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cantidad: parseInt(cantidadVenta, 10) })
    });

    if (res.ok) {
      setProductoVenta(null);
      setCantidadVenta(1);
      await cargarProductos();
      setMensajeExito('✅ ¡Venta registrada! La ganancia ya está en tu flujo de caja.');
      if (timeoutExitoRef.current) {
        clearTimeout(timeoutExitoRef.current);
      }
      timeoutExitoRef.current = setTimeout(() => setMensajeExito(''), 4000);
    } else {
      const errorData = await res.json();
      setError(errorData.error || 'No se pudo registrar la venta');
    }
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    const token = localStorage.getItem('token_movilwest');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      await cargarProductos();
      setMensajeExito('✅ Producto eliminado correctamente.');
      if (timeoutExitoRef.current) {
        clearTimeout(timeoutExitoRef.current);
      }
      timeoutExitoRef.current = setTimeout(() => setMensajeExito(''), 4000);
    }
  };

  useEffect(() => {
    cargarProductos();
    return () => {
      if (timeoutExitoRef.current) {
        clearTimeout(timeoutExitoRef.current);
      }
    };
  }, [cargarProductos]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Movilwest</h1>
            <p className="text-gray-500 font-medium">Inventario de Equipos</p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={() => navigate('/agregar-producto')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-100 font-bold transition">
              + Nuevo Equipo
            </button>
            <button onClick={() => navigate('/recargas')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 font-bold transition">
              Recargas
            </button>
            <button onClick={() => { localStorage.removeItem('token_movilwest'); navigate('/login'); }} className="bg-white text-red-500 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition">
              Salir
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <input 
            type="text"
            placeholder="Buscar por SKU, Marca o Modelo..."
            className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-2xl">🔍</span>
        </div>

        {mensajeExito && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="font-bold text-lg flex items-center">
              {mensajeExito}
            </p>
          </div>
        )}

        {error && <p className="bg-red-100 text-red-600 p-4 rounded-xl mb-4 text-center font-bold">{error}</p>}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Foto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">SKU / Modelo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.producto_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      {producto.foto_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${producto.foto_url}`}
                          alt={producto.modelo}
                          onClick={() => setFotoEnGrande(`${import.meta.env.VITE_API_URL}${producto.foto_url}`)}
                          className="h-14 w-14 object-cover rounded-xl shadow-sm border-2 border-white cursor-zoom-in hover:scale-105 transition"
                        />
                      ) : (
                        <div className="h-14 w-14 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200">Sin foto</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-bold text-base">{producto.marca} {producto.modelo}</p>
                      <p className="text-gray-400 font-mono text-xs">{producto.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-blue-600 font-black text-lg">${producto.precio_venta_usd}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {producto.stock} UDS
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => { setProductoVenta(producto); setCantidadVenta(1); }} disabled={producto.stock <= 0} className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition ${producto.stock > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          Vender
                        </button>
                        <button
                          onClick={() => navigate('/agregar-producto', { state: { productoBase: producto } })}
                          className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition"
                          title="Duplicar producto"
                        >
                          Duplicar
                        </button>
                        <button onClick={() => manejarEliminar(producto.producto_id)} className="px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-bold text-sm transition">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productosFiltrados.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">No se encontraron productos con ese nombre.</div>
          )}
        </div>

        {productoVenta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-2xl font-black text-gray-800 mb-2">Registrar Venta</h3>
              <p className="text-gray-500 mb-6 italic">{productoVenta.marca} {productoVenta.modelo}</p>
              
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-8">
                <button onClick={() => setCantidadVenta(Math.max(1, cantidadVenta - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm text-2xl font-bold">-</button>
                <span className="text-4xl font-black text-blue-600">{cantidadVenta}</span>
                <button onClick={() => setCantidadVenta(Math.min(productoVenta.stock, parseInt(cantidadVenta) + 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm text-2xl font-bold">+</button>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setProductoVenta(null)} className="flex-1 py-4 text-gray-400 font-bold">Cancelar</button>
                <button onClick={ejecutarVenta} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">Confirmar Venta</button>
              </div>
            </div>
          </div>
        )}

        {fotoEnGrande && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setFotoEnGrande(null)}>
            <img src={fotoEnGrande} alt="Ampliada" className="max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}