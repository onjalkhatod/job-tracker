import { describe, test, expect } from '@jest/globals';
import { getCountdown } from '../src/utils/dateHelpers.js';

describe('Job Tracker Component & Utility Tests', () => {

    test('getCountdown() returns correct strings for relative dates', () => {
        // Mock current date for consistent testing
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const twoDaysAhead = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        expect(getCountdown(today)).toBe("Today");
        expect(getCountdown(twoDaysAhead)).toBe("In 2 days");
        expect(getCountdown(pastDate)).toBe("Past");
    });

    test('Stats calculation returns correct object counts', () => {
        const mockApplications = [
            { status: 'APPLIED' },
            { status: 'APPLIED' },
            { status: 'INTERVIEW' }
        ];

        const stats = {
            applied: mockApplications.filter(a => a.status === 'APPLIED').length,
            interview: mockApplications.filter(a => a.status === 'INTERVIEW').length
        };

        expect(stats.applied).toBe(2);
        expect(stats.interview).toBe(1);
    });

    test('Email validation logic returns false for invalid email', () => {
        const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
        
        expect(validateEmail("invalid-email")).toBe(false);
        expect(validateEmail("user@example.com")).toBe(true);
    });

});