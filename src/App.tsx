import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Skeleton from 'react-loading-skeleton';
import { useAuthenticationStatus, useUserData, useSignOut } from '@nhost/react';
import { Auth } from './components/Auth';
import 'react-loading-skeleton/dist/skeleton.css';

export default function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const { signOut } = useSignOut();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setSummary('');

    if (!url) {
      setError('Please enter a YouTube URL');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('https://rosip.app.n8n.cloud/webhook/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }) // Just passing the URL directly
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No data received from server');
      }

      setSummary(data.summary || data.text || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch video summary';
      setError(`Error: ${errorMessage}. Please try again.`);
      console.error('Error details:', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-4xl">
          <Skeleton count={5} className="mb-4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex justify-between items-center mb-12 bg-white rounded-lg shadow-sm p-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              YouTube Video Summarizer
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-all"
          >
            Sign Out
          </button>
        </header>

        <main>
          <form onSubmit={handleSummarize} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL
                </label>
                <input
                  id="youtube-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                  required
                  pattern="https?:\/\/(www\.)?youtube\.com\/watch\?v=.*|https?:\/\/youtu\.be\/.*"
                  title="Please enter a valid YouTube URL"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Summarize'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Summary</h2>
            <div className="prose max-w-none">
              {isProcessing ? (
                <div className="space-y-4">
                  <Skeleton count={5} />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : summary ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-blue-600 italic">
                    Enter a YouTube URL above to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by AI • Get concise video summaries instantly</p>
        </footer>
      </div>
    </div>
  );
}