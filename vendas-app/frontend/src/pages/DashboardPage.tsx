import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function KpiCard({ title, value, sub, icon: Icon, color, trend }: any) {
    return (
        <div className="card p-6 flex flex-col justify-between gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${color}`}></div>
            <div className="flex items-center justify-between relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
                {sub && <p className="text-sm text-gray-500 mt-1 font-medium">{sub}</p>}
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
                />
                <KpiCard
                    title="Atenção Estoque"
                    value={kpis?.produtosEstoqueBaixo || 0}
                    sub="Itens abaixo do mínimo"
                    icon={AlertTriangle}
                    color={kpis?.produtosEstoqueBaixo > 0 ? 'bg-orange-600 shadow-orange-200' : 'bg-slate-600 shadow-slate-200'}
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
                                <Tooltip formatter={(v: any, name: any) => name === 'Lucro (R$)' || name === 'Receita (R$)' ? fmt(Number(v)) : v} />
                                <Bar dataKey="totalVendido" fill="#c7d2fe" name="Qtd" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="totalReceita" fill="#818cf8" name="Receita (R$)" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="totalGanho" fill="#6175f1" name="Lucro (R$)" radius={[0, 4, 4, 0]} />
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
