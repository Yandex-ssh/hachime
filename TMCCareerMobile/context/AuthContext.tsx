import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { MOCK_STUDENT } from '@/constants/mocks';

const isWeb = Platform.OS === 'web';

const storage = {
    getItem: async (key: string) => {
        if (isWeb) return await AsyncStorage.getItem(key);
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        if (isWeb) return await AsyncStorage.setItem(key, value);
        return await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string) => {
        if (isWeb) return await AsyncStorage.removeItem(key);
        return await SecureStore.deleteItemAsync(key);
    }
};

// Set this to true to bypass the backend and use mock data
const USE_MOCKS = false;

type Student = {
    student_id: number;
    name: string;
    student_number: string;
    program?: string;
    program_id?: number;
    year_level: number;
    email?: string | null;
    profile_picture_url?: string | null;
    progress?: {
        finishedSubjects: number;
        totalSubjects: number;
        percent: number;
    };
    career_goal?: {
        career_id: number;
        title: string;
        icon: string | null;
        progress: { completed: number; total: number; percent: number };
        gap: {
            missing_subjects: { subject_id: number; subject_name: string }[];
        };
    };
};

type AuthContextType = {
    token: string | null;
    student: Student | null;
    isLoading: boolean;
    login: (student_number: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    bypassLogin: () => Promise<void>;
    logout: () => Promise<void>;
    isOnboarded: boolean;
    completeOnboarding: () => Promise<void>;
    updateStudent: (updatedFields: Partial<Student>) => Promise<void>;
    refreshStudent: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(false);

    useEffect(() => {
        (async () => {
            const stored = await storage.getItem('jwt_token');
            const storedStudent = await AsyncStorage.getItem('student_data');
            const storedOnboarded = await AsyncStorage.getItem('is_onboarded');

            if (USE_MOCKS && !stored) {
                setToken('mock-jwt-token');
                setStudent(MOCK_STUDENT);
                setIsOnboarded(false); // Force onboarding for testing
                setIsLoading(false);
                return;
            }

            if (stored) {
                setToken(stored);
                // After loading from storage, immediately try to refresh from API
                // but don't block the initial render
                setTimeout(() => {
                    refreshFromAPI(stored);
                }, 0);
            }
            if (storedStudent) setStudent(JSON.parse(storedStudent));
            if (storedOnboarded === 'true') setIsOnboarded(true);
            setIsLoading(false);
        })();
    }, []);
 
    const refreshFromAPI = useCallback(async (authToken: string) => {
        if (USE_MOCKS) return;
        try {
            const res = await axios.get(`${API_URL}/students/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const studentData = res.data;
            const normalizedStudent: Student = {
                ...studentData,
                progress: {
                    ...studentData.progress,
                    percent: studentData.progress?.totalSubjects > 0
                        ? Math.round((studentData.progress.finishedSubjects / studentData.progress.totalSubjects) * 100)
                        : 0
                }
            };
            
            // Only update if the data has actually changed to avoid unnecessary re-renders
            // A simple way is to check the student_id or a timestamp if available, 
            // but for now, we'll just set it. 
            // Note: setStudent will trigger a re-render of the context provider.
            setStudent(normalizedStudent);
            await AsyncStorage.setItem('student_data', JSON.stringify(normalizedStudent));
        } catch (error) {
            console.error("AuthContext: Failed to refresh student from API", error);
        }
    }, []);

    const refreshStudent = useCallback(async () => {
        if (!token) return;
        await refreshFromAPI(token);
    }, [token, refreshFromAPI]);

    const login = async (student_number: string, password: string) => {
        if (USE_MOCKS) {
            setToken('mock-jwt-token');
            setStudent(MOCK_STUDENT);
            await storage.removeItem('is_onboarded'); // Clear for testing
            setIsOnboarded(false); // Force onboarding for testing
            return;
        }

        try {
            console.log(`Attempting login at: ${API_URL}/auth/login`);
            const res = await axios.post(`${API_URL}/auth/login`,
                { student_number, password },
                { timeout: 10000 } // 10 second timeout
            );

            const { access_token, student: studentData } = res.data;

            // Ensure studentData matches our Student type if response is slightly different
            const normalizedStudent: Student = {
                ...studentData,
                progress: {
                    ...studentData.progress,
                    percent: studentData.progress?.totalSubjects > 0
                        ? Math.round((studentData.progress.finishedSubjects / studentData.progress.totalSubjects) * 100)
                        : 0
                }
            };

            await storage.setItem('jwt_token', access_token);
            await AsyncStorage.setItem('student_data', JSON.stringify(normalizedStudent));

            // For testing, we sometimes want to force onboarding, but 
            // in a real app we'd check if they have a program/year assigned.
            const needsOnboarding = !normalizedStudent.program_id;
            if (needsOnboarding) {
                await AsyncStorage.removeItem('is_onboarded');
                setIsOnboarded(false);
            } else {
                await AsyncStorage.setItem('is_onboarded', 'true');
                setIsOnboarded(true);
            }

            setToken(access_token);
            setStudent(normalizedStudent);
        } catch (error: any) {
            console.error("Login Error:", error.message);
            if (error.code === 'ECONNABORTED') {
                throw new Error(`Connection timed out at ${API_URL}. Is your server running and reachable?`);
            }
            if (!error.response) {
                throw new Error(`Network Error: Could not reach ${API_URL}. Please check your connection.`);
            }
            throw error;
        }
    };

    const register = async (data: any) => {
        if (USE_MOCKS) {
            setToken('mock-jwt-token');
            setStudent(MOCK_STUDENT);
            return;
        }
        try {
            console.log(`Attempting registration at: ${API_URL}/auth/register`);
            await axios.post(`${API_URL}/auth/register`, data, { timeout: 10000 });
            await login(data.student_number, data.password);
        } catch (error: any) {
            console.error("Registration error:", error.message);
            if (error.code === 'ECONNABORTED') {
                throw new Error(`Connection timed out at ${API_URL}. Is your server running and reachable?`);
            }
            if (!error.response) {
                throw new Error(`Network Error: Could not reach ${API_URL}. Please check your connection.`);
            }
            throw error;
        }
    };

    const bypassLogin = async () => {
        // Force set mock data regardless of USE_MOCKS for dev purposes
        const mockToken = 'mock-jwt-token-bypass';
        await storage.setItem('jwt_token', mockToken);
        await AsyncStorage.setItem('student_data', JSON.stringify(MOCK_STUDENT));
        await AsyncStorage.removeItem('is_onboarded'); // Clear for testing
        // Removed: await AsyncStorage.setItem('is_onboarded', 'true');
        setToken(mockToken);
        setStudent(MOCK_STUDENT);
        setIsOnboarded(false); // Force onboarding for testing
    };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem('is_onboarded', 'true');
        setIsOnboarded(true);
    };

    const logout = async () => {
        await storage.removeItem('jwt_token');
        await AsyncStorage.removeItem('student_data');
        await AsyncStorage.removeItem('is_onboarded');
        setToken(null);
        setStudent(null);
        setIsOnboarded(false);
    };

    const updateStudent = async (updatedFields: Partial<Student>) => {
        if (!student) return;
        const newStudent = { ...student, ...updatedFields };
        setStudent(newStudent);
        await AsyncStorage.setItem('student_data', JSON.stringify(newStudent));
    };

    const forgotPassword = async (email: string) => {
        if (USE_MOCKS) return;
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email });
        } catch (error: any) {
            console.error("Forgot Password Error:", error.message);
            throw error;
        }
    };

    const resetPassword = async (token: string, new_password: string) => {
        if (USE_MOCKS) return;
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { token, new_password });
        } catch (error: any) {
            console.error("Reset Password Error:", error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            token, student, isLoading, login, register, bypassLogin, logout,
            isOnboarded, completeOnboarding, updateStudent, refreshStudent,
            forgotPassword, resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
