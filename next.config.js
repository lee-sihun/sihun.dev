const { withContentlayer } = require("next-contentlayer");
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        port: "",
      },
      { protocol: "https", hostname: "**" },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/blog',
  //       permanent: true,
  //     },
  //   ];
  // },
};

module.exports = withMDX(withContentlayer(nextConfig));
