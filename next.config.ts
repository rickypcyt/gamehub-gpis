import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usar Webpack con configuración optimizada
  webpack: (config, { dev, isServer }) => {
    // Reducir uso de CPU en desarrollo
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Polling cada 1s en lugar de eventos constantes
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
