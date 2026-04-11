import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
    const { register } = useAuth();
    const [form, setForm] = useState({ student_number: '', name: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!form.student_number || !form.name || !form.password || !form.confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await register({
                student_number: form.student_number,
                name: form.name,
                password: form.password
            });
            // RootNavigator will handle the redirection based on isOnboarded state
            // But we can explicitly go to onboarding to be sure
            router.replace('/onboarding');
        } catch (err: any) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={styles.brandRow}>
                                <View style={styles.logoBox}>
                                    <Text style={styles.logoSymbol}>✦</Text>
                                </View>
                                <Text style={styles.brandName}>TMC Career Pathway</Text>
                            </View>
                            <Text style={styles.title}>Create your account</Text>
                            <Text style={styles.subtitle}>Join TMC Career Pathway to explore your future</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Student Number</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="202512345"
                                        placeholderTextColor="#4b5563"
                                        onChangeText={v => update('student_number', v)}
                                        autoCapitalize="none"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Name"
                                        placeholderTextColor="#4b5563"
                                        onChangeText={v => update('name', v)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="At least 8 characters"
                                        placeholderTextColor="#4b5563"
                                        onChangeText={v => update('password', v)}
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor="#4b5563"
                                        onChangeText={v => update('confirmPassword', v)}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.toggleBtn}
                                    >
                                        <Text style={styles.toggleText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Create account</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account?</Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                    <Text style={styles.link}>Sign in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
    },
    scrollContent: {
        padding: 16,
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'center',
        flexGrow: 1,
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
    label: {
        color: '#d1d5db', // Matches text-gray-300
        fontSize: 14,
        fontWeight: '500',
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
