import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

class AutonomousAgent {
  constructor(id, type, capabilities) {
    this.id = id;
    this.type = type;
    this.capabilities = capabilities;
    this.memory = [];
    this.tasks = [];
    this.status = 'idle';
    this.learningData = new Map();
  }

  async executeTask(task) {
    this.status = 'processing';
    try {
      const result = await this.processTask(task);
      this.memory.push({ task, result, timestamp: Date.now() });
      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  async processTask(task) {
    // Simulate AI processing with different agent types
    switch (this.type) {
      case 'summarizer':
        return await this.summarizeContent(task);
      case 'analyzer':
        return await this.analyzeContent(task);
      case 'researcher':
        return await this.researchTopic(task);
      case 'writer':
        return await this.generateContent(task);
      default:
        return await this.generalTask(task);
    }
  }

  async summarizeContent(task) {
    // Simulate summarization with Gemini
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: task.content,
        type: task.type || 'concise',
        agent: this.id
      })
    });
    return await response.json();
  }

  async analyzeContent(task) {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: task.content,
        analysis: task.analysis || ['sentiment', 'topics', 'insights'],
        agent: this.id
      })
    });
    return await response.json();
  }

  async researchTopic(task) {
    const response = await fetch('/api/ai/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: task.query,
        depth: task.depth || 'comprehensive',
        agent: this.id
      })
    });
    return await response.json();
  }

  async generateContent(task) {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: task.prompt,
        style: task.style || 'professional',
        agent: this.id
      })
    });
    return await response.json();
  }

  async generalTask(task) {
    const response = await fetch('/api/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task.description,
        context: task.context,
        agent: this.id
      })
    });
    return await response.json();
  }

  learn(pattern, outcome) {
    const key = JSON.stringify(pattern);
    const existing = this.learningData.get(key) || { count: 0, outcomes: [] };
    existing.count++;
    existing.outcomes.push(outcome);
    this.learningData.set(key, existing);
  }

  getLearnedBehavior(pattern) {
    const key = JSON.stringify(pattern);
    return this.learningData.get(key);
  }
}

class TaskOrchestrator {
  constructor() {
    this.agents = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.activeTasks = new Set();
  }

  registerAgent(agent) {
    this.agents.set(agent.id, agent);
  }

  async submitTask(task) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const enhancedTask = {
      id: taskId,
      ...task,
      status: 'queued',
      createdAt: Date.now(),
      assignedAgent: null
    };

    this.taskQueue.push(enhancedTask);
    await this.processQueue();
    return taskId;
  }

  async processQueue() {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle');

    for (const agent of availableAgents) {
      const suitableTask = this.taskQueue.find(task =>
        this.isAgentSuitable(agent, task) && !this.activeTasks.has(task.id)
      );

      if (suitableTask) {
        await this.assignTask(agent, suitableTask);
      }
    }
  }

  isAgentSuitable(agent, task) {
    return agent.capabilities.some(cap => task.requiredCapabilities?.includes(cap));
  }

  async assignTask(agent, task) {
    this.activeTasks.add(task.id);
    task.status = 'processing';
    task.assignedAgent = agent.id;

    try {
      const result = await agent.executeTask(task);
      task.status = 'completed';
      task.result = result;
      task.completedAt = Date.now();

      this.completedTasks.push(task);
      this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);

      // Learn from successful task completion
      agent.learn({
        taskType: task.type,
        capabilities: task.requiredCapabilities
      }, 'success');

    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.failedAt = Date.now();

      // Learn from failure
      agent.learn({
        taskType: task.type,
        capabilities: task.requiredCapabilities
      }, 'failure');

      // Retry logic
      if (task.retryCount < 3) {
        task.retryCount = (task.retryCount || 0) + 1;
        task.status = 'queued';
        this.activeTasks.delete(task.id);
        setTimeout(() => this.processQueue(), 5000); // Retry after 5 seconds
        return;
      }
    }

    this.activeTasks.delete(task.id);
    this.processQueue(); // Process next task
  }

  getTaskStatus(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId) ||
                 this.completedTasks.find(t => t.id === taskId) ||
                 Array.from(this.activeTasks).find(t => t.id === taskId);

    return task ? {
      id: task.id,
      status: task.status,
      progress: task.progress || 0,
      result: task.result,
      error: task.error
    } : null;
  }

  getSystemStatus() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'processing').length,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.length,
      activeTasks: this.activeTasks.size
    };
  }
}

