import React, { useState, useRef, useEffect } from 'react';
import { getUniqueCallingCodes } from '../../data/countries';

interface CallingCodeOption {
    code: string;
    countries: string[];
}

interface SearchableCallingCodeFieldProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
}

const SearchableCallingCodeField: React.FC<SearchableCallingCodeFieldProps> = ({ value, onChange, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCodes, setFilteredCodes] = useState<CallingCodeOption[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const allCodes = getUniqueCallingCodes();

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredCodes(allCodes);
        } else {
            const filtered = allCodes.filter(item =>
                item.code.includes(searchTerm) ||
                item.countries.some(country => 
                    country.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredCodes(filtered);
        }
    }, [searchTerm]);

    useEffect(() => {
        setFilteredCodes(allCodes);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        onChange(code);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        } else if (e.key === 'Enter' && filteredCodes.length > 0) {
            handleSelect(filteredCodes[0].code);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                ref={inputRef}
                type="text"
                id={id}
                value={isOpen ? searchTerm : value}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm focus:ring-ht-blue focus:border-ht-blue w-24 cursor-pointer h-[38px]"
                placeholder="+60"
            />
            
            {isOpen && (
                <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto left-0 top-full">
                    {filteredCodes.length > 0 ? (
                        filteredCodes.map((item) => (
                            <div
                                key={item.code}
                                onClick={() => handleSelect(item.code)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                                <span className="font-semibold text-gray-700">{item.code}</span>
                                <span className="text-gray-500 ml-2 text-xs block truncate">
                                    {item.countries.slice(0, 2).join(', ')}
                                    {item.countries.length > 2 && ` +${item.countries.length - 2} more`}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No matching codes found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableCallingCodeField;
