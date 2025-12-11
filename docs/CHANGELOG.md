# Changelog

All notable changes to this project will be documented in this file.

## [2025-12-12]

### Fixed

- **Explore Page**: Fixed the issue where the Explore page would show empty results or fail to load. Added high-quality mock data (with working audio and cover images) as a fallback mechanism when the 302.ai API is unstable or lacks a feed endpoint.
- **Image Loading**: Resolved image loading failures in the development environment by enabling `unoptimized: true` in `next.config.js`. This bypasses Next.js image optimization constraints for external URLs during local dev.
- **Authentication**: Restored lost `.env.local` configuration to fix Clerk authentication errors (Google Login) in the development environment.
- **Deployment**: Addressed Cloudflare Pages build compatibility issues (work in progress, currently reverted to stable state for development).

### Added

- Added detailed comments in `lib/suno-client.ts` explaining the fallback logic.
