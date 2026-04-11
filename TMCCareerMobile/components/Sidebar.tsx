import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const navItems = [
    { label: 'Home', href: '/', icon: 'grid' },
    { label: 'Career Pathway', href: '/pathway', icon: 'map' },
    { label: 'Skills to Improve', href: '/skills', icon: 'flash' },
    { label: 'Internships', href: '/internships', icon: 'briefcase' },
    { label: 'Job Listings', href: '/jobs', icon: 'megaphone' },
    { label: 'Development Resources', href: '/resources', icon: 'book' },
    { label: 'Alumni Tracks', href: '/alumni', icon: 'people' },
    { label: 'Industry Trends', href: '/trends', icon: 'stats-chart' },
];

const bottomItems = [
    { label: 'Profile & Settings', href: '/profile', icon: 'person' },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
    const { logout, student, refreshStudent } = useAuth();
    const { refreshSaved } = useSaved();
    const pathname = usePathname();

    const handleNav = (href: string) => {
        onClose();
        if (href === '/') {
            refreshStudent();
            refreshSaved();
        }
        router.replace(href as any);
    };

    const handleLogout = async () => {
        onClose();
        await logout();
        router.replace('/(auth)/login');
    };

    const isActive = (href: string) => {
        if (href === '/' && pathname === '/') return true;
        return pathname === href;
    };

    return (
        <View style={styles.sidebar}>
            <TouchableOpacity 
                style={styles.brand} 
                onPress={() => handleNav('/')}
                activeOpacity={0.7}
            >
                <View style={styles.logoBox}>
                    <Text style={styles.logoSymbol}>✦</Text>
                </View>
                <View>
                    <Text style={styles.brandTitle}>Ascents</Text>
                    <Text style={styles.brandSubtitle}>Pathway Tool</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Main Nav */}
            <ScrollView contentContainerStyle={styles.navContainer} showsVerticalScrollIndicator={false}>
                {navItems.map((item) => (
                    <TouchableOpacity
                        key={item.href}
                        onPress={() => handleNav(item.href)}
                        style={[
                            styles.navItem,
                            isActive(item.href) && styles.activeNavItem
                        ]}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={isActive(item.href) ? '#818cf8' : '#9ca3af'}
                        />
                        <Text style={[
                            styles.navLabel,
                            isActive(item.href) && styles.activeNavLabel
                        ]}>
                            {item.label}
                        </Text>
                        {isActive(item.href) && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomSection}>
                {bottomItems.map((item) => (
                    <TouchableOpacity
                        key={item.href}
                        onPress={() => handleNav(item.href)}
                        style={[
                            styles.navItem,
                            isActive(item.href) && styles.activeNavItem
                        ]}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={isActive(item.href) ? '#818cf8' : '#9ca3af'}
                        />
                        <Text style={[
                            styles.navLabel,
                            isActive(item.href) && styles.activeNavLabel
                        ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#f87171" />
                    <Text style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        flex: 1,
        backgroundColor: '#111827', // Gray-900 (Sidebar bg)
        borderRightWidth: 1,
        borderRightColor: '#1f2937', // Gray-800
    },
    brand: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
        paddingTop: 60, // Safe Area padding
    },
    logoBox: {
        width: 36,
        height: 36,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoSymbol: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    brandTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    brandSubtitle: {
        color: '#6b7280',
        fontSize: 12,
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        top: 64,
    },
    navContainer: {
        padding: 12,
        gap: 4,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 2,
    },
    activeNavItem: {
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.3)',
    },
    navLabel: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
    },
    activeNavLabel: {
        color: '#a5b4fc', // indigo-300
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#a5b4fc',
        marginLeft: 'auto',
    },
    bottomSection: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
        marginBottom: 30, // Safe bottom area
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    logoutLabel: {
        color: '#f87171',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
    },
});
