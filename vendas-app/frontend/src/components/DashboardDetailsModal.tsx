import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Clock, MapPin, Phone, User, Package, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    type: 'low-stock' | 'overdue';
    onClose: () => void;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });

export default function DashboardDetailsModal({ type, onClose }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const endpoint = type === 'low-stock' ? '/products/low-stock' : '/finance/overdue';
                const { data } = await api.get(endpoint);
                setData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [type]);

    const title = type === 'low-stock' ? 'Produtos com Estoque Baixo' : 'Cobranças Pendentes (Atrasadas)';
    const Icon = type === 'low-stock' ? AlertTriangle : Clock;
    const colorClass = type === 'low-stock' ? 'text-orange-600 bg-orange-100' : 'text-rose-600 bg-rose-100';

    return (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.2)] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">{title}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ação Necessária</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4" />
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Carregando dados...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">Tudo em ordem!</h3>
                            <p className="text-gray-500 text-sm">Nenhum item encontrado nesta categoria no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {type === 'low-stock' ? (
                                data.map((p: any) => (
                                    <div key={p.id} className="p-4 rounded-3xl border border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/20 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                    <Package size={16} />
                                                </div>
                                                <p className="font-black text-gray-900 leading-tight">{p.nome}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">Estoque Baixo</span>
                                        </div>
                                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Atual</p>
                                                <p className="text-lg font-black text-rose-500 leading-none">{p.estoqueAtual}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mínimo</p>
                                                <p className="text-lg font-black text-gray-300 leading-none">{p.estoqueMinimo}</p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Preço</p>
                                                <p className="text-sm font-black text-gray-900 leading-none mt-1">{fmt(p.precoVenda)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                data.map((p: any) => (
                                    <div key={p.id} className="p-4 rounded-3xl border border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/20 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-tight">{p.venda.cliente.nome}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Parcela {p.numero}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-tighter">Atrasada</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-50">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Venceu em</p>
                                                <p className="text-sm font-black text-rose-600">{fmtDate(p.dataVencimento)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Valor</p>
                                                <p className="text-xl font-black text-gray-900">{fmt(p.valor)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
