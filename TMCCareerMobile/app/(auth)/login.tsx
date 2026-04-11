import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { login, bypassLogin } = useAuth();
    const [studentNumber, setStudentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!studentNumber || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(studentNumber, password);
            // RootNavigator handles redirection based on isOnboarded state
        } catch (err: any) {
            Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleBypass = async () => {
        setLoading(true);
        try {
            await bypassLogin();
            // RootNavigator handles redirection
        } catch (err: any) {
            Alert.alert('Bypass Failed', 'Could not skip authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.brandRow}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoSymbol}>✦</Text>
                            </View>
                            <Text style={styles.brandName}>TMC Career Pathway</Text>
                        </View>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to your account to continue</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Student Number</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2025-12345"
                                    placeholderTextColor="#4b5563"
                                    value={studentNumber}
                                    onChangeText={setStudentNumber}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
                                    <Text style={styles.forgotLink}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#4b5563"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.toggleBtn}
                                >
                                    <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign in</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        <TouchableOpacity
                            style={styles.bypassButton}
                            onPress={handleBypass}
                            disabled={loading}
                        >
                            <Text style={styles.bypassButtonText}>Bypass Auth (Dev Mode)</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={styles.link}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712', // Matches bg-gray-950
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: '#111827', // Matches bg-gray-900
        borderRadius: 16,
        padding: 32,
        borderWidth: 1,
        borderColor: '#1f2937', // Matches border-gray-800
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        marginBottom: 28,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 28,
    },
    logoBox: {
        width: 36,
        height: 36,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoSymbol: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    brandName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: '#d1d5db', // Matches text-gray-300
        fontSize: 14,
        fontWeight: '500',
    },
    forgotLink: {
        color: '#818cf8', // Matches text-indigo-400
        fontSize: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937', // Matches bg-gray-800
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151', // Matches border-gray-700
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingVertical: 10,
        fontSize: 14,
    },
    toggleBtn: {
        paddingVertical: 10,
    },
    toggleText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        gap: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#1f2937',
    },
    dividerText: {
        color: '#4b5563',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bypassButton: {
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#4f46e5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bypassButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 4,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    link: {
        color: '#818cf8',
        fontWeight: '600',
        fontSize: 14,
    },
});
