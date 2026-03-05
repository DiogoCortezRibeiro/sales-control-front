import { useEffect, useState } from 'react';
import { Download, Search, FileText } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Venda {
    id: string;
    dataVenda: string;
    formaPagamento: string;
    total: number;
    cliente: { nome: string };
    itens: Array<{ produto: { nome: string; sku: string } }>;
}

const fmt = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });

export default function ReportsPage() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [resumo, setResumo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const fetch = async () => {
        setLoading(true);
        const params: any = {};
        if (dataInicio) params.dataInicio = dataInicio;
        if (dataFim) params.dataFim = dataFim;

        const { data } = await api.get('/sales/report', { params });
        setVendas(data.vendas);
        setResumo(data.resumo);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const exportCsv = () => {
        if (vendas.length === 0) return;
        const header = ['Data', 'Cliente', 'Pagamento', 'Total', 'Produtos'];
        const rows = vendas.map(v => [
            fmtDate(v.dataVenda),
            v.cliente?.nome,
            v.formaPagamento,
            v.total.toString().replace('.', ','),
            v.itens.map(i => i.produto.nome).join(' | ')
        ]);

        const csvContent = [header, ...rows].map(e => e.join(';')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio-vendas-${new Date().getTime()}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                    <p className="text-gray-500 text-sm">Análise detalhada e exportação</p>
                </div>
                <button onClick={exportCsv} disabled={vendas.length === 0} className="btn-secondary">
                    <Download size={16} /> Exportar CSV
                </button>
            </div>

            <div className="card p-4 flex gap-4 flex-wrap items-end bg-white">
                <div>
                    <label className="label">Data Início</label>
                    <input type="date" className="input" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div>
                    <label className="label">Data Fim</label>
                    <input type="date" className="input" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
                <button onClick={fetch} className="btn-primary"><Search size={16} /> Filtrar</button>
            </div>

            {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 border-l-4 border-l-primary-500">
                        <p className="text-sm text-gray-500">Total Período</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(resumo.totalGeral)}</p>
                    </div>
                    <div className="card p-4 border-l-4 border-l-green-500">
                        <p className="text-sm text-gray-500">Qtd. Vendas</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{resumo.totalVendas}</p>
                    </div>
                    <div className="card p-4 border-l-4 border-l-purple-500">
                        <p className="text-sm text-gray-500">Ticket Médio</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(resumo.ticketMedio)}</p>
                    </div>
                </div>
            )}

            <div className="card overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                            <tr>
                                {['Data', 'Cliente', 'Pagamento', 'Produtos', 'Total'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Gerando relatório...</td></tr>
                            ) : vendas.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                    <FileText size={40} className="mx-auto mb-2 opacity-30" />
                                    Sem vendas no período
                                </td></tr>
                            ) : (
                                vendas.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-600">{fmtDate(v.dataVenda)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{v.cliente?.nome}</td>
                                        <td className="px-4 py-3 text-gray-600">{v.formaPagamento}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                                            {v.itens.map(i => i.produto.nome).join(', ')}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{fmt(v.total)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
