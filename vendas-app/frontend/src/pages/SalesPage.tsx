import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, FileText, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Venda {
    id: string;
    cliente: { nome: string };
    dataVenda: string;
    formaPagamento: string;
    status: string;
    total: number;
}

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: ptBR });

export default function SalesPage() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFiltro, setStatusFiltro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [detalhes, setDetalhes] = useState<any>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        const p: any = { search, limit: 100 };
        if (statusFiltro) p.status = statusFiltro;
        const { data } = await api.get('/sales', { params: p });
        setVendas(data.data);
        setLoading(false);
    }, [search, statusFiltro]);

    useEffect(() => { fetch(); }, [fetch]);

    const openDetalhes = async (id: string) => {
        const { data } = await api.get(`/sales/${id}`);
        setDetalhes(data);
        setShowModal(true);
    };

    const cancelar = async (id: string) => {
        if (!confirm('Deseja realmente CANCELAR esta venda? O estoque será devolvido.')) return;
        try {
            await api.delete(`/sales/${id}/cancel`);
            setShowModal(false);
            await fetch();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Erro ao cancelar venda');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                    <p className="text-gray-500 text-sm">{vendas.length} venda(s) encontrada(s)</p>
                </div>
                <Link to="/sales/new" className="btn-primary"><Plus size={16} /> Nova Venda</Link>
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input w-auto" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="CONCLUIDA">Concluídas</option>
                    <option value="CANCELADA">Canceladas</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Data', 'Cliente', 'Pagamento', 'Total', 'Status', 'Ações'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                            ) : vendas.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Nenhuma venda encontrada</td></tr>
                            ) : (
                                vendas.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600">{fmtDate(v.dataVenda)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{v.cliente?.nome || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600">{v.formaPagamento}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{fmt(v.total)}</td>
                                        <td className="px-4 py-3">
                                            <span className={v.status === 'CONCLUIDA' ? 'badge-green' : 'badge-red'}>{v.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => openDetalhes(v.id)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><FileText size={15} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && detalhes && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                Detalhes da Venda
                                <span className={detalhes.status === 'CONCLUIDA' ? 'badge-green' : 'badge-red'}>{detalhes.status}</span>
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="card p-4">
                                    <p className="text-xs text-gray-500 mb-1">Cliente</p>
                                    <p className="font-medium text-gray-900">{detalhes.cliente?.nome}</p>
                                    <p className="text-sm text-gray-600">{detalhes.cliente?.telefone || '-'}</p>
                                </div>
                                <div className="card p-4">
                                    <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                                    <p className="font-medium text-gray-900">{detalhes.formaPagamento}</p>
                                    <p className="text-sm text-gray-600">{fmtDate(detalhes.dataVenda)}</p>
                                </div>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="px-4 py-3 bg-white border-b border-gray-100 font-medium text-sm text-gray-700">
                                    Itens da Venda
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Produto', 'Qtd', 'Val. Unit.', 'Total'].map(h => (
                                                <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {detalhes.itens.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{item.produto?.nome}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{item.produto?.sku}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{item.quantidade}x</td>
                                                <td className="px-4 py-3 text-gray-600">{fmt(item.valorUnitario)}</td>
                                                <td className="px-4 py-3 font-medium">{fmt(item.totalItem)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 card p-4 flex flex-col items-end gap-1">
                                <p className="text-sm text-gray-600">Subtotal: <span className="font-medium text-gray-900">{fmt(detalhes.subtotal)}</span></p>
                                {Number(detalhes.desconto) > 0 && (
                                    <p className="text-sm text-red-600">Desconto: <span className="font-medium">-{fmt(detalhes.desconto)}</span></p>
                                )}
                                <p className="text-xl font-bold text-gray-900 mt-2">Total: {fmt(detalhes.total)}</p>
                            </div>

                            {detalhes.observacoes && (
                                <div className="mt-4 card p-4 text-sm text-gray-600">
                                    <span className="font-medium text-gray-900">Obs:</span> {detalhes.observacoes}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                            {detalhes.status === 'CONCLUIDA' ? (
                                <button onClick={() => cancelar(detalhes.id)} className="btn-danger bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><Ban size={16} /> Cancelar Venda e Estornar</button>
                            ) : <div></div>}
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
