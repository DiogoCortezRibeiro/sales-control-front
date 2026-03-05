import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import api from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';

interface Produto {
    id: string;
    nome: string;
    categoria: string;
    precoVenda: number;
    custo: number;
    estoqueAtual: number;
    estoqueMinimo?: number;
    ativo: boolean;
}

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductsPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [ativo, setAtivo] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Produto | null>(null);
    const [form, setForm] = useState<Partial<Produto>>({});
    const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        const p: any = { search, limit: 100 };
        if (ativo !== '') p.ativo = ativo;
        const { data } = await api.get('/products', { params: p });
        setProdutos(data.data);
        setLoading(false);
    }, [search, ativo]);

    useEffect(() => { fetch(); }, [fetch]);

    const openCreate = () => { setEditing(null); setForm({ ativo: true }); setShowModal(true); };
    const openEdit = (p: Produto) => { setEditing(p); setForm(p); setShowModal(true); };

    const save = async () => {
        if (!form.nome || !form.categoria || !form.precoVenda || !form.custo) {
            toast.error('Por favor, preencha todos os campos obrigatórios (*)');
            return;
        }

        try {
            if (editing) {
                await api.put(`/products/${editing.id}`, form);
            } else {
                await api.post('/products', form);
            }
            toast.success(editing ? 'Produto atualizado' : 'Produto criado');
            setShowModal(false);
            await fetch();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Erro ao salvar produto');
        }
    };

    const remove = async (id: string) => {
        try {
            await api.delete(`/products/${id}`);
            toast.success('Produto desativado');
            await fetch();
        } catch (e: any) {
            toast.error('Erro ao excluir produto');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                    <p className="text-gray-500 text-sm">{produtos.length} produto(s)</p>
                </div>
                <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Novo Produto</button>
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" placeholder="Buscar por nome ou categoria..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input w-auto" value={ativo} onChange={e => setAtivo(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Nome', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ações'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                            ) : produtos.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                    <Package size={40} className="mx-auto mb-2 opacity-30" />
                                    <p>Nenhum produto encontrado</p>
                                </td></tr>
                            ) : (
                                produtos.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.categoria}</td>
                                        <td className="px-4 py-3 font-medium">{fmt(p.precoVenda)}</td>
                                        <td className="px-4 py-3">
                                            <span className={p.estoqueAtual <= (p.estoqueMinimo || 0) && p.estoqueAtual > 0 ? 'badge-yellow' : p.estoqueAtual === 0 ? 'badge-red' : 'badge-green'}>
                                                {p.estoqueAtual} un
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={p.ativo ? 'badge-green' : 'badge-red'}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 size={15} /></button>
                                                <button onClick={() => setConfirmDelete({ id: p.id })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
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
                            <h2 className="font-semibold text-lg">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label">Nome *</label>
                                    <input className="input" value={form.nome || ''} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Categoria *</label>
                                    <input className="input" value={form.categoria || ''} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Preço de Venda *</label>
                                    <input type="number" step="0.01" className="input" value={form.precoVenda || ''} onChange={e => setForm(f => ({ ...f, precoVenda: parseFloat(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Custo *</label>
                                    <input type="number" step="0.01" className="input" value={form.custo || ''} onChange={e => setForm(f => ({ ...f, custo: parseFloat(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Estoque Atual</label>
                                    <input type="number" className="input" value={form.estoqueAtual ?? 0} onChange={e => setForm(f => ({ ...f, estoqueAtual: parseInt(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="label">Estoque Mínimo</label>
                                    <input type="number" className="input" value={form.estoqueMinimo ?? 0} onChange={e => setForm(f => ({ ...f, estoqueMinimo: parseInt(e.target.value) }))} />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="checkbox" id="ativo" checked={form.ativo ?? true} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
                                    <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Produto ativo</label>
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

            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && remove(confirmDelete.id)}
                title="Desativar Produto"
                message="Tem certeza que deseja desativar este produto? Ele não aparecerá mais para novas vendas."
                type="danger"
                confirmText="Desativar"
            />
        </div>
    );
}
