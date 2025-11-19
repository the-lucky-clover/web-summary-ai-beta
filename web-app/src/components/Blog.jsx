import React from 'react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

  const blogPost = {
    title: "From Data Leaks to Privacy-First: The Birth of YTldr",
    date: "2025-01-15",
    author: "YTldr Team",
    content: `
We were initially surprised to learn about the potentially evil exodus of personal data being leaked from popular summarization extensions. The privacy announcement was fed to consumers saying "we don't want your data" - but we felt fleeced.

Yet we recalled the age-old adage: "if the product is free, you are the product." It's true! We were in the process of reporting these data-leaking extensions when we discovered something remarkable.

Through curiosity itself, we set out to improve on the concept we discovered. I had never reverse engineered anything before, and it was exhilarating! Finding hidden data leaking extensions made us feel like bug bounty hunters.

That's why we built YTldr - a privacy-first alternative that charges a modest amount to maintain true data privacy. No data harvesting, no hidden tracking, just transparent, secure AI summarization powered by Google Gemini.

## Why We Charge

In a world where "free" often means "your data is the product," we believe in sustainable privacy protection. Our modest pricing ($7.77/month or $77.77/year) covers:

- **Operational Costs**: Running secure, private AI infrastructure
- **Privacy Protection**: Regular security audits and updates
- **Transparency**: Maintaining detailed activity logs for users
- **Data Broker Removal**: Helping users protect their digital footprint

## Our Commitment

We promise:
- 🔒 Zero data harvesting
- 👁️ Complete transparency
- 🤖 Google Gemini AI power
- 📱 Cross-platform support
- 🛡️ Secure API key storage

Building trust through transparency and charging fairly for privacy protection.
    `
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">YT</span>
          </div>
          <span className="text-xl font-bold">YTldr Blog</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Home
          </button>
        </nav>
      </header>

      {/* Blog Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {blogPost.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-400">
              <span>By {blogPost.author}</span>
              <span>•</span>
              <span>{new Date(blogPost.date).toLocaleDateString()}</span>
            </div>
          </header>

          <div className="prose prose-lg prose-invert max-w-none">
            {blogPost.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mb-4 mt-8 text-cyan-400">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              } else if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="ml-6 mb-2">
                    {paragraph.replace('- ', '')}
                  </li>
                );
              } else if (paragraph.trim() === '') {
                return <br key={index} />;
              } else {
                return (
                  <p key={index} className="mb-4 leading-relaxed text-gray-300">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
        </article>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Try Privacy-First AI?</h3>
          <p className="text-gray-400 mb-6">Start your 7-day free trial today</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
          >
            Start Free Trial
          </button>
        </div>
      </main>
    </div>
  );
};

export default Blog;