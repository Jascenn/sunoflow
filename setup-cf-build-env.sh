#!/bin/bash

# 为 Cloudflare Pages 设置构建时环境变量的脚本
# 注意: 这需要通过 Cloudflare API 设置

PROJECT_NAME="sunoflow"
ACCOUNT_ID="faf27bb85449e71e16887d0917e44239"

echo "📝 通过 Cloudflare API 设置构建环境变量..."

# 使用 wrangler 的 API token
# 注意: NEXT_PUBLIC_ 开头的变量需要在构建时可用

curl -X PATCH "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}" \
  -H "Authorization: Bearer $(wrangler config get api_token 2>/dev/null || echo '')" \
  -H "Content-Type: application/json" \
  --data '{
    "deployment_configs": {
      "production": {
        "env_vars": {
          "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": {
            "value": "pk_test_bmljZS1naG9zdC05Ny5jbGVyay5hY2NvdW50cy5kZXYk"
          },
          "NEXT_PUBLIC_CLERK_SIGN_IN_URL": {
            "value": "/sign-in"
          },
          "NEXT_PUBLIC_CLERK_SIGN_UP_URL": {
            "value": "/sign-up"
          },
          "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL": {
            "value": "/dashboard"
          },
          "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL": {
            "value": "/dashboard"
          },
          "NODE_ENV": {
            "value": "production"
          }
        }
      }
    }
  }'
