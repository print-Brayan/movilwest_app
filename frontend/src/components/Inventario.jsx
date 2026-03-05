import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Search, Plus, Trash2, Copy, DollarSign } from 'lucide-react';
import { clearSession, getToken } from '../utils/auth';

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
    const token = getToken();
    if (!token) { navigate('/login', { replace: true }); return; }

    try {
      setError('');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setProductos(datos);
      } else {
        clearSession();
        navigate('/login', { replace: true });
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
    const token = getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/productos/vender/${productoVenta.producto_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cantidad: parseInt(cantidadVenta, 10) })
    });

    if (res.ok) {
      // 1. Capturamos la respuesta del backend que trae el nuevo stock exacto
      const data = await res.json(); 

      // 2. Actualizamos la lista en la memoria de React (¡El cambio es instantáneo!)
      setProductos(productosActuales => 
        productosActuales.map(p => 
          p.producto_id === productoVenta.producto_id 
            ? { ...p, stock: data.nuevo_stock } // Modificamos solo el producto que se vendió
            : p
        )
      );

      // 3. Limpiamos y cerramos el modal
      setProductoVenta(null);
      setCantidadVenta(1);
      
      // 4. Mostramos el mensaje de éxito
      setMensajeExito(`✅ ¡Venta de ${productoVenta.modelo} registrada!`);
      setTimeout(() => setMensajeExito(''), 4000);
      
    } else {
      const errorData = await res.json();
      alert(errorData.error);
    }
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    const token = getToken();
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Smartphone size={20} />
            </div>
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Inventario Movilwest</h1>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Listado completo de equipos, precios de venta y existencias en tiempo real.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3 flex">
          <button
            onClick={() => navigate('/agregar-producto')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="inline-block mr-1" size={16} /> Nuevo equipo
          </button>
          <button
            onClick={() => { clearSession(); navigate('/login', { replace: true }); }}
            className="block rounded-md border border-red-200 bg-white px-3 py-2 text-center text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mt-6 relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Buscar equipo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {mensajeExito && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 text-green-700 font-medium rounded shadow-sm">
          {mensajeExito}
        </div>
      )}

      {error && <p className="mt-4 bg-red-100 text-red-600 p-4 rounded-xl text-center font-bold">{error}</p>}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200">
              <div className="max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Foto
                      </th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        SKU
                      </th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Marca y Modelo
                      </th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Precio
                      </th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">
                        Stock
                      </th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pr-6">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.producto_id} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {producto.foto_url ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${producto.foto_url}`}
                              alt={producto.modelo}
                              onClick={() => setFotoEnGrande(`${import.meta.env.VITE_API_URL}${producto.foto_url}`)}
                              className="h-10 w-10 flex-none rounded-lg bg-gray-800 object-cover cursor-zoom-in border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 flex-none rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-300">N/A</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500">{producto.sku}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {producto.marca} <span className="text-gray-500">{producto.modelo}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-indigo-600 font-bold">${producto.precio_venta_usd}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${producto.stock > 0 ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                            {producto.stock} uds
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                          <button
                            onClick={() => { setProductoVenta(producto); setCantidadVenta(1); }}
                            disabled={producto.stock <= 0}
                            className={`inline-flex items-center gap-1 ${producto.stock > 0 ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-300 cursor-not-allowed'} font-bold`}
                          >
                            <DollarSign size={16} />
                            Vender
                          </button>
                          <button onClick={() => navigate('/agregar-producto', { state: { productoBase: producto } })} className="text-gray-600 hover:text-gray-900 align-middle" title="Duplicar producto">
                            <Copy size={16} />
                          </button>
                          <button onClick={() => manejarEliminar(producto.producto_id)} className="text-red-600 hover:text-red-900 align-middle" title="Eliminar producto">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {productosFiltrados.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic">No se encontraron productos con ese nombre.</div>
        )}

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