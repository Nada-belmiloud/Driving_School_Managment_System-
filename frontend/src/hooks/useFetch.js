// frontend/src/hooks/useFetch.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetch = (fetchFn, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async () => {
        // Prevent duplicate concurrent requests
        if (isFetchingRef.current) {
            console.log('Request already in progress, skipping...');
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        isFetchingRef.current = true;

        try {
            setLoading(true);
            setError(null);
            console.log('Fetching data...'); // Debug log
            const response = await fetchFn();
            console.log('Response received:', response); // Debug log

            // Ensure response has the expected structure
            if (response && response.data) {
                setData(response.data);
            } else {
                console.warn('Unexpected response structure:', response);
                setData(null);
            }
        } catch (err) {
            // Don't set error if request was aborted
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                console.log('Request was aborted');
                return;
            }

            console.error('Fetch error:', err); // Debug log

            // Better error message extraction
            let errorMessage = 'An error occurred';

            if (err.response) {
                // Server responded with error
                if (err.response.status === 429) {
                    errorMessage = 'Too many requests. The system is retrying automatically. Please wait...';
                } else {
                    errorMessage = err.response.data?.error ||
                                  err.response.data?.message ||
                                  `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                // Request made but no response
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Error setting up request
                errorMessage = err.message || 'Request failed';
            }

            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [fetchFn]);

    useEffect(() => {
        refetch();

        // Cleanup function to abort request on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, dependencies);

    return { data, loading, error, refetch };
};