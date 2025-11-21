// frontend/src/hooks/useLazyFetch.js
'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for lazy loading data - only fetches when explicitly called
 * Useful for filter dropdowns that don't need data until user interacts with them
 */
export const useLazyFetch = (fetchFn) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const hasLoadedRef = useRef(false);

    const fetch = useCallback(async () => {
        // If already loaded, return cached data
        if (hasLoadedRef.current) {
            return;
        }

        // Prevent duplicate concurrent requests
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;

        try {
            setLoading(true);
            setError(null);
            const response = await fetchFn();

            if (response && response.data) {
                setData(response.data);
                hasLoadedRef.current = true;
            } else {
                console.warn('Unexpected response structure:', response);
                setData(null);
            }
        } catch (err) {
            console.error('Lazy fetch error:', err);

            let errorMessage = 'An error occurred';

            if (err.response) {
                if (err.response.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                } else {
                    errorMessage = err.response.data?.error ||
                                  err.response.data?.message ||
                                  `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = err.message || 'Request failed';
            }

            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [fetchFn]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        hasLoadedRef.current = false;
        isFetchingRef.current = false;
    }, []);

    return { data, loading, error, fetch, reset };
};
