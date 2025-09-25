
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface FormLayoutProps {
    title: string;
    children: React.ReactNode;
    showAmendRequestButton?: boolean;
    onAmendRequest?: () => void;
}

const FormLayout: React.FC<FormLayoutProps> = ({ title, children, showAmendRequestButton, onAmendRequest }) => {
    return (
        <div className="min-h-screen bg-ht-gray-light font-sans text-sm flex flex-col">
            <Header />
            <div className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-ht-gray-dark">{title}</h1>
                {showAmendRequestButton && (
                    <button
                        onClick={onAmendRequest}
                        className="text-sm bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Amend Request
                    </button>
                )}
            </div>
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default FormLayout;
