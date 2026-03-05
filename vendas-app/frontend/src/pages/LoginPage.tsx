import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@vendas.com');
    const [senha, setSenha] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, senha);
            navigate('/dashboard');
        } catch {
            setError('Email ou senha incorretos');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                        <TrendingUp className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">VendasPro</h1>
                    <p className="text-slate-400 mt-1">Sistema de Gestão de Vendas</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar na sua conta</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@vendas.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Senha</label>
                            <input
                                type="password"
                                className="input"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary justify-center py-2.5 mt-2"
                        >
                            {loading ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
