/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kaamsetu/shared', '@kaamsetu/api-client', '@kaamsetu/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/apks/KaamSetu-Worker-preview.apk',
        destination: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk',
        permanent: false,
      },
      {
        source: '/apks/worker.apk',
        destination: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk',
        permanent: false,
      },
      {
        source: '/apks/KaamSetu-Hiring-preview.apk',
        destination: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk',
        permanent: false,
      },
      {
        source: '/apks/hiring.apk',
        destination: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk',
        permanent: false,
      },
      {
        source: '/apks/KaamSetu-Contractor-preview.apk',
        destination: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk',
        permanent: false,
      },
      {
        source: '/apks/contractor.apk',
        destination: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
