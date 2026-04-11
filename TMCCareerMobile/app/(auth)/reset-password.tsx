import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';

export default function ResetPasswordScreen() {
    const { resetPassword } = useAuth();
    const { token: urlToken } = useLocalSearchParams<{ token: string }>();
    const [step, setStep] = useState(urlToken ? 2 : 1);
    const [otpCode, setOtpCode] = useState(urlToken || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNextStep = () => {
        if (!otpCode || otpCode.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }
        setStep(2);
    };

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(otpCode, password);
            Alert.alert(
                'Success', 
                'Your password has been reset successfully.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }]
            );
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
            if (err.response?.status === 401) {
                setStep(1); // Go back to OTP if it's invalid
            }
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
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        {step === 1 
                            ? 'Enter the 6-digit code sent to your email.' 
                            : 'Create a new secure password for your account.'}
                    </Text>

                    <View style={styles.form}>
                        {step === 1 ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>6-Digit Code</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123456"
                                            placeholderTextColor="#4b5563"
                                            value={otpCode}
                                            onChangeText={setOtpCode}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleNextStep}
                                >
                                    <Text style={styles.buttonText}>Verify Code</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="#4b5563"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor="#4b5563"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleReset}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Update Password</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
                                    <Text style={styles.backButtonText}>Use different code</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: '#111827',
        borderRadius: 16,
        padding: 32,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        color: '#d1d5db',
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingVertical: 10,
        fontSize: 14,
    },
    button: {
        backgroundColor: '#4f46e5',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    backButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    backButtonText: {
        color: '#818cf8',
        fontSize: 14,
        fontWeight: '500',
    },
});
