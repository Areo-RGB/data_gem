
import React from 'react';

interface AnalysisCardProps {
    analysis: string;
    isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
        <span className="ml-2 text-gray-300">Analyzing data... please wait.</span>
    </div>
);

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse">
                <LoadingSpinner />
            </div>
        );
    }

    if (!analysis) {
        return null; // Don't render anything if there's no analysis and it's not loading
    }
    
    // A simple markdown-to-html converter
    const renderMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold text-white mt-4 mb-2">{line.substring(4)}</h3>;
                if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{line.substring(3)}</h2>;
                if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{line.substring(2)}</h1>;
                if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
                if (line.match(/^\d+\./)) return <li key={index} className="ml-6 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>
                return <p key={index} className="my-2">{line}</p>;
            })
    }

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">AI Performance Insights</h3>
            <div className="prose prose-invert max-w-none text-gray-300 space-y-2">
                 {renderMarkdown(analysis)}
            </div>
        </div>
    );
};

export default AnalysisCard;
