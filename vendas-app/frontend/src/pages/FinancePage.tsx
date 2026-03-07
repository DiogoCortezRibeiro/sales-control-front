import React, { useEffect, useState, useCallback } from 'react';
import { Wallet, Search, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });

export default function FinancePage() {
    const [summary, setSummary] = useState<any>(null);
    const [parcels, setParcels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('PENDENTE');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSummary = async () => {
        const { data } = await api.get('/finance/summary');
        setSummary(data);
    };

    const fetchParcels = useCallback(async () => {
        setLoading(true);
        const { data } = await api.get('/finance/parcels', {
            params: { search, status, order, page, limit: 10 }
        });
        setParcels(data.data);
        setTotalPages(data.meta.totalPages);
        setLoading(false);
    }, [search, status, order, page]);

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchParcels();
    }, [fetchParcels]);

    const handlePay = async (id: string) => {
        try {
            await api.post(`/finance/parcels/${id}/pay`);
            toast.success('Parcela marcada como paga!');
            fetchSummary();
            fetchParcels();
        } catch (e) {
            toast.error('Erro ao processar pagamento');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
                    <p className="text-gray-500 text-sm">Controle de contas a receber</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 group hover:shadow-lg transition-all border-l-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm group-hover:rotate-12 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vencem Hoje</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">{fmt(summary?.hoje.total || 0)}</p>
                            <p className="text-xs text-gray-400 font-medium">{summary?.hoje.count || 0} parcelas pendentes</p>
                        </div>
                    </div>
                </div>

                <div className="card p-5 group hover:shadow-lg transition-all border-l-4 border-rose-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm group-hover:rotate-12 transition-transform">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Atrasadas</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">{fmt(summary?.vencidas.total || 0)}</p>
                            <p className="text-xs text-gray-400 font-medium">{summary?.vencidas.count || 0} parcelas em atraso</p>
                        </div>
                    </div>
                </div>

                <div className="card p-5 group hover:shadow-lg transition-all border-l-4 border-emerald-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm group-hover:rotate-12 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recebido (Mês)</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">{fmt(summary?.pagosMes.total || 0)}</p>
                            <p className="text-xs text-gray-400 font-medium">{summary?.pagosMes.count || 0} parcelas pagas</p>
                        </div>
                    </div>
                </div>

                <div className="card p-5 group hover:shadow-lg transition-all border-l-4 border-indigo-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm group-hover:rotate-12 transition-transform">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Pendente</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">{fmt(summary?.totalGeral || 0)}</p>
                            <p className="text-xs text-gray-400 font-medium">Saldo total a receber</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 flex gap-4 flex-wrap items-end bg-white">
                <div className="relative flex-1 min-w-[250px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="input pl-10"
                        placeholder="Buscar por cliente..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block ml-1 uppercase tracking-wider">Status</label>
                    <select className="input min-w-[180px]" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                        <option value="PENDENTE">Apenas Pendentes</option>
                        <option value="PAGA">Apenas Pagas</option>
                        <option value="">Todas as Parcelas</option>
                    </select>
                </div>
            </div>

            {/* Parcels Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th
                                    className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors group"
                                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                >
                                    <div className="flex items-center gap-2">
                                        Vencimento
                                        {order === 'asc' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />}
                                    </div>
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Parcela</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Valor</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Carregando dados financeiros...</td></tr>
                            ) : parcels.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic">Nenhuma parcela encontrada para os filtros aplicados</td></tr>
                            ) : (
                                parcels.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className={`px-6 py-4 font-semibold ${new Date(p.dataVencimento) < new Date() && p.status === 'PENDENTE' ? 'text-rose-600' : 'text-gray-900'}`}>
                                            {fmtDate(p.dataVencimento)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">{p.venda.cliente.nome}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pedido em {fmtDate(p.venda.dataVenda)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">Parcela {p.numero}</td>
                                        <td className="px-6 py-4 font-black text-gray-900 text-base">{fmt(p.valor)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${p.status === 'PAGA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.status === 'PENDENTE' && (
                                                <button
                                                    onClick={() => handlePay(p.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                                                >
                                                    <CheckCircle size={14} />
                                                    Pagar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Página {page} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50"><ChevronLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
