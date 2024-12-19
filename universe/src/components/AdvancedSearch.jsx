// AdvancedSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AdvancedSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) {
            setError('Query cannot be empty.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await axios.post('http://localhost:5000/search', { query });
            setResults(response.data.results);
        } catch (error) {
            console.error('Search error:', error);
            setError('An error occurred while retrieving results.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center">
            <header className="py-4 w-full bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        AI Academic Search
                    </h1>
                </div>
            </header>

            <main className="w-full max-w-4xl px-4 py-8">
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Enter your search query..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {!loading && results && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Search Results</h2>
                        {results.length === 0 ? (
                            <p>No results found.</p>
                        ) : (
                            <ul className="space-y-4">
                                {results.map((result, index) => (
                                    <li key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <h3 className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                {result.title}
                                            </h3>
                                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                                {result.summary}
                                            </p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdvancedSearch;