import React, { useEffect, useState } from 'react';
import { X, User, Phone, Mail, FileText, ShoppingBag, Clock, TrendingUp, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    customerId: string;
    onClose: () => void;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });

export default function CustomerDetailsModal({ customerId, onClose }: Props) {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await api.get(`/customers/${customerId}`);
            setCustomer(data);
            setLoading(false);
        };
        fetch();
    }, [customerId]);

    if (loading) return (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl">Carregando perfil...</div>
        </div>
    );

    return (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.2)] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start bg-slate-50/50 border-b border-gray-100">
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-3xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{customer.nome}</h2>
                            <div className="flex gap-4 mt-1">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Phone size={12} /> {customer.telefone || 'N/A'}</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Mail size={12} /> {customer.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-900 transition-all hover:rotate-90">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl border border-gray-100 bg-emerald-50/30 space-y-1">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2"><DollarSign size={18} /></div>
                            <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Total Comprado</p>
                            <p className="text-2xl font-black text-gray-900">{fmt(customer.totalGasto)}</p>
                        </div>
                        <div className="p-6 rounded-3xl border border-gray-100 bg-amber-50/30 space-y-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2"><Clock size={18} /></div>
                            <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest">Parcelas Pendentes</p>
                            <p className="text-2xl font-black text-gray-900">{customer.parcelasPendentes.length}</p>
                        </div>
                        <div className="p-6 rounded-3xl border border-gray-100 bg-indigo-50/30 space-y-1">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2"><TrendingUp size={18} /></div>
                            <p className="text-[10px] font-black text-indigo-600/70 uppercase tracking-widest">Total de Vendas</p>
                            <p className="text-2xl font-black text-gray-900">{customer.vendas.length} Pedidos</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Latest Sales */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <ShoppingBag size={18} className="text-primary-600" />
                                <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Últimos Pedidos</h3>
                            </div>
                            <div className="space-y-3">
                                {customer.vendas.map((v: any) => (
                                    <div key={v.id} className="p-4 rounded-2xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/10 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400">{fmtDate(v.dataVenda)}</p>
                                                <p className="font-bold text-gray-900">{v.itens.length} {v.itens.length === 1 ? 'item' : 'itens'}</p>
                                                <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                                    {v.itens.map((i: any) => i.produto.nome).join(', ')}
                                                </p>
                                            </div>
                                            <p className="font-black text-gray-900">{fmt(v.total)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Parcels */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <FileText size={18} className="text-amber-600" />
                                <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Contas em Aberto</h3>
                            </div>
                            <div className="space-y-3">
                                {customer.parcelasPendentes.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-medium">
                                        Tudo em dia! Nenhuma parcela pendente.
                                    </div>
                                ) : (
                                    customer.parcelasPendentes.map((p: any) => (
                                        <div key={p.id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Vence em {fmtDate(p.dataVencimento)}</p>
                                                <p className="font-bold text-gray-900">Parcela {p.numero}</p>
                                            </div>
                                            <p className="font-black text-rose-600 text-lg">{fmt(p.valor)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
