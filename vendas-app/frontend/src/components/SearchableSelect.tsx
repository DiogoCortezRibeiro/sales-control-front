import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    sublabel?: string;
    disabled?: boolean;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder, label }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-1.5" ref={containerRef}>
            {label && <label className="label">{label}</label>}
            <div className="relative">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex items-center justify-between w-full px-4 py-2.5 
                        bg-white border-2 rounded-xl cursor-not-allowed
                        transition-all duration-200 hover:border-primary-400
                        ${isOpen ? 'border-primary-500 ring-4 ring-primary-50 shadow-sm' : 'border-gray-100'}
                        ${!value ? 'text-gray-400' : 'text-gray-900 font-medium'}
                        cursor-pointer
                    `}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                        <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Comece a digitar para filtrar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    Nenhum resultado encontrado
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => {
                                            onChange(option.id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`
                                            flex flex-col px-4 py-2.5 rounded-lg cursor-pointer transition-colors
                                            ${option.id === value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'}
                                            ${option.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                        `}
                                    >
                                        <span className="text-sm font-semibold">{option.label}</span>
                                        {option.sublabel && (
                                            <span className={`text-xs ${option.id === value ? 'text-primary-500' : 'text-gray-400'}`}>
                                                {option.sublabel}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
