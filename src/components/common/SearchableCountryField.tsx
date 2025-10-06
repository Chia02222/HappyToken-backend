import React, { useState, useRef, useEffect } from 'react';
import { countries } from '../../data/countries';

interface SearchableCountryFieldProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    className?: string;
    error?: string;
    required?: boolean;
}

const SearchableCountryField: React.FC<SearchableCountryFieldProps> = ({ 
    value, 
    onChange, 
    id, 
    placeholder = "Select Country",
    className = "",
    error,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                country.callingCode.includes(searchTerm)
            );
            setFilteredCountries(filtered);
        }
    }, [searchTerm]);

    useEffect(() => {
        setFilteredCountries(countries);
    }, []);

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

    const handleSelect = (countryName: string) => {
        onChange(countryName);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        } else if (e.key === 'Enter' && filteredCountries.length > 0) {
            handleSelect(filteredCountries[0].name);
        }
    };

    const selectedCountry = countries.find(country => country.name === value);

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
                className={`w-full border rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white cursor-pointer ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300'} ${className}`}
                placeholder={placeholder}
                required={required}
            />
            
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto left-0 top-full">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                            <div
                                key={country.name}
                                onClick={() => handleSelect(country.name)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                                <span className="font-medium text-gray-700">{country.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No matching countries found</div>
                    )}
                </div>
            )}
            
            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
};

export default SearchableCountryField;
