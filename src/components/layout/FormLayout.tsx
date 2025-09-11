
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface FormLayoutProps {
    title: string;
    children: React.ReactNode;
}

const FormLayout: React.FC<FormLayoutProps> = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-ht-gray-light font-sans text-sm flex flex-col">
            <Header />
            <div className="bg-white shadow-sm p-4">
                <h1 className="text-lg font-semibold text-ht-gray-dark">{title}</h1>
            </div>
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default FormLayout;
