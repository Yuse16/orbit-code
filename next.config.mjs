const isProduction = process.env.NODE_ENV === 'production'
const internalHost = process.env.TAURI_DEV_HOST ?? '127.0.0.1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  output: 'export',
  assetPrefix: isProduction ? undefined : `http://${internalHost}:1420`,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
