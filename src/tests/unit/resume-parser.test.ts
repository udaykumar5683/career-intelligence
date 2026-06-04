import { describe, it, expect } from 'vitest';
import { parseProfileResponse, cleanJsonResponse } from '@/lib/agents/resume-parser';

describe('Resume Parser Utility Functions', () => {
  describe('cleanJsonResponse', () => {
    it('should remove markdown code fences', () => {
      const input = '```json\n{"name": "John Doe"}\n```';
      const expected = '{"name": "John Doe"}';
      expect(cleanJsonResponse(input)).toBe(expected);
    });

    it('should trim whitespace', () => {
      const input = '  {"name": "John Doe"}  ';
      const expected = '{"name": "John Doe"}';
      expect(cleanJsonResponse(input)).toBe(expected);
    });

    it('should handle raw JSON without fences', () => {
      const input = '{"name": "John Doe"}';
      const expected = '{"name": "John Doe"}';
      expect(cleanJsonResponse(input)).toBe(expected);
    });
  });

  describe('parseProfileResponse', () => {
    it('should parse a valid JSON response into a ResumeProfile', () => {
      const response = JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['React', 'Node.js'],
        experience: [{ title: 'Dev', company: 'Tech', duration: '1y', description: 'coding' }]
      });
      
      const result = parseProfileResponse(response);
      
      expect(result.name).toBe('John Doe');
      expect(result.skills).toContain('React');
      expect(result.experience[0].company).toBe('Tech');
    });

    it('should handle missing fields with defaults', () => {
      const response = JSON.stringify({
        name: 'Jane Doe'
      });
      
      const result = parseProfileResponse(response);
      
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('');
      expect(Array.isArray(result.skills)).toBe(true);
      expect(result.skills.length).toBe(0);
    });

    it('should return a default empty profile on invalid JSON', () => {
      const response = 'invalid json';
      const result = parseProfileResponse(response);
      
      expect(result.name).toBe('');
      expect(result.summary).toContain('could not be fully parsed');
    });
  });
});
