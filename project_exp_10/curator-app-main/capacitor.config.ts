import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prateek.curator',
  appName: 'TracIt',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;