import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOpen, Lock, DollarSign, TrendingUp, PlusCircle } from 'lucide-react';
import { getToken, clearSession } from '../utils/auth';

export default function Caja() {
  const [estadoCaja, setEstadoCaja] = useState(null); // null = cargando, 'NO_ABIERTA', 'ABIERTA', 'CERRADA'
  const [datosCaja, setDatosCaja] = useState({});
  const [formularioApertura, setFormularioApertura] = useState({ tasa_bcv: '', tasa_usdt: '', saldo_inicial_bs: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const cargarEstadoCaja = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate('/login', { replace: true }); return; }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/caja/hoy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setEstadoCaja(data.estado);
        if (data.estado !== 'NO_ABIERTA') {
          setDatosCaja(data);
        } else {
          // Si no está abierta, traemos las tasas sugeridas (aunque vengan en 0 por ahora)
          const resTasas = await fetch(`${import.meta.env.VITE_API_URL}/api/caja/tasas`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resTasas.ok) {
            const tasas = await resTasas.json();
            setFormularioApertura(prev => ({
              ...prev,
              tasa_bcv: tasas.bcv || '',
              tasa_usdt: tasas.usdt || ''
            }));
          }
        }
      } else if (res.status === 401) {
        clearSession();
        navigate('/login');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    }
  }, [navigate]);

  useEffect(() => { cargarEstadoCaja(); }, [cargarEstadoCaja]);

  const manejarApertura = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/caja/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          saldo_inicial_bs: parseFloat(formularioApertura.saldo_inicial_bs),
          tasa_bcv: parseFloat(formularioApertura.tasa_bcv),
          tasa_usdt: parseFloat(formularioApertura.tasa_usdt)
        })
      });

      if (res.ok) {
        cargarEstadoCaja(); // Recargamos para ver la pantalla de "Caja Abierta"
      } else {
        const data = await res.json();
        setError(data.error || 'Error al abrir la caja');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  if (estadoCaja === null) return <div className="p-8 text-center animate-pulse font-bold text-gray-500">Verificando bóveda...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Control de Caja Diario</h1>
        <p className="mt-2 text-sm text-gray-600">Gestiona la apertura, inyecciones de capital y el cierre del día.</p>
      </div>

      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}

      {estadoCaja === 'NO_ABIERTA' && (
        <div className="max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-6 flex items-center gap-3">
            <LockOpen className="text-white" size={28} />
            <h2 className="text-xl font-bold text-white">Abrir Caja de Hoy</h2>
          </div>
          <form onSubmit={manejarApertura} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tasa BCV (Bs)</label>
                <input type="number" step="0.0001" required
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formularioApertura.tasa_bcv}
                  onChange={e => setFormularioApertura({...formularioApertura, tasa_bcv: e.target.value})}
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tasa USDT (Bs)</label>
                <input type="number" step="0.0001" required
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formularioApertura.tasa_usdt}
                  onChange={e => setFormularioApertura({...formularioApertura, tasa_usdt: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Saldo Inicial en Plataforma (Bs)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-bold">Bs.</span>
                <input type="number" step="0.01" required placeholder="Ej: 5245.91"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg font-black text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formularioApertura.saldo_inicial_bs}
                  onChange={e => setFormularioApertura({...formularioApertura, saldo_inicial_bs: e.target.value})}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Monto exacto con el que amaneció la plataforma de recargas.</p>
            </div>

            <button type="submit" disabled={cargando} className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-green-200">
              {cargando ? 'Abriendo...' : 'Iniciar Operaciones'}
            </button>
          </form>
        </div>
      )}

      {estadoCaja === 'ABIERTA' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Saldo Inicial</p>
              <p className="text-3xl font-black text-gray-900 mt-1">Bs. {datosCaja.saldo_inicial_bs}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Tasa BCV Fijada</p>
              <p className="text-3xl font-black text-blue-600 mt-1">Bs. {datosCaja.tasa_bcv}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center gap-2">
               <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold py-3 px-4 rounded-xl hover:bg-indigo-100 transition">
                 <PlusCircle size={20} /> Añadir Inversión
               </button>
               <button className="flex items-center justify-center gap-2 bg-red-50 text-red-700 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition">
                 <Lock size={20} /> Cerrar Caja (Arqueo)
               </button>
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
            <p className="font-bold">¡La caja está abierta y lista para operar!</p>
            <p className="text-sm mt-1">Al final del día, usa el botón de "Cerrar Caja" para ingresar el total de tus recargas y calcular la ganancia.</p>
          </div>
        </div>
      )}
    </div>
  );
}