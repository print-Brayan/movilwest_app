import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Recargas() {
  const [tipoServicio, setTipoServicio] = useState('MOVILNET');
  const [montoInvertido, setMontoInvertido] = useState('');
  const [montoGenerado, setMontoGenerado] = useState('');
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cargarHistorial = async () => {
    const token = localStorage.getItem('token_movilwest');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recargas/hoy`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setHistorial(await res.json());
  };

  useEffect(() => { cargarHistorial(); }, []);

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje(null);

    const token = localStorage.getItem('token_movilwest');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Usamos tu IP para que funcione en el celular
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/recargas/nueva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo_servicio: tipoServicio,
          monto_invertido: parseFloat(montoInvertido),
          monto_generado: parseFloat(montoGenerado)
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        // Mostramos la ganancia calculada por el backend
        setMensaje(`✅ Recarga registrada. Ganancia neta: $${datos.ganancia_neta}`);
        setMontoInvertido('');
        setMontoGenerado('');
        cargarHistorial();
      } else {
        setError(datos.error || 'Error al registrar la recarga');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            
            {/* Menú de navegación superior */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-blue-700">Control de Recargas</h2>
                <button 
                    onClick={() => navigate('/inventario')}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded transition"
                >
                    ← Volver al Inventario
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm font-bold">{mensaje}</div>}

            <form onSubmit={manejarRegistro} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Servicio</label>
                    <select
                        value={tipoServicio}
                        onChange={(e) => setTipoServicio(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="MOVILNET">Movilnet</option>
                        <option value="AGUA">Servicio de Agua</option>
                        <option value="GAS">Servicio de Gas</option>
                        <option value="ASEO">Servicio de Aseo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Monto Invertido (Costo)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={montoInvertido}
                            onChange={(e) => setMontoInvertido(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Ej: 10.00"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Monto Generado (Venta)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={montoGenerado}
                            onChange={(e) => setMontoGenerado(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                            placeholder="Ej: 12.50"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200 mt-4"
                >
                    Registrar Transacción
                </button>
            </form>
            {/* Espaciado extra entre el formulario y las tarjetas */}
            <div className="my-8"></div>
            {/* Tarjetas de Resumen Financiero */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 uppercase font-bold">Inversión Total</p>
                            <p className="text-2xl font-black text-blue-800">
                            ${historial.reduce((acc, item) => acc + item.invertido, 0).toFixed(2)}
                            </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 uppercase font-bold">Ganancia Neta</p>
                            <p className="text-2xl font-black text-green-800">
                            ${historial.reduce((acc, item) => acc + item.ganancia, 0).toFixed(2)}
                            </p>
                    </div>
            </div>
            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Ventas de Hoy</h3>
                <div className="space-y-2">
                    {historial.map(item => (
                        <div key={item.id} className="flex justify-between bg-gray-50 p-3 rounded-md border text-sm">
                            <div>
                                <span className="font-bold text-blue-600">{item.servicio}</span>
                                <p className="text-gray-500">Invertido: ${item.invertido}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">+${item.generado}</p>
                                <p className="text-xs text-gray-400">Ganancia: ${item.ganancia.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
}