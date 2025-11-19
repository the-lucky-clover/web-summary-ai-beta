import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResultsPage = ({ user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [processingQueue, setProcessingQueue] = useState([]);

  // Get query parameters
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  useEffect(() => {
    if (query) {
      searchAndDisplayResults();
    } else {
      loadRecentResults();
    }
  }, [query, type]);

  const searchAndDisplayResults = async () => {
    setLoading(true);
    try {
      // Simulate search - in real app this would call an API
      const mockResults = await generateMockResults(query);
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ytldr_token');
      const response = await fetch('/api/summary/history?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setResults(data.summaries || []);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = async (searchQuery) => {
    // Mock data generation - replace with real search
    return Array.from({ length: 12 }, (_, i) => ({
      id: `result-${i}`,
      title: `${searchQuery} Result ${i + 1}`,
      summary: `This is a comprehensive summary of ${searchQuery} content ${i + 1}. It covers key points, insights, and actionable takeaways from the original source material.`,
      original_url: `https://example.com/${searchQuery}/${i + 1}`,
      thumbnail: generateThumbnail(`https://example.com/${searchQuery}/${i + 1}`),
      type: Math.random() > 0.5 ? 'video' : 'article',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      word_count: Math.floor(Math.random() * 1000) + 200,
      processing_status: 'completed'
    }));
  };

  const generateThumbnail = (url) => {
    // Mock thumbnail generation
    if (url.includes('youtube') || url.includes('video')) {
      return `https://img.youtube.com/vi/${Math.random().toString(36).substr(2, 9)}/maxresdefault.jpg`;
    }
    // Use a placeholder service or generate based on domain
    const domain = new URL(url).hostname;
    return `https://via.placeholder.com/320x180/4ecdc4/ffffff?text=${domain}`;
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleBatchProcess = async () => {
    if (selectedItems.size === 0) return;

    const itemsToProcess = results.filter(item => selectedItems.has(item.id));
    setProcessingQueue(itemsToProcess.map(item => ({ ...item, status: 'queued' })));

    // Process items sequentially
    for (const item of itemsToProcess) {
      try {
        setProcessingQueue(prev =>
          prev.map(q => q.id === item.id ? { ...q, status: 'processing' } : q)
        );

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessingQueue(prev =>
          prev.map(q => q.id === item.id ? { ...q, status: 'completed' } : q)
        );
      } catch (error) {
        setProcessingQueue(prev =>
          prev.map(q => q.id === item.id ? { ...q, status: 'failed' } : q)
        );
      }
    }

    // Clear selection after processing
    setTimeout(() => {
      setSelectedItems(new Set());
      setProcessingQueue([]);
    }, 3000);
  };

  const filteredResults = useMemo(() => {
    if (type === 'all') return results;
    return results.filter(item => item.type === type);
  }, [results, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ← Back to Search
              </button>
              <h1 className="text-2xl font-bold text-white">
                {query ? `Results for "${query}"` : 'Recent Summaries'}
              </h1>
            </div>

            {selectedItems.size > 0 && (
              <button
                onClick={handleBatchProcess}
                className="skeuo-button px-6 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
              >
                Process {selectedItems.size} Items
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'all', label: 'All Results', count: results.length },
              { id: 'video', label: 'Videos', count: results.filter(r => r.type === 'video').length },
              { id: 'article', label: 'Articles', count: results.filter(r => r.type === 'article').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`?q=${query}&type=${tab.id}`)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  type === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Queue */}
      {processingQueue.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
            <h3 className="text-cyan-400 font-bold mb-3">Processing Queue</h3>
            <div className="space-y-2">
              {processingQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white truncate">{item.title}</span>
                  <div className="flex items-center space-x-2">
                    {item.status === 'processing' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    )}
                    <span className={`text-sm font-medium ${
                      item.status === 'completed' ? 'text-green-400' :
                      item.status === 'failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400">Try adjusting your search terms or browse recent summaries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className={`skeuo-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedItems.has(result.id) ? 'ring-2 ring-cyan-400' : ''
                }`}
                onClick={() => handleItemSelect(result.id)}
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  {result.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                      <div className="w-4 h-4 bg-white rounded-sm relative">
                        <div className="absolute left-0.5 top-0.5 w-0 h-0 border-l-3 border-l-black border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                      </div>
                    </div>
                  )}
                  {selectedItems.has(result.id) && (
                    <div className="absolute top-2 left-2 bg-cyan-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {result.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    <span>{result.word_count} words</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;