// Global ambient declarations to reduce noisy type errors during app-only typechecking

declare namespace NodeJS {
  // Provide a fallback Timeout type for environments where it's missing
  interface Timeout {}
}

// Missing module shims (project uses alias paths like @/constants/...)
declare module '@/constants/Colors' {
  const value: any;
  export default value;
}

declare module '@/hooks/useColorScheme' {
  const value: any;
  export default value;
}

// Expo modules shim
declare module 'expo-modules-core' {
  export type Subscription = any;
  const _default: any;
  export default _default;
}

// Generic fallback for a few internal aliases used in the codebase
declare module '@/*' {
  const value: any;
  export default value;
}

// Allow importing JSON or other assets without type errors
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
