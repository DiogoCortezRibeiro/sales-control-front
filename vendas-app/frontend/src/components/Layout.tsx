import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Package, Users, ShoppingCart, FileText,
    LogOut, Menu, X, TrendingUp, Wallet
} from 'lucide-react';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/customers', icon: Users, label: 'Clientes' },
    { path: '/sales', icon: ShoppingCart, label: 'Vendas' },
    { path: '/finance', icon: Wallet, label: 'Financeiro' },
    { path: '/reports', icon: FileText, label: 'Relatórios' },
];

export default function Layout() {
    const { usuario, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-transparent">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out
                lg:relative lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <TrendingUp size={18} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">VendasPro</span>
                    <button className="lg:hidden ml-auto text-slate-400" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                    <button className="lg:hidden ml-auto text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                            {usuario?.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{usuario?.nome}</p>
                            <p className="text-slate-400 text-xs truncate">{usuario?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-800"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header mobile */}
                <header className="h-16 lg:hidden flex items-center px-4 bg-white border-b border-gray-100 shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-gray-900">VendasPro</span>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 custom-scrollbar animate-fade-in relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
