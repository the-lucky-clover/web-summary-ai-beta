import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { summaryRoutes } from './summary.js';

// Mock the database
const mockDB = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn()
    }))
  }))
};

const mockEnv = {
  DB: mockDB,
  JWT_SECRET: 'test-secret',
  GEMINI_API_KEY: 'test-key'
};

describe('Summary API Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/api/summary', summaryRoutes);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/summary/history', () => {
    it('returns user summaries successfully', async () => {
      const mockSummaries = [
        {
          id: '1',
          summary_text: 'Test summary',
          original_url: 'https://example.com',
          created_at: new Date().toISOString(),
          word_count: 100
        }
      ];

      mockDB.prepare().bind().all.mockResolvedValue({
        results: mockSummaries,
        success: true
      });

      const req = new Request('http://localhost/api/summary/history', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.summaries).toEqual(mockSummaries);
      expect(mockDB.prepare).toHaveBeenCalled();
    });

    it('handles pagination correctly', async () => {
      const req = new Request('http://localhost/api/summary/history?limit=10&offset=20', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      mockDB.prepare().bind().all.mockResolvedValue({
        results: [],
        success: true
      });

      await app.request(req, mockEnv);

      expect(mockDB.prepare().bind).toHaveBeenCalledWith(
        expect.any(String), // userId
        10, // limit
        20  // offset
      );
    });

    it('returns 401 for invalid token', async () => {
      const req = new Request('http://localhost/api/summary/history', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/summary', () => {
    it('creates summary successfully', async () => {
      const summaryData = {
        url: 'https://example.com',
        content: 'Test content to summarize',
        options: { format: 'bullet-points' }
      };

      mockDB.prepare().bind().run.mockResolvedValue({ success: true });

      const req = new Request('http://localhost/api/summary', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summaryData)
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toContain('Summary created');
      expect(mockDB.prepare).toHaveBeenCalled();
    });

    it('validates required fields', async () => {
      const req = new Request('http://localhost/api/summary', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Missing required fields
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Validation error');
    });

    it('handles AI service errors gracefully', async () => {
      const summaryData = {
        url: 'https://example.com',
        content: 'Test content',
        options: { format: 'bullet-points' }
      };

      // Mock AI service failure
      global.fetch = vi.fn().mockRejectedValue(new Error('AI service unavailable'));

      const req = new Request('http://localhost/api/summary', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summaryData)
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toContain('AI service');
    });
  });

  describe('DELETE /api/summary/:id', () => {
    it('moves summary to rubbish bin', async () => {
      const summaryId = '123';
      const mockSummary = {
        id: summaryId,
        summary_text: 'Test summary',
        original_url: 'https://example.com',
        user_id: 'user123'
      };

      mockDB.prepare().bind().first.mockResolvedValue(mockSummary);
      mockDB.prepare().bind().run.mockResolvedValue({ success: true });

      const req = new Request(`http://localhost/api/summary/${summaryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toContain('rubbish bin');
      expect(data.recoveryDeadline).toBeDefined();
    });

    it('returns 404 for non-existent summary', async () => {
      mockDB.prepare().bind().first.mockResolvedValue(null);

      const req = new Request('http://localhost/api/summary/999', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('POST /api/summary/:id/favorite', () => {
    it('adds summary to favorites', async () => {
      const summaryId = '123';
      const mockSummary = {
        id: summaryId,
        user_id: 'user123'
      };

      mockDB.prepare().bind().first.mockResolvedValue(mockSummary);
      mockDB.prepare().bind().run.mockResolvedValue({ success: true });

      const req = new Request(`http://localhost/api/summary/${summaryId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toContain('favorites');
    });

    it('prevents duplicate favorites', async () => {
      const summaryId = '123';

      // Mock existing favorite
      mockDB.prepare().bind().first
        .mockResolvedValueOnce({ id: summaryId }) // Summary exists
        .mockResolvedValueOnce({ id: 'fav123' }); // Already favorited

      const req = new Request(`http://localhost/api/summary/${summaryId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Already in favorites');
    });
  });

  describe('GET /api/summary/favorites/all', () => {
    it('returns user favorites with metadata', async () => {
      const mockFavorites = [
        {
          id: '1',
          summary_text: 'Favorite summary',
          favorited_at: new Date().toISOString()
        }
      ];

      mockDB.prepare().bind().all.mockResolvedValue({
        results: mockFavorites,
        success: true
      });

      const req = new Request('http://localhost/api/summary/favorites/all', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.favorites).toEqual(mockFavorites);
      expect(data.pagination).toBeDefined();
    });
  });

  describe('GET /api/summary/rubbish-bin/all', () => {
    it('returns recoverable deleted items', async () => {
      const mockDeleted = [
        {
          summary_data: JSON.stringify({
            id: '1',
            summary_text: 'Deleted summary'
          }),
          deleted_at: new Date().toISOString(),
          auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      mockDB.prepare().bind().all.mockResolvedValue({
        results: mockDeleted,
        success: true
      });

      const req = new Request('http://localhost/api/summary/rubbish-bin/all', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.deleted).toHaveLength(1);
      expect(data.deleted[0].recovery_deadline).toBeDefined();
    });
  });

  describe('POST /api/summary/rubbish-bin/:id/recover', () => {
    it('recovers deleted summary', async () => {
      const deletedId = '456';
      const mockDeleted = {
        summary_data: JSON.stringify({
          id: '123',
          summary_text: 'Recovered summary',
          original_url: 'https://example.com',
          user_id: 'user123'
        })
      };

      mockDB.prepare().bind().first.mockResolvedValue(mockDeleted);
      mockDB.prepare().bind().run.mockResolvedValue({ success: true });

      const req = new Request(`http://localhost/api/summary/rubbish-bin/${deletedId}/recover`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toContain('recovered');
    });
  });

  describe('DELETE /api/summary/history/all', () => {
    it('clears all user history', async () => {
      mockDB.prepare().bind().all.mockResolvedValue({
        results: [{ id: '1' }, { id: '2' }]
      });
      mockDB.prepare().bind().run.mockResolvedValue({ success: true });

      const req = new Request('http://localhost/api/summary/history/all', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toContain('rubbish bin');
      expect(data.deletedCount).toBe(2);
      expect(data.recoveryDeadline).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      mockDB.prepare().bind().all.mockRejectedValue(new Error('Database error'));

      const req = new Request('http://localhost/api/summary/history', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(500);
    });

    it('validates request data', async () => {
      const req = new Request('http://localhost/api/summary', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'invalid-url',
          content: '' // Invalid content
        })
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(400);
    });
  });
});