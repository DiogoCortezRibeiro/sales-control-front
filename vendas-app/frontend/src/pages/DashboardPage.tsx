import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function KpiCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <div className="card p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function DashboardPage() {
    const [kpis, setKpis] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard/kpis'),
            api.get('/dashboard/top-products'),
            api.get('/dashboard/sales-series'),
        ]).then(([k, tp, s]) => {
            setKpis(k.data);
            setTopProducts(tp.data);
            setSeries(s.data.map((d: any) => ({
                ...d,
                label: format(new Date(d.data), 'dd/MM', { locale: ptBR }),
            })));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Visão geral do seu negócio</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                    title="Total hoje"
                    value={fmt(kpis?.totalHoje || 0)}
                    sub={`${kpis?.vendasHoje || 0} vendas`}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <KpiCard
                    title="Total do mês"
                    value={fmt(kpis?.totalMes || 0)}
                    sub={`${kpis?.vendasMes || 0} vendas`}
                    icon={ShoppingCart}
                    color="bg-primary-600"
                />
                <KpiCard
                    title="Ticket médio"
                    value={fmt(kpis?.ticketMedioMes || 0)}
                    sub="No mês atual"
                    icon={Users}
                    color="bg-purple-500"
                />
                <KpiCard
                    title="Estoque crítico"
                    value={kpis?.produtosEstoqueBaixo || 0}
                    sub="Produtos abaixo do mínimo"
                    icon={kpis?.produtosEstoqueBaixo > 0 ? AlertTriangle : Package}
                    color={kpis?.produtosEstoqueBaixo > 0 ? 'bg-red-500' : 'bg-orange-500'}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Sales series */}
                <div className="card p-5 xl:col-span-2">
                    <h2 className="font-semibold text-gray-800 mb-4">Vendas - Últimos 30 dias</h2>
                    {series.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={series}>
                                <defs>
                                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6175f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6175f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                <Area type="monotone" dataKey="totalVendas" stroke="#6175f1" fill="url(#colorVendas)" strokeWidth={2} name="Total" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                            Sem dados ainda. Registre suas primeiras vendas!
                        </div>
                    )}
                </div>

                {/* Top products */}
                <div className="card p-5">
                    <h2 className="font-semibold text-gray-800 mb-4">Top Produtos</h2>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="nome" type="category" tick={{ fontSize: 11 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="totalVendido" fill="#6175f1" name="Qtd Vendida" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                            Sem dados ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
