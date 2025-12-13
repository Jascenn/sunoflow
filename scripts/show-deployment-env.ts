
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env manually to ensure we get everything
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log('\n🌟 Cloudflare Pages 部署配置清单 🌟\n');
console.log('请登录 Cloudflare Dashboard -> Pages -> sunoflow -> Settings -> Environment variables');
console.log('点击 "Edit variables" 或 "Add variable"，将以下内容逐一添加：\n');

const REQUIRED_KEYS = [
    'DATABASE_URL',
    'SUNO_PROVIDER',
    'SUNO_BASE_URL',
    'SUNO_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

console.table(
    REQUIRED_KEYS.map(key => ({
        '变量名 (Variable Name)': key,
        '值 (Value)': envConfig[key] || '⚠️ 未在本地 .env 中找到 (请手动查找)'
    }))
);

console.log('\n💡 提示: 添加完所有变量后，请点击 "Save"，然后重新部署 (Deploy) 一次以生效。\n');
