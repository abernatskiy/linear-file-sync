import { Issue, formatIssue, parseIssuesFromFile, formatIssuesToString } from '../issueFormat';

describe('Issue Formatting and Parsing', () => {
  const sampleIssue: Issue = {
    id: '123',
    title: 'Test Issue',
    description: 'This is a test issue',
    state: { id: '1', name: 'Todo' },
    assignee: { id: '2', name: 'John Doe' },
    project: { id: '3', name: 'Test Project' },
    comments: [
      { id: '4', body: 'First comment' },
      { id: '5', body: 'Second comment' }
    ]
  };

  const expectedFormattedIssue = `===== Test Issue =====
ID: 123
State: Todo
Assignee: John Doe
Project: Test Project

This is a test issue

First comment
---------
Second comment`;

  describe('formatIssue', () => {
    it('should format an issue correctly', () => {
      const formatted = formatIssue(sampleIssue);
      expect(formatted).toBe(expectedFormattedIssue);
    });

    it('should handle issues without optional fields', () => {
      const minimalIssue: Issue = {
        id: '123',
        title: 'Test Issue',
        description: 'This is a test issue',
        state: { id: '1', name: 'Todo' },
        comments: []
      };

      const expected = `===== Test Issue =====
ID: 123
State: Todo

This is a test issue

`;

      expect(formatIssue(minimalIssue)).toBe(expected);
    });
  });

  describe('parseIssuesFromFile', () => {
    it('should parse a single issue correctly', () => {
      const parsed = parseIssuesFromFile(expectedFormattedIssue);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual({
        id: '123',
        title: 'Test Issue',
        description: 'This is a test issue',
        state: { id: '', name: 'Todo' },
        assignee: { id: '', name: 'John Doe' },
        project: { id: '', name: 'Test Project' },
        comments: [
          { id: '', body: 'First comment' },
          { id: '', body: 'Second comment' }
        ]
      });
    });

    it('should parse multiple issues correctly', () => {
      const multipleIssues = `${expectedFormattedIssue}\n\n${expectedFormattedIssue}`;
      const parsed = parseIssuesFromFile(multipleIssues);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual(parsed[1]);
    });

    it('should handle empty content', () => {
      expect(parseIssuesFromFile('')).toEqual([]);
    });
  });

  describe('formatIssuesToString', () => {
    it('should format multiple issues correctly', () => {
      const issues = [sampleIssue, sampleIssue];
      const formatted = formatIssuesToString(issues);
      expect(formatted).toBe(`${expectedFormattedIssue}\n\n${expectedFormattedIssue}`);
    });

    it('should handle empty array', () => {
      expect(formatIssuesToString([])).toBe('');
    });
  });
}); 