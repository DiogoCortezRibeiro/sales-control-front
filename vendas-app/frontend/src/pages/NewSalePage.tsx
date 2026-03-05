import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function NewSalePage() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<any[]>([]);

    const [clienteId, setClienteId] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('PIX');
    const [observacoes, setObservacoes] = useState('');
    const [desconto, setDesconto] = useState(0);
    const [itens, setItens] = useState<any[]>([]);

    // Produto temporário para adicionar cart
    const [addProdutoId, setAddProdutoId] = useState('');
    const [addQtd, setAddQtd] = useState(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/customers', { params: { limit: 1000 } }).then(res => setClientes(res.data.data));
        api.get('/products', { params: { limit: 1000, ativo: 'true' } }).then(res => setProdutos(res.data.data));
    }, []);

    const handleAddItem = () => {
        if (!addProdutoId || addQtd < 1) return;
        const prod = produtos.find(p => p.id === addProdutoId);
        if (!prod) return;

        if (prod.estoqueAtual < addQtd) {
            alert(`Estoque insuficiente! Disponível: ${prod.estoqueAtual}`);
            return;
        }

        const existe = itens.find(i => i.produtoId === addProdutoId);
        if (existe) {
            if (prod.estoqueAtual < existe.quantidade + addQtd) {
                alert('Estoque insuficiente para esta adição.');
                return;
            }
            setItens(itens.map(i => i.produtoId === addProdutoId ? { ...i, quantidade: i.quantidade + addQtd } : i));
        } else {
            setItens([...itens, { produtoId: prod.id, nome: prod.nome, valorUnitario: prod.precoVenda, quantidade: addQtd }]);
        }
        setAddProdutoId('');
        setAddQtd(1);
    };

    const removeItem = (pid: string) => setItens(itens.filter(i => i.produtoId !== pid));

    const subtotal = useMemo(() => itens.reduce((acc, i) => acc + (i.valorUnitario * i.quantidade), 0), [itens]);
    const total = useMemo(() => Math.max(0, subtotal - desconto), [subtotal, desconto]);

    const save = async () => {
        if (!clienteId) return alert('Selecione um cliente');
        if (itens.length === 0) return alert('Adicione pelo menos um item');

        setSaving(true);
        try {
            await api.post('/sales', {
                clienteId,
                formaPagamento,
                desconto,
                observacoes,
                itens: itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, valorUnitario: i.valorUnitario }))
            });
            navigate('/sales');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Erro ao registrar venda');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nova Venda</h1>
                    <p className="text-gray-500 text-sm">Registro de nova saída</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Esquerda: Itens */}
                <div className="md:col-span-2 space-y-4">
                    <div className="card p-5">
                        <h2 className="font-semibold mb-4">Adicionar Produto</h2>
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="label">Buscar produto</label>
                                <select className="input" value={addProdutoId} onChange={e => setAddProdutoId(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {produtos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nome} - {fmt(p.precoVenda)} (Estoque: {p.estoqueAtual})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="label">Qtd</label>
                                <input type="number" min="1" className="input" value={addQtd} onChange={e => setAddQtd(Number(e.target.value))} />
                            </div>
                            <button className="btn-primary" onClick={handleAddItem}><Plus size={18} /> Add</button>
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Produto</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-500 w-24">Qtd</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Total</th>
                                    <th className="px-4 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {itens.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum item adicionado</td></tr>
                                ) : (
                                    itens.map(i => (
                                        <tr key={i.produtoId}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{i.nome}</td>
                                            <td className="px-4 py-3">{i.quantidade}</td>
                                            <td className="px-4 py-3 font-medium">{fmt(i.quantidade * i.valorUnitario)}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => removeItem(i.produtoId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Direita: Resumo */}
                <div className="space-y-4">
                    <div className="card p-5">
                        <h2 className="font-semibold mb-4">Dados do Cliente</h2>
                        <div>
                            <label className="label">Cliente *</label>
                            <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                                <option value="">Selecione...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="label">Pagamento *</label>
                            <select className="input" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
                                <option value="PIX">PIX</option>
                                <option value="CARTAO">Cartão</option>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="BOLETO">Boleto</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="label">Desconto (R$)</label>
                            <input type="number" step="0.01" min="0" className="input" value={desconto} onChange={e => setDesconto(Number(e.target.value))} />
                        </div>

                        <div className="mt-4">
                            <label className="label">Observações</label>
                            <textarea className="input resize-none" rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
                        </div>
                    </div>

                    <div className="card p-5 bg-primary-50 border-primary-100">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Subtotal</span>
                            <span>{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500 mb-3 border-b border-primary-200 pb-3">
                            <span>Desconto</span>
                            <span>- {fmt(desconto)}</span>
                        </div>
                        <div className="flex justify-between items-end mb-6">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-primary-700">{fmt(total)}</span>
                        </div>

                        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center py-3 text-lg">
                            {saving ? 'Registrando...' : <><Save size={20} /> Registrar Venda</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
