/**
 * this file tests the time handling functions to prevent crashes in production
 *
 * what it does:
 * - tests if time values are properly converted to readable format (like "14:30")
 * - makes sure the system doesn't crash when receiving unexpected time formats
 * - handles cases where database might return time as a date object, string, or array
 * - tests defensive programming to catch errors before they happen
 *
 * how it works:
 * - includes two helper functions: normalizeTime and defensiveHrtime
 * - normalizeTime converts any time format to a standard "HH:MM" string
 * - defensiveHrtime safely handles performance timing without crashing
 * - runs various test scenarios including edge cases that could happen in production
 * - simulates what happens when mongodb returns unexpected data types
 * - ensures the application continues working even with bad data
 */

// Test the normalizeTime logic (extracted from lesson controller)
function normalizeTime(time) {
    if (!time) return null;
    
    if (typeof time === 'string') {
        return time;
    } else if (time instanceof Date) {
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } else if (Array.isArray(time) && time.length >= 1) {
        return String(time[0]);
    } else {
        return String(time);
    }
}

// Test hrtime defensive handling
function defensiveHrtime(startTime) {
    if (!startTime) return '0';
    
    if (!Array.isArray(startTime) || startTime.length !== 2) {
        return '0';
    }
    
    try {
        const diff = process.hrtime(startTime);
        const ms = diff[0] * 1e3 + diff[1] * 1e-6;
        return ms.toFixed(2);
    } catch (error) {
        return '0';
    }
}

describe('Time Normalization', () => {
    describe('normalizeTime', () => {
        test('should handle string input correctly', () => {
            expect(normalizeTime('10:30')).toBe('10:30');
            expect(normalizeTime('00:00')).toBe('00:00');
            expect(normalizeTime('23:59')).toBe('23:59');
        });

        test('should convert Date object to HH:MM format', () => {
            const date1 = new Date('2024-01-01T14:30:00');
            expect(normalizeTime(date1)).toBe('14:30');
            
            const date2 = new Date('2024-01-01T09:05:00');
            expect(normalizeTime(date2)).toBe('09:05');
            
            const date3 = new Date('2024-01-01T00:00:00');
            expect(normalizeTime(date3)).toBe('00:00');
        });

        test('should handle array input by taking first element', () => {
            expect(normalizeTime(['10:00', '12:00'])).toBe('10:00');
            expect(normalizeTime(['14:30'])).toBe('14:30');
        });

        test('should handle null/undefined gracefully', () => {
            expect(normalizeTime(null)).toBe(null);
            expect(normalizeTime(undefined)).toBe(null);
        });

        test('should convert other types to string as fallback', () => {
            expect(normalizeTime(123)).toBe('123');
            expect(normalizeTime({ toString: () => '10:30' })).toBe('10:30');
        });

        test('should handle edge case: process.hrtime array', () => {
            // Simulating the bug scenario where hrtime array might be passed
            const hrtimeArray = [1234, 567890123];
            const result = normalizeTime(hrtimeArray);
            expect(result).toBe('1234'); // Should not crash
        });
    });

    describe('defensiveHrtime', () => {
        test('should handle valid hrtime array', () => {
            const startTime = process.hrtime();
            const result = defensiveHrtime(startTime);
            expect(result).not.toBe('0');
            expect(parseFloat(result)).toBeGreaterThanOrEqual(0);
        });

        test('should return "0" for null/undefined', () => {
            expect(defensiveHrtime(null)).toBe('0');
            expect(defensiveHrtime(undefined)).toBe('0');
        });

        test('should return "0" for Date object (the bug case)', () => {
            const dateObj = new Date();
            expect(defensiveHrtime(dateObj)).toBe('0');
        });

        test('should return "0" for invalid array', () => {
            expect(defensiveHrtime([1])).toBe('0'); // Wrong length
            expect(defensiveHrtime([1, 2, 3])).toBe('0'); // Too many elements
            expect(defensiveHrtime([])).toBe('0'); // Empty
        });

        test('should return "0" for non-array types', () => {
            expect(defensiveHrtime('string')).toBe('0');
            expect(defensiveHrtime(123)).toBe('0');
            expect(defensiveHrtime({ a: 1 })).toBe('0');
        });
    });
});

describe('Production Scenario Simulation', () => {
    test('should not crash when MongoDB returns Date for time field', () => {
        // Simulate MongoDB returning a Date object instead of string
        const lessonFromDB = {
            time: new Date('2024-01-01T14:30:00'), // This could happen in production
            date: new Date('2024-01-01'),
            studentId: 'student123',
            instructorId: 'instructor456',
            vehicleId: 'vehicle789'
        };

        // Normalize the time field
        const normalizedTime = normalizeTime(lessonFromDB.time);
        
        expect(normalizedTime).toBe('14:30');
        expect(typeof normalizedTime).toBe('string');
    });

    test('should not crash when time is an array', () => {
        // Simulate time coming as array (possible edge case)
        const lessonFromDB = {
            time: ['10:00', '12:00'], // Array format
            date: new Date('2024-01-01'),
            studentId: 'student123',
            instructorId: 'instructor456',
            vehicleId: 'vehicle789'
        };

        const normalizedTime = normalizeTime(lessonFromDB.time);
        
        expect(normalizedTime).toBe('10:00');
        expect(typeof normalizedTime).toBe('string');
    });

    test('should handle request with corrupted _startTime', () => {
        // Simulate request object with corrupted _startTime (the actual bug)
        const req = {
            _startTime: new Date() // Should be hrtime array, but it's a Date
        };

        // The defensive function should handle this gracefully
        const responseTime = defensiveHrtime(req._startTime);
        
        expect(responseTime).toBe('0');
        // Most importantly: no exception thrown
    });

    test('should handle request with valid _startTime', () => {
        const req = {
            _startTime: process.hrtime()
        };

        // Wait a tiny bit
        const start = Date.now();
        while (Date.now() - start < 5) {
            // Busy wait for 5ms
        }

        const responseTime = defensiveHrtime(req._startTime);
        
        expect(responseTime).not.toBe('0');
        expect(parseFloat(responseTime)).toBeGreaterThan(0);
    });
});
