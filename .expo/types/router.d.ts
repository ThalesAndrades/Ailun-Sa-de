/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/_sitemap` | `/admin/audit-logs` | `/consultation/pre-consultation` | `/consultation/request-immediate` | `/consultation/schedule` | `/consultation/webview` | `/dashboard` | `/login` | `/onboarding/platform-guide` | `/onboarding/step1` | `/onboarding/step2` | `/onboarding/step3` | `/payment` | `/payment-card` | `/payment-history` | `/payment-pix` | `/profile` | `/profile/plan` | `/profile/subscription` | `/signup/address` | `/signup/confirmation` | `/signup/contact` | `/signup/payment` | `/signup/payment-enhanced` | `/signup/personal-data` | `/signup/welcome` | `/splash` | `/subscription` | `/subscription/inactive` | `/tutorial`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
