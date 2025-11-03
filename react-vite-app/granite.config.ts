import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'multiverse-if',
  brand: {
    displayName: 'multiverse-if', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/6361/0ac02e2e-7b51-4a80-b669-7a12e3ceebe1.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: 'basic',
  },
  web: {
    host: '172.30.1.14',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
