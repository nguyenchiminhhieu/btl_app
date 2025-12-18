import {
    Button,
    TextInput
} from '@/components/design-system';
import {
    Container,
    Divider,
    HStack,
    Spacer,
    VStack
} from '@/components/design-system/Layout';
import {
    Body,
    Caption,
    Heading2,
    Heading3
} from '@/components/design-system/Typography';
import { DesignTokens } from '@/constants/design-tokens';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { signIn, signUp } = useAuth();

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Using AuthContext signIn method');
      await signIn(email.trim(), password);
      
      console.log('Login successful, navigating to tabs...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      if (email.toLowerCase() === 'demo@example.com' && error.message?.includes('Invalid login credentials')) {
        Alert.alert(
          'Create Demo User?',
          'Demo user does not exist. Would you like to create it automatically?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Create & Login',
              onPress: async () => {
                try {
                  setLoading(true);
                  await signUp('demo@example.com', 'demo123', 'Demo User');
                  Alert.alert('Success', 'Demo user created and logged in!');
                } catch (signUpError: any) {
                  Alert.alert('Error', 'Could not create demo user: ' + signUpError.message);
                } finally {
                  setLoading(false);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    // Auto-submit after a short delay
    setTimeout(() => handleLogin(), 100);
  };

  const goToRegister = () => {
    router.push('./register');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: DesignTokens.colors.neutral[50] }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container scrollable>
        <VStack gap="2xl" align="center" style={{ paddingVertical: DesignTokens.spacing['2xl'] }}>
          {/* Logo Section */}
          <VStack gap="lg" align="center">
            <VStack 
              align="center" 
              justify="center"
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: DesignTokens.colors.primary[600],
              }}
            >
              <Ionicons name="chatbubbles" size={40} color={DesignTokens.colors.neutral[0]} />
            </VStack>
            
            <VStack gap="xs" align="center">
              <Heading2 color={DesignTokens.colors.neutral[900]}>
                Lingua Talk
              </Heading2>
              <Caption color={DesignTokens.colors.neutral[600]}>
                Talk. Be Heard.
              </Caption>
            </VStack>
          </VStack>

          {/* Welcome Message */}
          <VStack gap="xs" align="center">
            <Heading3>Welcome Back!</Heading3>
            <Body align="center" color={DesignTokens.colors.neutral[600]}>
              Continue your speaking journey
            </Body>
          </VStack>

          {/* Login Form */}
          <VStack gap="md" style={{ width: '100%' }}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={emailError}
              disabled={loading}
            />
            
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={passwordError}
              disabled={loading}
            />
            
            <TouchableOpacity 
              onPress={() => {/* Handle forgot password */}}
              style={{ alignSelf: 'flex-end' }}
            >
              <Caption color={DesignTokens.colors.primary[600]}>
                Forgot Password?
              </Caption>
            </TouchableOpacity>
          </VStack>

          {/* Actions */}
          <VStack gap="sm" style={{ width: '100%' }}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              accessibilityLabel="Sign in to your account"
            >
              Sign In
            </Button>
            
            <HStack gap="xs" align="center" justify="center">
              <Divider style={{ flex: 1 }} />
              <Caption color={DesignTokens.colors.neutral[400]} style={{ paddingHorizontal: DesignTokens.spacing.md }}>
                OR
              </Caption>
              <Divider style={{ flex: 1 }} />
            </HStack>
            
            <Button
              variant="ghost"
              size="lg"
              onPress={handleDemoLogin}
              disabled={loading}
              accessibilityLabel="Continue as demo user"
              leftIcon="play-circle-outline"
            >
              Continue as Demo User
            </Button>
          </VStack>

          {/* Sign Up Link */}
          <HStack gap="xs" align="center">
            <Caption>Don't have an account?</Caption>
            <TouchableOpacity 
              onPress={goToRegister} 
              disabled={loading}
              accessibilityLabel="Go to sign up"
            >
              <Caption weight="semibold" color={DesignTokens.colors.primary[600]}>
                Sign Up
              </Caption>
            </TouchableOpacity>
          </HStack>

          <Spacer height={DesignTokens.spacing.lg} />

          {/* Features */}
          <VStack gap="md" style={{ width: '100%' }}>
            <Caption align="center" color={DesignTokens.colors.neutral[400]}>
              What you'll get:
            </Caption>
            
            <HStack justify="space-around" style={{ width: '100%' }}>
              <FeatureItem icon="trophy-outline" text="Track Progress" />
              <FeatureItem icon="mic-outline" text="AI Assessment" />
              <FeatureItem icon="star-outline" text="Earn Rewards" />
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </KeyboardAvoidingView>
  );
}

// Helper Component
const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <VStack align="center" gap="xs">
    <Ionicons 
      name={icon as any} 
      size={20} 
      color={DesignTokens.colors.primary[600]} 
    />
    <Caption align="center" color={DesignTokens.colors.neutral[600]}>
      {text}
    </Caption>
  </VStack>
);

// No styles needed - using design system components