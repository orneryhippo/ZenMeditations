
import React from 'react';
import Button from './Button';

interface ApiKeyGatewayProps {
  onSuccess: () => void;
}

const ApiKeyGateway: React.FC<ApiKeyGatewayProps> = ({ onSuccess }) => {
  const handleSelectKey = async () => {
    try {
      // Accessing global aistudio interface defined by environment
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        onSuccess();
      } else {
        // Fallback for local dev if window.aistudio is not present
        onSuccess();
      }
    } catch (error) {
      console.error("Error selecting key:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">High-Quality AI Enabled</h2>
        <p className="text-gray-600 mb-8">
          To generate premium 1K-4K visuals and high-fidelity audio, please select your Google Cloud project API key.
          <br />
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-medium block mt-2"
          >
            Learn about billing →
          </a>
        </p>
        <Button onClick={handleSelectKey} className="w-full">
          Select API Key to Begin
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyGateway;
