import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getToken, clearSession } from '../utils/auth';

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const COLORES = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'];

  useEffect(() => {
    const cargarEstadisticas = async () => {
      const token = getToken();
      if (!token) { navigate('/login', { replace: true }); return; }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          setDatos(await res.json());
        } else if (res.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
        } else {
          setError('No se pudieron cargar las estadísticas.');
        }
      } catch (err) {
        setError('Error de conexión con el servidor.');
      }
    };

    cargarEstadisticas();
  }, [navigate]);

  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  if (!datos) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Cargando métricas de Movilwest...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Dashboard Movilwest</h1>
        <p className="mt-2 text-sm text-gray-600">Resumen financiero y estado del inventario en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* KPI 1 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5 flex items-center">
          <div className="shrink-0 bg-blue-100 rounded-md p-3"><DollarSign className="h-6 w-6 text-blue-600" /></div>
          <div className="ml-5 w-0 flex-1">
            <dl><dt className="text-sm font-medium text-gray-500 truncate">Ganancia Hoy</dt>
            <dd className="text-2xl font-black text-gray-900">${datos.kpis.ganancia_hoy}</dd></dl>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5 flex items-center">
          <div className="shrink-0 bg-indigo-100 rounded-md p-3"><Package className="h-6 w-6 text-indigo-600" /></div>
          <div className="ml-5 w-0 flex-1">
            <dl><dt className="text-sm font-medium text-gray-500 truncate">Valor Inventario</dt>
            <dd className="text-2xl font-black text-gray-900">${datos.kpis.valor_inventario}</dd></dl>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 p-5 flex items-center">
          <div className="shrink-0 bg-green-100 rounded-md p-3"><TrendingUp className="h-6 w-6 text-green-600" /></div>
          <div className="ml-5 w-0 flex-1">
            <dl><dt className="text-sm font-medium text-gray-500 truncate">Equipos Vendidos (Mes)</dt>
            <dd className="text-2xl font-black text-gray-900">{datos.kpis.equipos_vendidos_mes}</dd></dl>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`overflow-hidden shadow-sm rounded-xl border p-5 flex items-center ${datos.kpis.stock_critico > 0 ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-200'}`}>
          <div className={`shrink-0 rounded-md p-3 ${datos.kpis.stock_critico > 0 ? 'bg-red-100' : 'bg-gray-100'}`}><AlertCircle className={`h-6 w-6 ${datos.kpis.stock_critico > 0 ? 'text-red-600' : 'text-gray-400'}`} /></div>
          <div className="ml-5 w-0 flex-1">
            <dl><dt className="text-sm font-medium text-gray-500 truncate">Stock Crítico ({"< 3"})</dt>
            <dd className={`text-2xl font-black ${datos.kpis.stock_critico > 0 ? 'text-red-600' : 'text-gray-900'}`}>{datos.kpis.stock_critico}</dd></dl>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresos Brutos Últimos 7 Días (Separado)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="99%" minHeight={300}>
              <BarChart data={datos.grafico_barras} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="equipos" name="Venta Equipos ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recargas" name="Recargas y Servicios ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Frecuencia de Operaciones (7 Días)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="99%" minHeight={300}>
              <PieChart>
                <Pie data={datos.grafico_donut} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {datos.grafico_donut.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}