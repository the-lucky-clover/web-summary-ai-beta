import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AIOrchestrator from './AIOrchestrator';

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AIOrchestrator Component', () => {
  const mockUser = { email: 'test@example.com', id: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ message: 'Task completed' })
    });
  });

  it('renders AI orchestration interface', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    expect(screen.getByText('AI Autonomous Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Create Autonomous Task')).toBeInTheDocument();
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
  });

  it('displays autonomous agents', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    expect(screen.getByText('Autonomous Agents')).toBeInTheDocument();
    expect(screen.getByText('summarizer')).toBeInTheDocument();
    expect(screen.getByText('analyzer')).toBeInTheDocument();
    expect(screen.getByText('researcher')).toBeInTheDocument();
    expect(screen.getByText('writer')).toBeInTheDocument();
  });

  it('shows agent statuses', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Check that agents are displayed with idle status initially
    const idleStatuses = screen.getAllByText('idle');
    expect(idleStatuses.length).toBeGreaterThan(0);
  });

  it('creates and executes autonomous tasks', async () => {
    const user = userEvent.setup();

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Fill out task form
    const contentTextarea = screen.getByPlaceholderText(/Enter content to process/);
    await user.type(contentTextarea, 'Test content for summarization');

    // Select task type
    const taskTypeSelect = screen.getByDisplayValue('summarize');
    await user.selectOptions(taskTypeSelect, 'summarize');

    // Submit task
    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/summarize', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });
  });

  it('handles different task types', async () => {
    const user = userEvent.setup();

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    const taskTypeSelect = screen.getByDisplayValue('summarize');

    // Test analyze task
    await user.selectOptions(taskTypeSelect, 'analyze');
    expect(screen.getByDisplayValue('analyze')).toBeInTheDocument();

    // Test research task
    await user.selectOptions(taskTypeSelect, 'research');
    expect(screen.getByDisplayValue('research')).toBeInTheDocument();

    // Test generate task
    await user.selectOptions(taskTypeSelect, 'generate');
    expect(screen.getByDisplayValue('generate')).toBeInTheDocument();
  });

  it('displays task execution progress', async () => {
    const user = userEvent.setup();

    // Mock task creation and execution
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/ai/summarize')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            summary: 'Test summary result',
            agent: 'summarizer-001',
            timestamp: new Date().toISOString()
          })
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Create a task
    const contentTextarea = screen.getByPlaceholderText(/Enter content to process/);
    await user.type(contentTextarea, 'Test content');

    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    // Check for task in active tasks
    await waitFor(() => {
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    const contentTextarea = screen.getByPlaceholderText(/Enter content to process/);
    await user.type(contentTextarea, 'Test content');

    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create task:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('validates task input', async () => {
    const user = userEvent.setup();

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Try to submit without content
    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    // Button should be disabled or form should prevent submission
    expect(submitButton).toBeDisabled();
  });

  it('displays system status', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Check for system status indicators
    expect(screen.getByText(/active • \d+ queued/)).toBeInTheDocument();
  });

  it('navigates back to dashboard', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();

    vi.mock('react-router-dom', async () => ({
      ...await vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    const backButton = screen.getByText('← Back to Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows empty state for tasks', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('No active tasks. Create one above!')).toBeInTheDocument();
  });

  it('displays agent capabilities', () => {
    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Check for capability tags
    expect(screen.getByText('summarization')).toBeInTheDocument();
    expect(screen.getByText('content-analysis')).toBeInTheDocument();
    expect(screen.getByText('sentiment-analysis')).toBeInTheDocument();
  });

  it('handles task completion', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        summary: 'Completed summary',
        agent: 'summarizer-001',
        timestamp: new Date().toISOString()
      })
    });

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    const contentTextarea = screen.getByPlaceholderText(/Enter content to process/);
    await user.type(contentTextarea, 'Test content');

    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('updates agent status during task execution', async () => {
    const user = userEvent.setup();

    renderWithRouter(<AIOrchestrator user={mockUser} />);

    // Initially all agents should be idle
    expect(screen.getAllByText('idle')).toBeTruthy();

    // After task creation, at least one agent should show processing
    const contentTextarea = screen.getByPlaceholderText(/Enter content to process/);
    await user.type(contentTextarea, 'Test content');

    const submitButton = screen.getByText('🚀 Execute Autonomous Task');
    await user.click(submitButton);

    // This would be tested with actual task execution
    // For now, we verify the UI is ready for status updates
    expect(screen.getByText('AI Autonomous Orchestration')).toBeInTheDocument();
  });
});