const AIOrchestrator = ({ user }) => {
  const navigate = useNavigate();
  const [orchestrator] = useState(() => new TaskOrchestrator());
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [newTask, setNewTask] = useState({
    type: 'summarize',
    content: '',
    description: '',
    requiredCapabilities: ['summarization']
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    initializeAgents();
    const statusInterval = setInterval(updateSystemStatus, 2000);
    return () => clearInterval(statusInterval);
  }, []);

  const initializeAgents = useCallback(() => {
    // Create specialized agents
    const summarizerAgent = new AutonomousAgent('summarizer-001', 'summarizer', ['summarization', 'content-analysis']);
    const analyzerAgent = new AutonomousAgent('analyzer-001', 'analyzer', ['sentiment-analysis', 'topic-extraction', 'insights']);
    const researcherAgent = new AutonomousAgent('researcher-001', 'researcher', ['web-research', 'data-collection', 'fact-checking']);
    const writerAgent = new AutonomousAgent('writer-001', 'writer', ['content-generation', 'editing', 'formatting']);

    orchestrator.registerAgent(summarizerAgent);
    orchestrator.registerAgent(analyzerAgent);
    orchestrator.registerAgent(researcherAgent);
    orchestrator.registerAgent(writerAgent);

    setAgents([summarizerAgent, analyzerAgent, researcherAgent, writerAgent]);
  }, [orchestrator]);

  const updateSystemStatus = useCallback(() => {
    setSystemStatus(orchestrator.getSystemStatus());
  }, [orchestrator]);

  const handleCreateTask = async () => {
    if (!newTask.content && !newTask.description) return;

    setIsCreatingTask(true);
    try {
      const taskId = await orchestrator.submitTask({
        ...newTask,
        userId: user?.id,
        createdBy: 'user'
      });

      setTasks(prev => [...prev, orchestrator.getTaskStatus(taskId)]);
      setNewTask({
        type: 'summarize',
        content: '',
        description: '',
        requiredCapabilities: ['summarization']
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'processing': return 'text-cyan-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'queued': return 'text-yellow-400';
      case 'processing': return 'text-cyan-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white">
                AI Autonomous Orchestration
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {systemStatus.activeAgents || 0} active • {systemStatus.queuedTasks || 0} queued
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents Panel */}
          <div className="lg:col-span-1">
            <div className="skeuo-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Autonomous Agents</h2>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{agent.type}</span>
                      <span className={`text-sm font-bold ${getAgentStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Tasks completed: {agent.memory.length}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.capabilities.slice(0, 3).map((cap, index) => (
                        <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Task */}
            <div className="skeuo-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Create Autonomous Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="summarize">Content Summarization</option>
                    <option value="analyze">Content Analysis</option>
                    <option value="research">Research Topic</option>
                    <option value="generate">Content Generation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content/Description</label>
                  <textarea
                    value={newTask.content || newTask.description}
                    onChange={(e) => setNewTask(prev => ({
                      ...prev,
                      content: e.target.value,
                      description: e.target.value
                    }))}
                    placeholder="Enter content to process or describe the task..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 h-32 resize-none"
                  />
                </div>

                <button
                  onClick={handleCreateTask}
                  disabled={isCreatingTask || (!newTask.content && !newTask.description)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTask ? 'Creating Task...' : '🚀 Execute Autonomous Task'}
                </button>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="skeuo-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Active Tasks</h2>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">🤖</div>
                    <p>No active tasks. Create one above!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{task.type} Task</span>
                        <span className={`text-sm font-bold ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {task.description || 'Processing content...'}
                      </div>
                      {task.result && (
                        <div className="mt-3 p-3 bg-slate-600/30 rounded text-sm">
                          <strong>Result:</strong> {JSON.stringify(task.result, null, 2)}
                        </div>
                      )}
                      {task.error && (
                        <div className="mt-3 p-3 bg-red-500/20 rounded text-sm text-red-400">
                          <strong>Error:</strong> {task.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOrchestrator;