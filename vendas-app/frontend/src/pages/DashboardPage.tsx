import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, Package, ShoppingCart, DollarSign,
    Calendar, AlertTriangle, Clock
} from 'lucide-react';
import api from '../lib/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import DashboardDetailsModal from '../components/DashboardDetailsModal';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface KpiCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: any;
    color: string;
    onClick?: () => void;
}

const KpiCard = ({ title, value, sub, icon: Icon, color, onClick }: KpiCardProps) => (
    <div
        className={`card p-5 group transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:translate-y--1 active:scale-95' : 'hover:shadow-lg'}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
                    {onClick && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">{sub}</p>
            </div>
        </div>
    </div>
);

export default function DashboardPage() {
    const [kpis, setKpis] = useState<any>(null);
    const [series, setSeries] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailType, setDetailType] = useState<'low-stock' | 'overdue' | null>(null);

    const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const fetchData = () => {
        setLoading(true);
        const params = { dataInicio, dataFim };

        Promise.all([
            api.get('/dashboard/kpis', { params }),
            api.get('/dashboard/sales-series', { params }),
            api.get('/dashboard/top-products', { params }),
            api.get('/dashboard/top-customers', { params })
        ]).then(([k, s, p, c]) => {
            setKpis(k.data);
            setSeries(s.data);
            setTopProducts(p.data);
            setTopCustomers(c.data);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [dataInicio, dataFim]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Visão geral do seu negócio</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar size={14} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent text-xs font-semibold text-gray-600 outline-none"
                            value={dataInicio}
                            onChange={e => setDataInicio(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-300 font-bold"> até </span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar size={14} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent text-xs font-semibold text-gray-600 outline-none"
                            value={dataFim}
                            onChange={e => setDataFim(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                    title="Vendas Hoje"
                    value={fmt(kpis?.totalHoje || 0)}
                    sub={`${kpis?.vendasHoje || 0} pedidos concluídos`}
                    icon={TrendingUp}
                    color="bg-indigo-600 shadow-indigo-200"
                />
                <KpiCard
                    title="Receita do Mês"
                    value={fmt(kpis?.totalMes || 0)}
                    sub={`${kpis?.vendasMes || 0} vendas no período`}
                    icon={ShoppingCart}
                    color="bg-primary-600 shadow-primary-200"
                />
                <KpiCard
                    title="Lucro Líquido"
                    value={fmt(kpis?.lucroMes || 0)}
                    sub="Receita - Custo de Produtos"
                    icon={DollarSign}
                    color="bg-emerald-600 shadow-emerald-200"
                />
                <KpiCard
                    title="Ticket Médio"
                    value={fmt(kpis?.ticketMedioMes || 0)}
                    sub="Valor médio por venda"
                    icon={TrendingUp}
                    color="bg-violet-600 shadow-violet-200"
                />
                <KpiCard
                    title="Cobranças Pendentes"
                    value={kpis?.parcelasAtrasadas || 0}
                    sub="Parcelas em atraso"
                    icon={Clock}
                    color={kpis?.parcelasAtrasadas > 0 ? 'bg-rose-600 shadow-rose-200' : 'bg-slate-600 shadow-slate-200'}
                    onClick={() => kpis?.parcelasAtrasadas > 0 && setDetailType('overdue')}
                />
                <KpiCard
                    title="Atenção Estoque"
                    value={kpis?.produtosEstoqueBaixo || 0}
                    sub="Itens abaixo do mínimo"
                    icon={AlertTriangle}
                    color={kpis?.produtosEstoqueBaixo > 0 ? 'bg-orange-600 shadow-orange-200' : 'bg-slate-600 shadow-slate-200'}
                    onClick={() => kpis?.produtosEstoqueBaixo > 0 && setDetailType('low-stock')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-4">
                    <h2 className="font-semibold text-gray-800 mb-3 text-sm text-center">Evolução de Vendas</h2>
                    {series.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={series}>
                                <defs>
                                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6175f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6175f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ fontSize: '12px' }} />
                                <Area type="monotone" dataKey="totalVendas" stroke="#6175f1" fill="url(#colorVendas)" strokeWidth={2} name="Total" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
                            Sem dados ainda.
                        </div>
                    )}
                </div>

                <div className="card p-4">
                    <h2 className="font-semibold text-gray-800 mb-3 text-sm text-center">Top Produtos</h2>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topProducts} layout="vertical" margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" tick={{ fontSize: 9 }} width={80} />
                                <Tooltip formatter={(v: any) => typeof v === 'number' ? fmt(v) : v} contentStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="totalReceita" fill="#6175f1" name="Receita" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
                            Sem dados.
                        </div>
                    )}
                </div>

                <div className="card p-4">
                    <h2 className="font-semibold text-gray-800 mb-3 text-sm text-center">Top Clientes</h2>
                    {topCustomers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topCustomers} layout="vertical" margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" tick={{ fontSize: 9 }} width={80} />
                                <Tooltip formatter={(v: any) => typeof v === 'number' ? fmt(v) : v} contentStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="totalGasto" fill="#10b981" name="Gasto" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
                            Sem dados.
                        </div>
                    )}
                </div>
            </div>

            {detailType && (
                <DashboardDetailsModal
                    type={detailType}
                    onClose={() => setDetailType(null)}
                />
            )}
        </div>
    );
}
