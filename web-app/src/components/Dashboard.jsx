import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

// Memoized Summary Card Component for Performance
const SummaryCard = memo(({ summary, onDelete, onFavorite, isFavorited }) => (
  <div className="skeuo-card rounded-xl p-4 hover:scale-105 transition-all duration-300 will-change-transform gpu-accelerated">
    <div className="flex justify-between items-start mb-3">
      <a
        href={summary.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 truncate font-medium"
      >
        {summary.original_url || 'Direct Content'}
      </a>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onFavorite(summary.id)}
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded hover:bg-yellow-500/10"
          title="Add to favorites"
          aria-label="Add to favorites"
        >
          ⭐
        </button>
        <button
          onClick={() => onDelete(summary.id)}
          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/10"
          title="Delete summary"
          aria-label="Delete summary"
        >
          🗑️
        </button>
      </div>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed mb-2">
      {summary.summary_text}
    </p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span>{new Date(summary.created_at).toLocaleDateString()}</span>
      <span>{summary.word_count} words</span>
    </div>
  </div>
));

const Dashboard = ({ user }) => {
  const [data, setData] = useState({
    summaries: [],
    favorites: [],
    rubbishBin: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [confirmAction, setConfirmAction] = useState(null);
  const [batchUrls, setBatchUrls] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    history: { offset: 0, hasMore: true },
    favorites: { offset: 0, hasMore: true },
    rubbish: { offset: 0, hasMore: true }
  });

  // Memoized API calls for performance
  const apiCalls = useMemo(() => ({
    history: (offset = 0) => fetch(`/api/summary/history?offset=${offset}`, {
      headers: { Authorization: localStorage.getItem('ytldr_token') }
    }),
    favorites: (offset = 0) => fetch(`/api/summary/favorites/all?offset=${offset}`, {
      headers: { Authorization: localStorage.getItem('ytldr_token') }
    }),
    rubbish: (offset = 0) => fetch(`/api/summary/rubbish-bin/all?offset=${offset}`, {
      headers: { Authorization: localStorage.getItem('ytldr_token') }
    })
  }), []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = useCallback(async (loadMore = false) => {
    if (!loadMore) setLoading(true);

    try {
      const response = await apiCalls[activeTab](pagination[activeTab].offset);
      const result = await response.json();

      setData(prev => ({
        ...prev,
        [activeTab === 'history' ? 'summaries' :
         activeTab === 'favorites' ? 'favorites' : 'rubbishBin']:
          loadMore ? [...prev[activeTab === 'history' ? 'summaries' :
                           activeTab === 'favorites' ? 'favorites' : 'rubbishBin'], ...result[activeTab === 'history' ? 'summaries' :
                                                                                  activeTab === 'favorites' ? 'favorites' : 'deleted'] || []] :
          result[activeTab === 'history' ? 'summaries' :
                activeTab === 'favorites' ? 'favorites' : 'deleted'] || []
      }));

      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            hasMore: result.pagination.hasMore,
            offset: loadMore ? prev[activeTab].offset + 20 : 0
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      if (!loadMore) setLoading(false);
    }
  }, [activeTab, apiCalls, pagination]);

  // Optimized action handlers with error boundaries
  const handleAction = useCallback(async (action, id, confirmMessage) => {
    if (confirmAction?.id !== id || confirmAction?.action !== action) {
      setConfirmAction({ action, id, message: confirmMessage });
      return;
    }

    try {
      const token = localStorage.getItem('ytldr_token');
      let endpoint, method = 'POST';

      switch (action) {
        case 'delete':
          endpoint = `/api/summary/${id}`;
          method = 'DELETE';
          break;
        case 'favorite':
          endpoint = `/api/summary/${id}/favorite`;
          break;
        case 'recover':
          endpoint = `/api/summary/rubbish-bin/${id}/recover`;
          break;
        default:
          throw new Error('Unknown action');
      }

      const response = await fetch(endpoint, {
        method,
        headers: { Authorization: token }
      });

      if (!response.ok) throw new Error('Action failed');

      loadData();
      setConfirmAction(null);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Failed to ${action}. Please try again.`);
    }
  }, [confirmAction, loadData]);

  const handleClearAll = useCallback(async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL summaries?')) return;
    if (!confirm('🚨 FINAL WARNING: All summaries will be moved to rubbish bin for 30 days!')) return;

    try {
      const token = localStorage.getItem('ytldr_token');
      await fetch('/api/summary/history/all', {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      loadData();
    } catch (error) {
      console.error('Failed to clear all:', error);
      alert('Failed to clear history. Please try again.');
    }
  }, [loadData]);

  // Batch processing function
  const handleBatchSummarize = async () => {
    const urls = batchUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      alert('Please enter at least one URL');
      return;
    }

    setBatchProcessing(true);
    setBatchResults([]);

    try {
      const token = localStorage.getItem('ytldr_token');
      const results = [];

      for (const url of urls) {
        try {
          const response = await fetch('/api/summary/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token
            },
            body: JSON.stringify({ url: url.trim() })
          });

          if (response.ok) {
            const result = await response.json();
            results.push({ url, success: true, summary: result.summary });
          } else {
            results.push({ url, success: false, error: 'Failed to summarize' });
          }
        } catch (error) {
          results.push({ url, success: false, error: error.message });
        }
      }

      setBatchResults(results);
    } catch (error) {
      alert('Batch processing failed: ' + error.message);
    } finally {
      setBatchProcessing(false);
    }
  };

  // Memoized computed values
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'history': return data.summaries;
      case 'favorites': return data.favorites;
      case 'rubbish': return data.rubbishBin;
      default: return [];
    }
  }, [activeTab, data]);

  const isFavorited = useCallback((summaryId) => {
    return data.favorites.some(fav => fav.id === summaryId);
  }, [data.favorites]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading your summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
          Dashboard
        </h1>
        <p className="text-gray-400">Welcome back, {user?.email}</p>
      </div>

      {/* Skeuomorphic Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-2xl backdrop-blur-sm border border-cyan-500/20 shadow-2xl">
          {[
            { id: 'batch', label: 'Batch Process', icon: '⚡' },
            { id: 'history', label: 'History', icon: '📚' },
            { id: 'favorites', label: 'Favorites', icon: '⭐' },
            { id: 'rubbish', label: 'Rubbish Bin', icon: '🗑️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-slate-700/50'
              }`}
              style={{
                boxShadow: activeTab === tab.id ? '0 8px 25px rgba(78, 205, 196, 0.3)' : 'none'
              }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1">
          <div className="skeuo-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Usage Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">This Month</span>
                <span className="text-white font-bold">0 / 50</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner">
                <div className="bg-gradient-to-r from-cyan-500 to-pink-500 h-3 rounded-full shadow-lg" style={{ width: '0%' }}></div>
              </div>
              <div className="text-center">
                <button
                  onClick={handleClearAll}
                  className="w-full mt-4 py-2 px-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-300 text-sm font-bold"
                >
                  🗑️ Clear All History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="skeuo-card rounded-2xl p-6 min-h-[600px]">

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-cyan-400">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'batch' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-cyan-400">⚡ Batch URL Summarization</h3>
                      <span className="text-sm text-gray-400">Process multiple URLs at once</span>
                    </div>

                    <div className="skeuo-card rounded-xl p-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Enter URLs (one per line)
                      </label>
                      <textarea
                        value={batchUrls}
                        onChange={(e) => setBatchUrls(e.target.value)}
                        placeholder="https://example.com/article1&#10;https://example.com/article2&#10;https://example.com/article3"
                        className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                        disabled={batchProcessing}
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {batchUrls.split('\n').filter(url => url.trim()).length} URLs entered
                        </span>
                        <button
                          onClick={handleBatchSummarize}
                          disabled={batchProcessing || !batchUrls.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {batchProcessing ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            '🚀 Start Batch Processing'
                          )}
                        </button>
                      </div>
                    </div>

                    {batchResults.length > 0 && (
                      <div className="skeuo-card rounded-xl p-6">
                        <h4 className="text-lg font-bold text-cyan-400 mb-4">📊 Results</h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {batchResults.map((result, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                result.success
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-red-500/10 border-red-500/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 truncate font-medium text-sm"
                                >
                                  {result.url}
                                </a>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  result.success
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {result.success ? '✅ Success' : '❌ Failed'}
                                </span>
                              </div>
                              {result.success ? (
                                <p className="text-gray-300 text-sm leading-relaxed">
                                  {result.summary}
                                </p>
                              ) : (
                                <p className="text-red-400 text-sm">
                                  Error: {result.error}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-cyan-400">Recent Summaries</h3>
                      <span className="text-sm text-gray-400">{summaries.length} items</span>
                    </div>
                    {currentData.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-secondary">No summaries yet. Start by summarizing some content!</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-700">
                        {currentData.map((summary) => (
                          <SummaryCard
                            key={summary.id}
                            summary={summary}
                            onDelete={(id) => handleAction('delete', id, 'Move to rubbish bin?')}
                            onFavorite={(id) => handleAction('favorite', id, 'Lock as favorite?')}
                            isFavorited={isFavorited(summary.id)}
                          />
                        ))}
                        {pagination[activeTab].hasMore && (
                          <button
                            onClick={() => loadData(true)}
                            className="w-full py-3 skeuo-button rounded-lg text-cyan-400 hover:text-white transition-colors"
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'favorites' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-pink-400">⭐ Favorite Summaries</h3>
                      <span className="text-sm text-gray-400">{favorites.length} items</span>
                    </div>
                    {favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">⭐</div>
                        <p className="text-gray-400">No favorites yet. Star some summaries to save them here!</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {favorites.map((summary) => (
                          <div key={summary.id} className="skeuo-card rounded-xl p-4"
                               style={{ background: 'linear-gradient(145deg, rgba(255, 193, 7, 0.1), rgba(236, 72, 153, 0.1))' }}>
                            <div className="flex justify-between items-start mb-3">
                              <a
                                href={summary.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 truncate font-medium"
                              >
                                {summary.original_url || 'Direct Content'}
                              </a>
                              <span className="text-yellow-400 text-sm ml-2">Favorited {new Date(summary.favorited_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-2">
                              {summary.summary_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'rubbish' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-red-400">🗑️ Rubbish Bin</h3>
                      <span className="text-sm text-gray-400">{rubbishBin.length} items</span>
                    </div>
                    {rubbishBin.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🗑️</div>
                        <p className="text-gray-400">Rubbish bin is empty. Deleted items will appear here for 30 days.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {rubbishBin.map((item) => (
                          <div key={item.id} className="skeuo-card rounded-xl p-4"
                               style={{ background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))' }}>
                            <div className="flex justify-between items-start mb-3">
                              <a
                                href={item.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 truncate font-medium"
                              >
                                {item.original_url || 'Direct Content'}
                              </a>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleRecover(item.id)}
                                  className="text-green-400 hover:text-green-300 transition-colors p-1"
                                  title="Recover summary"
                                >
                                  🔄
                                </button>
                                <span className="text-red-400 text-xs">
                                  Deleted {new Date(item.deleted_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-2">
                              {item.summary_text}
                            </p>
                            <div className="text-xs text-red-400">
                              Recovery deadline: {new Date(item.recovery_deadline).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unified Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="skeuo-card rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {confirmAction.action === 'delete' ? '🗑️' :
                 confirmAction.action === 'favorite' ? '⭐' :
                 confirmAction.action === 'recover' ? '🔄' : '⚠️'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                confirmAction.action === 'delete' ? 'text-red-400' :
                confirmAction.action === 'favorite' ? 'text-yellow-400' :
                confirmAction.action === 'recover' ? 'text-green-400' : 'text-cyan-400'
              }`}>
                Confirm {confirmAction.action.charAt(0).toUpperCase() + confirmAction.action.slice(1)}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {confirmAction.message}
                {confirmAction.action === 'delete' && ' (30-day recovery available)'}
                {confirmAction.action === 'favorite' && ' (permanently locked)'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 px-4 bg-slate-600 rounded-lg text-white hover:bg-slate-500 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.action, confirmAction.id)}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                  confirmAction.action === 'delete' ? 'bg-red-500 hover:bg-red-600' :
                  confirmAction.action === 'favorite' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  confirmAction.action === 'recover' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-cyan-500 hover:bg-cyan-600'
                }`}
              >
                {confirmAction.action === 'delete' ? '🗑️ Delete' :
                 confirmAction.action === 'favorite' ? '⭐ Favorite' :
                 confirmAction.action === 'recover' ? '🔄 Recover' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;