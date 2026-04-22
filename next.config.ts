import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "external-content.duckduckgo.com",
      },
      {
        protocol: "https",
        hostname: "**.duckduckgo.com",
      },
      {
        protocol: "https",
        hostname: "howlongtobeat.com",
      },
      {
        protocol: "https",
        hostname: "**.imgur.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "static0.gamerantimages.com",
      },
      {
        protocol: "https",
        hostname: "vgjournal.net",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "**.bing.net",
      },
      {
        protocol: "https",
        hostname: "www.mobygames.com",
      },
      {
        protocol: "https",
        hostname: "**.wixmp.com",
      },
      {
        protocol: "https",
        hostname: "4kwallpapers.com",
      },
    ],
  },
};

export default withNextIntl("./i18n/request.ts")(nextConfig);