import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, ShoppingBag, CreditCard, User, FileText, Tag } from 'lucide-react';
import api from '../lib/api';
import SearchableSelect from '../components/SearchableSelect';
import toast from 'react-hot-toast';

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function NewSalePage() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<any[]>([]);

    const [clienteId, setClienteId] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('PIX');
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
    const [observacoes, setObservacoes] = useState('');
    const [desconto, setDesconto] = useState(0);
    const [itens, setItens] = useState<any[]>([]);

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
            toast.error(`Estoque insuficiente! Disponível: ${prod.estoqueAtual}`);
            return;
        }

        const existe = itens.find(i => i.produtoId === addProdutoId);
        if (existe) {
            if (prod.estoqueAtual < existe.quantidade + addQtd) {
                toast.error('Estoque insuficiente para esta adição.');
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
        if (!clienteId) return toast.error('Selecione um cliente');
        if (itens.length === 0) return toast.error('Adicione pelo menos um item');
        if (desconto > subtotal) return toast.error('O desconto não pode ser maior que o subtotal');
        if (formaPagamento === 'CARTAO' && (quantidadeParcelas < 1 || quantidadeParcelas > 12)) return toast.error('Número de parcelas inválido (1 a 12)');

        setSaving(true);
        try {
            await api.post('/sales', {
                clienteId,
                formaPagamento,
                quantidadeParcelas: formaPagamento === 'CARTAO' ? quantidadeParcelas : undefined,
                desconto,
                observacoes,
                itens: itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, valorUnitario: i.valorUnitario }))
            });
            toast.success('Venda registrada com sucesso!');
            navigate('/sales');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Erro ao registrar venda');
        } finally {
            setSaving(false);
        }
    };

    const clientOptions = clientes.map(c => ({
        id: c.id,
        label: c.nome,
        sublabel: c.telefone
    }));

    const productOptions = produtos.map(p => ({
        id: p.id,
        label: p.nome,
        sublabel: `${fmt(p.precoVenda)} - Est: ${p.estoqueAtual}un`,
        disabled: p.estoqueAtual <= 0
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-ghost bg-white border-2 border-gray-100 shadow-sm"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vender Agora</h1>
                        <p className="text-gray-500 font-medium">Configure e finalize uma nova saída do estoque</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Esquerda: Itens */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 border-primary-100/30 bg-white/80 overflow-visible relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-7">
                                <SearchableSelect
                                    label="Buscar Produto"
                                    placeholder="Comece a digitar o nome do produto..."
                                    options={productOptions}
                                    value={addProdutoId}
                                    onChange={setAddProdutoId}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="label">Qtd</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={addQtd}
                                    onChange={e => setAddQtd(Number(e.target.value))}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="label invisible hidden md:block">Ação</label>
                                <button
                                    className="btn-primary w-full h-[41px]"
                                    onClick={handleAddItem}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-primary-500" />
                            <h3 className="font-bold text-gray-800">Itens Selecionados</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Produto</th>
                                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px] w-24">Qtd</th>
                                    <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Subtotal</th>
                                    <th className="px-6 py-4 w-16 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {itens.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingBag size={32} className="opacity-20" />
                                                <span className="font-medium italic">Sua cesta está vazia no momento</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    itens.map(i => (
                                        <tr key={i.produtoId} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{i.nome}</span>
                                                <div className="text-[10px] text-gray-400 font-medium">{fmt(i.valorUnitario)} un</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-700">{i.quantidade}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary-600">{fmt(i.quantidade * i.valorUnitario)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => removeItem(i.produtoId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Direita: Resumo - Sticky */}
                <div className="lg:col-span-1">
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <div className="card p-6 space-y-6 bg-white border-primary-100 shadow-2xl shadow-primary-500/5 overflow-visible">
                            <SearchableSelect
                                label="Cliente *"
                                placeholder="Selecione o cliente..."
                                options={clientOptions}
                                value={clienteId}
                                onChange={setClienteId}
                            />

                            <div className="space-y-2">
                                <label className="label">Meio de Pagamento *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['PIX', 'CARTAO', 'DINHEIRO', 'BOLETO'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setFormaPagamento(method)}
                                            className={`
                                                px-3 py-3 rounded-xl border-2 text-[11px] font-black transition-all flex items-center justify-center gap-2
                                                ${formaPagamento === method ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-200' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'}
                                            `}
                                        >
                                            {method === 'CARTAO' && <CreditCard size={14} />}
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formaPagamento === 'CARTAO' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="label">Parcelamento</label>
                                    <div className="relative font-bold">
                                        <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select className="input pl-10 bg-gray-50/50" value={quantidadeParcelas} onChange={e => setQuantidadeParcelas(Number(e.target.value))}>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}x sem juros</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">Mercadoria</span>
                                    <span className="text-gray-900">{fmt(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">Desconto</span>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-20 bg-transparent border-b border-gray-200 text-right font-black text-rose-500 focus:border-rose-300 outline-none pr-1"
                                            value={desconto || ''}
                                            onChange={e => setDesconto(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">A Pagar</span>
                                    <span className="text-2xl font-black text-primary-600 leading-none tracking-tighter">{fmt(total)}</span>
                                </div>
                            </div>

                            <textarea
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-xs resize-none h-20 focus:outline-none focus:bg-white transition-all font-medium"
                                placeholder="Notas internas..."
                                value={observacoes}
                                onChange={e => setObservacoes(e.target.value)}
                            />

                            <button onClick={save} disabled={saving} className="w-full btn-primary h-10 text-lg justify-center shadow-primary-500/20 active:scale-95 transition-all">
                                {saving ? (
                                    <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <><Save size={20} /> FINALIZAR VENDA</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
