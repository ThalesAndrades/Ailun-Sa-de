// Local module declarations to satisfy editor when types are missing
declare module '@expo/vector-icons';
declare module 'expo-linear-gradient';
declare module 'expo-router';
declare module 'react-native-safe-area-context';
// react-native has types via @types/react-native but declare minimal shape to avoid editor errors
declare module 'react-native' {
  export * from 'react';
  export const StyleSheet: any;
  export const Text: any;
  export const View: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const ActivityIndicator: any;
  export const Modal: any;
  export const Platform: any;
  export const Animated: any;
  export const Easing: any;
  export const FlatList: any;
  export const Image: any;
  export const Pressable: any;
  export const Switch: any;
  export const TextInput: any;
  export const KeyboardAvoidingView: any;
  export const Dimensions: any;
  export const StatusBar: any;
  export const useColorScheme: () => any;
}

// Minimal Deno declarations for server-side functions
declare namespace Deno {
  function env(): any;
  const env: {
    get: (key: string) => string | undefined;
  };
}

