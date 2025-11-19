import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '50 summaries per month',
        'Basic AI summarization',
        'Web page support',
        'Browser extension',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      features: [
        '1,000 summaries per month',
        'Advanced AI models',
        'YouTube video support',
        'PDF document support',
        'Priority support',
        'API access'
      ],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Elite',
      price: '$29.99',
      period: 'per month',
      features: [
        'Unlimited summaries',
        'All AI models',
        'Custom AI training',
        'Team collaboration',
        'White-label options',
        '24/7 premium support'
      ],
      buttonText: 'Go Elite',
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join the elite ranks of AI-powered content summarization. No hidden fees, transparent pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-8 ${
              plan.popular
                ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'border-cyan-500/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-black text-cyan-400 mb-1">{plan.price}</div>
              <div className="text-gray-400">{plan.period}</div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-4 rounded-lg font-bold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:from-cyan-400 hover:to-pink-400 shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-slate-700 text-white hover:bg-slate-600 border border-cyan-500/30'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Can I change plans anytime?</h3>
            <p className="text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Is my data secure?</h3>
            <p className="text-gray-300">Absolutely. We use enterprise-grade encryption and never share your data with third parties.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Do you offer refunds?</h3>
            <p className="text-gray-300">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Can I cancel anytime?</h3>
            <p className="text-gray-300">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;