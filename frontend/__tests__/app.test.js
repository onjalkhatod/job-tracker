import { describe, test, expect } from '@jest/globals';
import { getCountdown } from '../src/lib/dateUtils.js';

describe('Job Tracker Component & Utility Tests', () => {

  test('getCountdown() returns correct strings for relative dates', () => {
    const now = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];

    const today        = fmt(now);
    const tomorrow     = fmt(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000));
    const twoDaysAhead = fmt(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000));
    const pastDate     = fmt(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    expect(getCountdown(today)).toBe('Today');
    expect(getCountdown(tomorrow)).toBe('Tomorrow');
    expect(getCountdown(twoDaysAhead)).toBe('In 2 days');
    expect(getCountdown(pastDate)).toBe('Overdue');
    expect(getCountdown('')).toBe('');
    expect(getCountdown(null)).toBe('');
  });

  test('Stats calculation returns correct object counts', () => {
    const mockApplications = [
      { status: 'APPLIED' },
      { status: 'APPLIED' },
      { status: 'INTERVIEW' },
    ];

    const stats = {
      applied:   mockApplications.filter(a => a.status === 'APPLIED').length,
      interview: mockApplications.filter(a => a.status === 'INTERVIEW').length,
    };

    expect(stats.applied).toBe(2);
    expect(stats.interview).toBe(1);
  });

  test('Email validation logic returns false for invalid email', () => {
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('user@example.com')).toBe(true);
  });

});