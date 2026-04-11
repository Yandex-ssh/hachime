import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Sidebar from '@/components/Sidebar';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { student } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <Sidebar onClose={() => (props.navigation as any).closeDrawer()} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#030712', // gray-950
          borderBottomWidth: 1,
          borderBottomColor: '#1f2937', // gray-800
        },
        headerTintColor: '#fff',
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.7)',
        // Custom header right (profile)
        headerRight: () => (
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.avatar}>
              {student?.profile_picture_url ? (
                <Image source={{ uri: student.profile_picture_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{student?.name?.[0] || 'S'}</Text>
              )}
            </View>
          </TouchableOpacity>
        )
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="pathway"
        options={{
          title: 'Career Pathway',
        }}
      />
      <Drawer.Screen
        name="skills"
        options={{
          title: 'Skills to Improve',
        }}
      />
      <Drawer.Screen
        name="internships"
        options={{
          title: 'Internships',
        }}
      />
      <Drawer.Screen
        name="jobs"
        options={{
          title: 'Job Listings',
        }}
      />
      <Drawer.Screen
        name="resources"
        options={{
          title: 'Development Resources',
        }}
      />
      <Drawer.Screen
        name="alumni"
        options={{
          title: 'Alumni Tracks',
        }}
      />
      <Drawer.Screen
        name="trends"
        options={{
          title: 'Industry Trends',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile & Settings',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  profileBtn: {
    marginRight: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    borderWidth: 1,
    borderColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  }
});
