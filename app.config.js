module.exports = {
  expo: {
    name: "Ailun Saúde",
    slug: "ailun-saude-app",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/adaptive-icon.png",
    scheme: "ailun",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#00B4DB"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ailun.saude",
      buildNumber: "12"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#00B4DB"
      },
      package: "com.ailun.saude",
      versionCode: 12
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      }
    }
  }
};
