import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, FileText, Ban, ShoppingBag, CreditCard, User, Calendar, X, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Venda {
    id: string;
    cliente: { nome: string; telefone?: string };
    dataVenda: string;
    formaPagamento: string;
    status: string;
    total: number;
    subtotal: number;
    desconto: number;
    observacoes?: string;
    itens: any[];
    parcelas?: any[];
}

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: ptBR });

export default function SalesPage() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFiltro, setStatusFiltro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [detalhes, setDetalhes] = useState<Venda | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<{ id: string } | null>(null);

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
        try {
            await api.delete(`/sales/${id}/cancel`);
            toast.success('Venda cancelada com sucesso');
            setShowModal(false);
            await fetch();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Erro ao cancelar venda');
        }
    };

    const getSaleStatus = (v: any) => {
        if (!v) return { label: '-', color: 'text-gray-400' };
        if (v.status === 'CANCELADA') return { label: 'CANCELADA', color: 'badge-red' };
        const hasPending = v.parcelas?.some((p: any) => p.status === 'PENDENTE');
        if (hasPending) return { label: 'PENDENTE', color: 'badge-yellow' };
        return { label: 'CONCLUIDA', color: 'badge-green' };
    };

    const pagarParcela = async (vendaId: string, parcelaId: string) => {
        try {
            await api.put(`/sales/${vendaId}/parcelas/${parcelaId}/pay`);
            toast.success('Parcela baixada com sucesso');
            openDetalhes(vendaId);
            fetch();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Erro ao pagar parcela');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendas</h1>
                    <p className="text-gray-500 font-medium">Histórico e gestão de saídas</p>
                </div>
                <Link to="/sales/new" className="btn-primary shadow-xl shadow-primary-500/20"><Plus size={18} /> Nova Venda</Link>
            </div>

            <div className="flex gap-4 flex-wrap bg-white p-4 rounded-2xl border-2 border-gray-100/50 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-10 h-11" placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input w-auto h-11 font-semibold text-gray-700" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="CONCLUIDA">Concluídas</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="CANCELADA">Canceladas</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 border-b-2 border-gray-100">
                            <tr>
                                {['Data', 'Cliente', 'Pagamento', 'Total', 'Status', 'Ações'].map(h => (
                                    <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">Carregando transações...</td></tr>
                            ) : vendas.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">Nenhuma venda registrada</td></tr>
                            ) : (
                                vendas.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-600 font-medium">{fmtDate(v.dataVenda)}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{v.cliente?.nome || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-600">{v.formaPagamento}</span>
                                                {v.formaPagamento === 'CARTAO' && v.parcelas && v.parcelas.length > 1 && (
                                                    <span className="badge-blue lowercase text-[10px]">
                                                        {v.parcelas.length}x
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900">{fmt(v.total)}</td>
                                        <td className="px-6 py-4">
                                            <span className={getSaleStatus(v).color}>
                                                {getSaleStatus(v).label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => openDetalhes(v.id)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><FileText size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && detalhes && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">

                        <div className="px-8 pt-6 pb-4 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-gray-900">Detalhamento</h2>
                                    <span className={`${getSaleStatus(detalhes).color} text-[9px] font-bold px-1.5 py-0.5 rounded uppercase`}>
                                        {getSaleStatus(detalhes).label}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-tight">ID: {detalhes.id}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-8 pb-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                                    <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-[9px] uppercase tracking-widest">
                                        <User size={12} /> Cliente
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 leading-tight truncate">{detalhes.cliente?.nome}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{detalhes.cliente?.telefone || '(00) 00000-0000'}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[9px] uppercase tracking-widest">
                                        <CreditCard size={12} /> Pagamento
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase leading-tight">{detalhes.formaPagamento}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{fmtDate(detalhes.dataVenda)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2 bg-white">
                                    <ShoppingBag size={14} className="text-primary-500" />
                                    <h3 className="font-bold text-gray-800 text-[12px]">Itens da Venda</h3>
                                </div>
                                <table className="w-full text-[12px]">
                                    <thead className="bg-gray-50/30">
                                        <tr>
                                            <th className="text-left px-5 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
                                            <th className="text-center px-5 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest w-20">Qtd</th>
                                            <th className="text-right px-5 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {detalhes.itens.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-5 py-3">
                                                    <p className="font-bold text-gray-900">{item.produto?.nome}</p>
                                                    <p className="text-[9px] text-gray-400 font-medium">{fmt(item.valorUnitario)}/un</p>
                                                </td>
                                                <td className="px-5 py-3 text-center font-bold text-gray-600">{item.quantidade}x</td>
                                                <td className="px-5 py-3 text-right font-black text-primary-600">{fmt(item.totalItem)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    {detalhes.observacoes ? (
                                        <div className="p-3 rounded-xl bg-amber-50/30 border border-amber-100 flex gap-2 h-full items-start">
                                            <FileText size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-gray-600 font-medium italic leading-relaxed">"{detalhes.observacoes}"</p>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl border border-dashed border-gray-200 flex items-center justify-center h-full">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sem observações</span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-56 bg-gray-50/50 p-3 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-gray-400 font-bold">Subtotal</span>
                                        <span className="font-bold text-gray-900">{fmt(detalhes.subtotal)}</span>
                                    </div>
                                    {Number(detalhes.desconto) > 0 && (
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-rose-500 font-bold italic">Desconto</span>
                                            <span className="font-bold text-rose-600">-{fmt(detalhes.desconto)}</span>
                                        </div>
                                    )}
                                    <div className="pt-1 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase">Total</span>
                                        <span className="text-lg font-black text-primary-600">{fmt(detalhes.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {detalhes.formaPagamento === 'CARTAO' && detalhes.parcelas && detalhes.parcelas.length > 0 && (
                                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-2.5 bg-blue-50/20 border-b border-blue-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-500" />
                                            <h3 className="font-bold text-blue-900 text-[10px] uppercase tracking-tighter">Financeiro</h3>
                                        </div>
                                        <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                            {detalhes.parcelas.filter((p: any) => p.status === 'PAGA').length}/{detalhes.parcelas.length} pagas
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[11px]">
                                            <thead className="bg-gray-50/10">
                                                <tr>
                                                    <th className="text-left px-5 py-1.5 font-bold text-gray-400 uppercase text-[8px]">Nr</th>
                                                    <th className="text-left px-5 py-1.5 font-bold text-gray-400 uppercase text-[8px]">Vencimento</th>
                                                    <th className="text-left px-5 py-1.5 font-bold text-gray-400 uppercase text-[8px]">Valor</th>
                                                    <th className="text-center px-5 py-1.5 font-bold text-gray-400 uppercase text-[8px]">Status</th>
                                                    <th className="text-right px-5 py-1.5 font-bold text-gray-400 uppercase text-[8px]">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {detalhes.parcelas.map((p: any) => (
                                                    <tr key={p.id}>
                                                        <td className="px-5 py-2 text-gray-900 font-bold">{p.numero}º</td>
                                                        <td className="px-5 py-2 text-gray-600">{format(new Date(p.dataVencimento), 'dd/MM/yyyy')}</td>
                                                        <td className="px-5 py-2 font-bold text-gray-900">{fmt(p.valor)}</td>
                                                        <td className="px-5 py-2 text-center">
                                                            <span className={p.status === 'PAGA' ? 'text-emerald-500 font-bold uppercase text-[9px]' : 'text-amber-500 font-bold uppercase text-[9px]'}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-2 text-right">
                                                            {p.status === 'PENDENTE' && detalhes.status !== 'CANCELADA' ? (
                                                                <button onClick={() => pagarParcela(detalhes.id, p.id)} className="bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-[9px] hover:bg-primary-700 transition-colors">Baixar</button>
                                                            ) : (
                                                                <span className="text-gray-400 text-[9px]">{p.dataPagamento ? format(new Date(p.dataPagamento), 'dd/MM/yy') : '-'}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-4 bg-white border-t border-gray-100 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                            {detalhes.status !== 'CANCELADA' ? (
                                <button onClick={() => setConfirmCancel({ id: detalhes.id })} className="btn-danger flex items-center gap-2 h-10 px-4 text-xs font-bold">
                                    <Ban size={16} /> Cancelar Venda
                                </button>
                            ) : <div />}
                            <button className="bg-gray-100 text-gray-600 px-5 h-10 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors" onClick={() => setShowModal(false)}>
                                Fechar Janela
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                onConfirm={() => confirmCancel && cancelar(confirmCancel.id)}
                title="Estornar e Cancelar Venda?"
                message="Esta ação é irreversível. O estoque dos itens vendidos retornará automaticamente para o balanço e todos os registros financeiros relacionados serão marcados como cancelados."
                type="danger"
                confirmText="Sim, Cancelar Venda"
            />
        </div>
    );
}