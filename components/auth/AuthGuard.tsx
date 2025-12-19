import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // Always call all hooks before any conditional returns
  // This ensures hooks are called consistently on every render
  
  // Hiển thị loading spinner khi đang kiểm tra auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Return empty view instead of null to maintain consistent component structure
  // This prevents hooks errors in child components during navigation
  if (!user) {
    return <View style={styles.emptyContainer} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});