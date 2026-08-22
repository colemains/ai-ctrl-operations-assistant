-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(100),
  discipline VARCHAR(100),
  data_access JSONB,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  resource_id VARCHAR(255),
  client_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_client_id ON audit_log(client_id);

-- Query History Table
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  query_text TEXT NOT NULL,
  data_sources TEXT[],
  response_summary TEXT,
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at);

-- Model Usage Table (for cost tracking)
CREATE TABLE IF NOT EXISTS model_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  user_email VARCHAR(255),
  organization_id VARCHAR(255),
  discipline VARCHAR(100),
  agent_id VARCHAR(255),
  model VARCHAR(100) NOT NULL,
  prompt_version VARCHAR(50),
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  estimated_cost_usd DECIMAL(10,6),
  client_scope TEXT[],
  query_id UUID REFERENCES query_history(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_usage_user_id ON model_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_created_at ON model_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_model_usage_model ON model_usage(model);

-- Investigations Table (for tracking alert correlations)
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id VARCHAR(255) UNIQUE NOT NULL,
  alert_ids TEXT[],
  ticket_ids TEXT[],
  client_id VARCHAR(255),
  component VARCHAR(255),
  started_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  evidence JSONB,
  hypotheses JSONB,
  actions_suggested JSONB,
  human_owner VARCHAR(255),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigations_client_id ON investigations(client_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_started_at ON investigations(started_at);

-- Team Memory Entries Table (for RAG)
CREATE TABLE IF NOT EXISTS memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50),
  source VARCHAR(255),
  author VARCHAR(255),
  tags TEXT[],
  embedding_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_entries_team_id ON memory_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_memory_entries_created_at ON memory_entries(created_at);

-- Team Memory Relationships Table
CREATE TABLE IF NOT EXISTS memory_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  to_memory_id UUID REFERENCES memory_entries(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100),
  strength DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_rel_from ON memory_relationships(from_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_rel_to ON memory_relationships(to_memory_id);