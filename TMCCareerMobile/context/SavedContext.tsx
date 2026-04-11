import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '@/constants/api';
import axios from 'axios';

type SavedContextType = {
    savedJobIds: number[];
    savedInternshipIds: number[];
    savedResourceIds: number[];
    toggleJob: (id: number) => Promise<void>;
    toggleInternship: (id: number) => Promise<void>;
    toggleResource: (id: number) => Promise<void>;
    refreshSaved: () => Promise<void>;
};

const SavedContext = createContext<SavedContextType>({} as SavedContextType);

export function SavedProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState<number[]>([]);
    const [savedResourceIds, setSavedResourceIds] = useState<number[]>([]);

    const refreshSaved = useCallback(async () => {
        if (!token) {
            setSavedJobIds([]);
            setSavedInternshipIds([]);
            setSavedResourceIds([]);
            return;
        }

        const fetchSaved = async (path: string, setter: (ids: number[]) => void, type: string) => {
            try {
                const res = await axios.get(`${API_URL}${path}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setter(res.data.map((r: any) => {
                    // Handle different ID keys depending on resource
                    if (type === 'job') return Number(r.job_id);
                    if (type === 'internship') return Number(r.internship_id);
                    if (type === 'resource') return Number(r.resource_id);
                    return Number(r.id);
                }));
            } catch (error: any) {
                // Silently handle 403 (e.g. for internships if not 4th year)
                if (error.response?.status !== 403) {
                    console.error(`SavedContext: Failed to refresh ${type}s`, error.message);
                } else {
                    setter([]); // Clear if forbidden (e.g. year level restriction)
                }
            }
        };

        await Promise.all([
            fetchSaved('/jobs/me/saved', setSavedJobIds, 'job'),
            fetchSaved('/internships/me/saved', setSavedInternshipIds, 'internship'),
            fetchSaved('/resources/me/saved', setSavedResourceIds, 'resource')
        ]);
    }, [token]);

    useEffect(() => {
        refreshSaved();
    }, [refreshSaved]);

    const toggleJob = async (id: number) => {
        if (!token) return;
        try {
            const res = await axios.post(`${API_URL}/jobs/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.saved) {
                setSavedJobIds(prev => Array.from(new Set([...prev, id])));
            } else {
                setSavedJobIds(prev => prev.filter(x => x !== id));
            }
        } catch (error) {
            console.error("Failed to toggle job save", error);
        }
    };

    const toggleInternship = async (id: number) => {
        if (!token) return;
        try {
            const res = await axios.post(`${API_URL}/internships/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.saved) {
                setSavedInternshipIds(prev => Array.from(new Set([...prev, id])));
            } else {
                setSavedInternshipIds(prev => prev.filter(x => x !== id));
            }
        } catch (error) {
            console.error("Failed to toggle internship save", error);
        }
    };

    const toggleResource = async (id: number) => {
        if (!token) return;
        try {
            const res = await axios.post(`${API_URL}/resources/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.saved) {
                setSavedResourceIds(prev => Array.from(new Set([...prev, id])));
            } else {
                setSavedResourceIds(prev => prev.filter(x => x !== id));
            }
        } catch (error) {
            console.error("Failed to toggle resource save", error);
        }
    };

    return (
        <SavedContext.Provider value={{
            savedJobIds,
            savedInternshipIds,
            savedResourceIds,
            toggleJob,
            toggleInternship,
            toggleResource,
            refreshSaved
        }}>
            {children}
        </SavedContext.Provider>
    );
}

export const useSaved = () => useContext(SavedContext);
