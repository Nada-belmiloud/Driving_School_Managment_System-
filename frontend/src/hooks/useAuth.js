'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, clearAuth, redirectByRole } from '@/lib/auth';
import { authAPI } from '@/lib/api';

export const useAuth = (requireAuth = false, allowedRoles = []) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const isCheckingAuth = useRef(false);
    const allowedRolesStr = JSON.stringify(allowedRoles);

    useEffect(() => {
        const checkAuth = async () => {
            // Prevent multiple concurrent auth checks
            if (isCheckingAuth.current) return;
            isCheckingAuth.current = true;

            const auth = getAuth();

            if (!auth) {
                if (requireAuth) {
                    router.push('/login');
                }
                setLoading(false);
                isCheckingAuth.current = false;
                return;
            }

            try {
                const response = await authAPI.getMe();
                const userData = response.data.data;
                setUser(userData);

                const allowedRolesArray = JSON.parse(allowedRolesStr);
                if (allowedRolesArray.length > 0 && !allowedRolesArray.includes(userData.role)) {
                    router.push(redirectByRole(userData.role));
                    return;
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                
                // Don't clear auth on rate limit errors, just log and continue
                if (error.response?.status === 429) {
                    console.warn('Rate limit hit during auth check. Will retry automatically.');
                    // Keep the existing auth for now, the retry mechanism will handle it
                } else {
                    // Only clear auth for actual auth failures
                    clearAuth();
                    if (requireAuth) {
                        router.push('/login');
                    }
                }
            } finally {
                setLoading(false);
                isCheckingAuth.current = false;
            }
        };

        checkAuth();
    }, [requireAuth, router, allowedRolesStr]);

    return { user, loading };
};