#!/bin/bash

# SunoFlow Database Setup Script
# This script helps you configure the database connection

echo "🗄️  SunoFlow Database Configuration"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Follow these steps to get your Supabase database:${NC}"
echo ""
echo "1. Open your browser and go to: https://supabase.com"
echo "2. Click 'Start your project' (Sign up with GitHub recommended)"
echo "3. Create a new organization (any name)"
echo "4. Create a new project:"
echo "   - Name: sunoflow"
echo "   - Database Password: (create a strong password - SAVE IT!)"
echo "   - Region: Choose closest to you"
echo "   - Click 'Create new project'"
echo ""
echo "5. Wait for ~1 minute while database initializes..."
echo ""
echo "6. Once ready, click on 'Project Settings' (gear icon, bottom left)"
echo "7. Go to 'Database' section"
echo "8. Find 'Connection Pooling' section"
echo "9. Make sure 'Session mode' is selected"
echo "10. Copy the connection string (looks like this):"
echo "    postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Prompt for database URL
echo -e "${YELLOW}⏳ Please complete the steps above, then return here...${NC}"
echo ""
read -p "Paste your Supabase connection string here: " DATABASE_URL

# Validate input
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  No URL provided. Exiting...${NC}"
    exit 1
fi

# Check if it looks like a valid PostgreSQL URL
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${YELLOW}⚠️  URL doesn't look like a PostgreSQL connection string${NC}"
    echo "It should start with: postgresql://"
    exit 1
fi

# Update .env file
echo ""
echo "🔧 Updating .env file..."

# Escape special characters for sed
ESCAPED_URL=$(echo "$DATABASE_URL" | sed 's/[&/\]/\\&/g')

# Use sed to replace the DATABASE_URL line
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$ESCAPED_URL\"|" .env
else
    # Linux
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$ESCAPED_URL\"|" .env
fi

echo -e "${GREEN}✓ DATABASE_URL updated in .env${NC}"
echo ""

# Test connection
echo "🧪 Testing database connection..."
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm db:generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma generation had warnings (usually OK)${NC}"
fi

echo ""
echo "🏗️  Pushing database schema to Supabase..."
pnpm db:push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database setup complete!${NC}"
    echo ""
    echo "🎉 You can now:"
    echo "   1. View your database: pnpm db:studio"
    echo "   2. Start the app: pnpm dev"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Schema push failed. Check the error above.${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Connection string might be incorrect"
    echo "  - Database might not be ready yet (wait a minute)"
    echo "  - Check if password contains special characters (needs URL encoding)"
    exit 1
fi
