import {
    Button,
    TextInput
} from '@/components/design-system';
import {
    Container,
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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    console.log('Register button pressed'); // Debug log
    
    if (!email.trim() || !displayName.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (displayName.length < 2) {
      Alert.alert('Lỗi', 'Tên hiển thị phải có ít nhất 2 ký tự');
      return;
    }

    setLoading(true);
    console.log('Starting registration for:', email); // Debug log
    
    try {
      console.log('Using AuthContext signUp method'); // Debug log
      
      await signUp(email.trim(), password, displayName.trim());
      
      console.log('Registration successful'); // Debug log
      
      // Hiển thị thông báo thành công
      Alert.alert(
        'Đăng ký thành công! 🎉', 
        'Tài khoản của bạn đã được tạo thành công. Đang chuyển đến trang chủ...', 
        [
          {
            text: 'OK',
            onPress: () => {
              // Auto navigation sẽ xảy ra thông qua auth state change
              // Nhưng chúng ta cũng có backup manual navigation
              setTimeout(() => {
                router.replace('/(tabs)' as any);
              }, 500);
            }
          }
        ]
      );
      
      // Backup navigation nếu auth state change bị delay  
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error); // Debug log
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Tên đăng nhập đã tồn tại';
            break;
          case 'auth/weak-password':
            errorMessage = 'Mật khẩu quá yếu';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email không hợp lệ';
            break;
          case 'auth/api-key-not-valid':
            errorMessage = 'Lỗi cấu hình Firebase. Vui lòng kiểm tra lại.';
            break;
          default:
            errorMessage = `Lỗi: ${error.code} - ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi đăng ký', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: DesignTokens.colors.neutral[50] }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container scrollable>
        <VStack gap="2xl" align="center" style={{ paddingVertical: DesignTokens.spacing['2xl'] }}>
          
          {/* Header with Icon */}
          <VStack gap="lg" align="center">
            <VStack
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: DesignTokens.colors.primary[600],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chatbubbles" size={40} color={DesignTokens.colors.neutral[0]} />
            </VStack>
            
            <VStack gap="xs" align="center">
              <Heading2 color={DesignTokens.colors.neutral[900]}>
                Join Lingua Talk
              </Heading2>
              <Caption color={DesignTokens.colors.neutral[600]}>
                Talk. Be Heard
              </Caption>
            </VStack>
          </VStack>

          {/* Welcome Section */}
          <VStack gap="xs" align="center">
            <Heading3>Create Account</Heading3>
            <Body align="center" color={DesignTokens.colors.neutral[600]}>
              Start your speaking journey today
            </Body>
          </VStack>

          {/* Form Section */}
          <VStack gap="md" style={{ width: '100%' }}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              editable={!loading}
            />

            <TextInput
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your full name"
              autoCapitalize="words"
              leftIcon="person-outline"
              editable={!loading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min 6 characters)"
              secureTextEntry={true}
              autoCapitalize="none"
              leftIcon="key-outline"
              editable={!loading}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={true}
              autoCapitalize="none"
              leftIcon="shield-checkmark-outline"
              editable={!loading}
            />
          </VStack>

          {/* Action Buttons */}
          <VStack gap="sm" style={{ width: '100%' }}>
            <Button
              variant="accent"
              size="lg"
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              leftIcon={loading ? "hourglass-outline" : "checkmark-circle-outline"}
              fullWidth
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            {/* Login Link */}
            <HStack gap="xs" align="center" justify="center">
              <Caption>Already have an account?</Caption>
              <TouchableOpacity onPress={goToLogin} disabled={loading}>
                <Caption weight="semibold" color={DesignTokens.colors.primary[600]}>
                  Sign In
                </Caption>
              </TouchableOpacity>
            </HStack>
          </VStack>

          <Spacer height={DesignTokens.spacing.lg} />

          {/* Benefits Section */}
          <VStack gap="md" style={{ width: '100%' }}>
            <Caption align="center" color={DesignTokens.colors.neutral[400]}>
              What you'll get:
            </Caption>
            
            <VStack gap="sm">
              <FeatureItem icon="checkmark-circle" text="Personalized learning path" />
              <FeatureItem icon="checkmark-circle" text="Interactive exercises & games" />
              <FeatureItem icon="checkmark-circle" text="Progress tracking & certificates" />
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </KeyboardAvoidingView>
  );
}

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <HStack gap="sm" align="center">
    <Ionicons 
      name={icon as any} 
      size={20} 
      color={DesignTokens.colors.success}
    />
    <Body color={DesignTokens.colors.neutral[600]}>
      {text}
    </Body>
  </HStack>
);