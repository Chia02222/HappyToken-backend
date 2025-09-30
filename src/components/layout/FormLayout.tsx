
import React from 'react';
import Footer from './Footer';

interface FormLayoutProps {
    title: string;
    children: React.ReactNode;
    showAmendRequestButton?: boolean;
    onAmendRequest?: () => void;
    amendRequestDisabled?: boolean;
}

const FormLayout: React.FC<FormLayoutProps> = ({ title, children, showAmendRequestButton, onAmendRequest, amendRequestDisabled }) => {
    return (
        <div className="min-h-screen bg-ht-gray-light font-sans text-sm flex flex-col">
            <div className="bg-ht-blue shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-white">{title}</h1>
                {showAmendRequestButton && (
                    <button
                        onClick={onAmendRequest}
                        disabled={amendRequestDisabled}
                        className={`text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${amendRequestDisabled ? 'bg-orange-300 cursor-not-allowed text-white' : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'}`}
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
