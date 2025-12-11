import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export class AuthPersistence {
  // Save auth state to AsyncStorage
  static async saveAuthState(user: any) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      if (user?.accessToken) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, user.accessToken);
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  // Get saved auth state from AsyncStorage
  static async getSavedAuthState() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting saved auth state:', error);
      return null;
    }
  }

  // Clear auth state from AsyncStorage
  static async clearAuthState() {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }

  // Get saved token
  static async getSavedToken() {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting saved token:', error);
      return null;
    }
  }
}