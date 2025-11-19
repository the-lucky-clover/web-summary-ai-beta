-- YTLDR Database Schema
-- Elite AI Summarization Platform

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  magic_link_token TEXT,
  magic_link_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  api_usage_count INTEGER DEFAULT 0,
  last_login_at DATETIME
);

-- Summaries table
CREATE TABLE summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  original_url TEXT NOT NULL,
  original_content TEXT,
  summary_text TEXT NOT NULL,
  summary_metadata TEXT, -- JSON metadata
  ai_provider TEXT DEFAULT 'gemini',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processing_time_ms INTEGER,
  content_type TEXT, -- 'article', 'youtube', 'pdf', etc.
  word_count INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Keys table (for user-managed keys)
CREATE TABLE user_api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL, -- 'gemini', 'openai', etc.
  api_key_encrypted TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  usage_count INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email verification codes
CREATE TABLE email_verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stripe_price_id TEXT UNIQUE,
  monthly_limit INTEGER NOT NULL,
  features TEXT, -- JSON array of features
  price_cents INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Favorites table
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  summary_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (summary_id) REFERENCES summaries(id) ON DELETE CASCADE
);

-- Rubbish bin for deleted items
CREATE TABLE deleted_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  original_summary_id INTEGER NOT NULL,
  summary_data TEXT NOT NULL, -- JSON of the original summary
  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  auto_delete_at DATETIME, -- 30 days from deletion
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_magic_link_token ON users(magic_link_token);
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_created_at ON summaries(created_at);
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_email_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_summary_id ON favorites(summary_id);
CREATE INDEX idx_deleted_summaries_user_id ON deleted_summaries(user_id);
CREATE INDEX idx_deleted_summaries_auto_delete_at ON deleted_summaries(auto_delete_at);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, monthly_limit, features, price_cents) VALUES
('Free', 50, '["Basic summarization", "Limited storage"]', 0),
('Pro', 1000, '["Advanced AI", "Unlimited storage", "Priority support"]', 999),
('Elite', -1, '["All features", "Custom AI models", "White-label option"]', 2999);