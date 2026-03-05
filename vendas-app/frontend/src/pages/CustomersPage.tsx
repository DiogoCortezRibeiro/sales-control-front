import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import api from '../lib/api';

interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
    cpfCnpj?: string;
    endereco?: string;
    observacoes?: string;
    _count?: { vendas: number };
}

export default function CustomersPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Cliente | null>(null);
    const [form, setForm] = useState<Partial<Cliente>>({});

    const fetch = useCallback(async () => {
        setLoading(true);
        const { data } = await api.get('/customers', { params: { search, limit: 100 } });
        setClientes(data.data);
        setLoading(false);
    }, [search]);

    useEffect(() => { fetch(); }, [fetch]);

    const set = (k: keyof Cliente, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openCreate = () => { setEditing(null); setForm({}); setShowModal(true); };
    const openEdit = (c: Cliente) => { setEditing(c); setForm(c); setShowModal(true); };

    const save = async () => {
        if (editing) {
            await api.put(`/customers/${editing.id}`, form);
        } else {
            await api.post('/customers', form);
        }
        setShowModal(false);
        await fetch();
    };

    const remove = async (id: string) => {
        if (!confirm('Excluir cliente?')) return;
        await api.delete(`/customers/${id}`);
        await fetch();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-500 text-sm">{clientes.length} cliente(s)</p>
                </div>
                <button className="btn-primary" onClick={openCreate}><Plus size={16} />Novo Cliente</button>
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Nome', 'Telefone', 'Email', 'CPF/CNPJ', 'Vendas', 'Ações'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                            ) : clientes.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                    <Users size={40} className="mx-auto mb-2 opacity-30" /><p>Nenhum cliente encontrado</p>
                                </td></tr>
                            ) : (
                                clientes.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.telefone}</td>
                                        <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                                        <td className="px-4 py-3 text-gray-500">{c.cpfCnpj || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="badge-blue">{c._count?.vendas || 0} vendas</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                                                <button onClick={() => remove(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-lg">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label">Nome *</label>
                                    <input className="input" value={form.nome || ''} onChange={e => set('nome', e.target.value)} />
                                </div>
                                <div>
                                    <label className="label">Telefone *</label>
                                    <input className="input" value={form.telefone || ''} onChange={e => set('telefone', e.target.value)} />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" className="input" value={form.email || ''} onChange={e => set('email', e.target.value)} />
                                </div>
                                <div>
                                    <label className="label">CPF/CNPJ</label>
                                    <input className="input" value={form.cpfCnpj || ''} onChange={e => set('cpfCnpj', e.target.value)} />
                                </div>
                                <div>
                                    <label className="label">Endereço</label>
                                    <input className="input" value={form.endereco || ''} onChange={e => set('endereco', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Observações</label>
                                    <textarea className="input resize-none" rows={2} value={form.observacoes || ''} onChange={e => set('observacoes', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={save}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
