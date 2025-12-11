#!/bin/bash

# SunoFlow Setup Checker
# Run this to verify your setup before starting

echo "🔍 SunoFlow Setup Checker"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Install from: https://nodejs.org/"
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} v$PNPM_VERSION"
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "  Install: npm install -g pnpm"
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"

    # Check required variables
    echo ""
    echo "Environment Variables:"

    check_env_var() {
        VAR_NAME=$1
        if grep -q "^${VAR_NAME}=" .env && ! grep -q "^${VAR_NAME}=\"\"" .env && ! grep -q "^${VAR_NAME}=your-" .env; then
            echo -e "  ${GREEN}✓${NC} $VAR_NAME"
        else
            echo -e "  ${RED}✗${NC} $VAR_NAME (not set)"
        fi
    }

    check_env_var "DATABASE_URL"
    check_env_var "SUNO_API_KEY"
    check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    check_env_var "CLERK_SECRET_KEY"
else
    echo -e "${RED}✗ Not found${NC}"
    echo "  Run: cp .env.example .env"
fi

# Check node_modules
echo ""
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Run: pnpm install"
fi

# Check Prisma Client
echo -n "Checking Prisma Client... "
if [ -d "node_modules/.prisma" ]; then
    echo -e "${GREEN}✓${NC} Generated"
else
    echo -e "${RED}✗ Not generated${NC}"
    echo "  Run: pnpm db:generate"
fi

# Check build directory
echo -n "Checking Next.js build... "
if [ -d ".next" ]; then
    echo -e "${YELLOW}⚠${NC} Previous build exists (will be rebuilt)"
else
    echo -e "${GREEN}✓${NC} Clean"
fi

echo ""
echo "=========================="
echo ""

# Final recommendations
if [ -f ".env" ] && [ -d "node_modules" ] && [ -d "node_modules/.prisma" ]; then
    echo -e "${GREEN}✓ Setup looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Push database schema: pnpm db:push"
    echo "  2. Start development: pnpm dev"
    echo "  3. Open: http://localhost:3000"
else
    echo -e "${YELLOW}⚠ Some setup steps are missing${NC}"
    echo ""
    echo "Follow these steps:"
    if [ ! -f ".env" ]; then
        echo "  1. cp .env.example .env"
        echo "  2. Edit .env with your credentials"
    fi
    if [ ! -d "node_modules" ]; then
        echo "  3. pnpm install"
    fi
    if [ ! -d "node_modules/.prisma" ]; then
        echo "  4. pnpm db:generate"
    fi
    echo "  5. pnpm db:push"
    echo "  6. pnpm dev"
fi

echo ""
echo "📚 Documentation:"
echo "  Quick Start: cat QUICKSTART.md"
echo "  Full Guide:  cat README.md"
echo ""
