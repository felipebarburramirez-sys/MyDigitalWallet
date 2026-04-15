import type { CapacitorConfig } from '@capacitor/cli';

const WEB_CLIENT_ID =
  '42918699567-1niphchki4b4ulpj02f5p3gb4q4jur3j.apps.googleusercontent.com';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MyDigitalWallet',
  webDir: 'www',
  plugins: {
    GoogleSignIn: {
      webClientId: WEB_CLIENT_ID,
    },
  },
};

export default config;
