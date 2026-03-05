import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getToken } from '../utils/auth';

export default function Recargas() {
  const [tipoServicio, setTipoServicio] = useState('MOVILNET');
  const [montoInvertido, setMontoInvertido] = useState('');
  const [montoGenerado, setMontoGenerado] = useState('');
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cargarHistorial = useCallback(async () => {
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recargas/hoy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setHistorial(await res.json());
      } else if (res.status === 401) {
        clearSession();
        navigate('/login', { replace: true });
      }
    } catch {
      setError('Error al cargar el historial de recargas');
    }
  }, [navigate]);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje(null);

    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
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
        if (respuesta.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
          return;
        }
        setError(datos.error || 'Error al registrar la recarga');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const inversionTotal = historial.reduce((acc, item) => acc + Number(item.monto_invertido || 0), 0);
  const gananciaTotal = historial.reduce(
    (acc, item) => acc + (Number(item.monto_generado || 0) - Number(item.monto_invertido || 0)),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-4 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Registrar Recarga</h3>
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200 mt-2"
              >
                Registrar Transacción
              </button>
            </form>
          </section>

          <section className="lg:col-span-8 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-bold">Inversión Total</p>
                <p className="text-2xl font-black text-blue-800">${inversionTotal.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 uppercase font-bold">Ganancia Neta</p>
                <p className="text-2xl font-black text-green-800">${gananciaTotal.toFixed(2)}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-700 mb-4">Movimientos de Hoy</h3>
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Servicio</th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Invertido</th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Generado</th>
                      <th scope="col" className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {historial.map((item) => {
                      const invertido = Number(item.monto_invertido || 0);
                      const generado = Number(item.monto_generado || 0);
                      const ganancia = generado - invertido;

                      return (
                        <tr key={item.control_recarga_id} className="hover:bg-gray-50 transition-colors">
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-blue-700">{item.tipo_servicio}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">${invertido.toFixed(2)}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-green-700 font-semibold">${generado.toFixed(2)}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-bold">
                            <span className={ganancia > 0 ? 'text-green-600' : 'text-gray-500'}>${ganancia.toFixed(2)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {historial.length === 0 && (
              <div className="text-center text-gray-500 italic py-4">No hay transacciones registradas hoy.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}