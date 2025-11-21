#!/bin/bash

# Render Deployment Verification Script
# Run this before deploying to catch common configuration issues

echo "🔍 Verifying Deployment Readiness for Render..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
ERRORS=0
WARNINGS=0

# Function to print error
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo "═══════════════════════════════════════════════════"
echo "1. Checking Repository Structure"
echo "═══════════════════════════════════════════════════"

# Check for render.yaml
if [ -f "render.yaml" ]; then
    print_success "render.yaml found"
else
    print_error "render.yaml not found - required for Blueprint deployment"
fi

# Check backend structure
if [ -d "backend" ]; then
    print_success "backend directory exists"
    
    if [ -f "backend/package.json" ]; then
        print_success "backend/package.json found"
        
        # Check for start script
        if grep -q '"start"' backend/package.json; then
            print_success "backend has 'start' script"
        else
            print_error "backend package.json missing 'start' script"
        fi
    else
        print_error "backend/package.json not found"
    fi
    
    if [ -f "backend/.env.example" ]; then
        print_success "backend/.env.example found"
    else
        print_warning "backend/.env.example not found (recommended for documentation)"
    fi
else
    print_error "backend directory not found"
fi

# Check frontend structure
if [ -d "frontend" ]; then
    print_success "frontend directory exists"
    
    if [ -f "frontend/package.json" ]; then
        print_success "frontend/package.json found"
        
        # Check for build and start scripts
        if grep -q '"build"' frontend/package.json; then
            print_success "frontend has 'build' script"
        else
            print_error "frontend package.json missing 'build' script"
        fi
        
        if grep -q '"start"' frontend/package.json; then
            print_success "frontend has 'start' script"
        else
            print_error "frontend package.json missing 'start' script"
        fi
    else
        print_error "frontend/package.json not found"
    fi
    
    if [ -f "frontend/.env.example" ]; then
        print_success "frontend/.env.example found"
    else
        print_warning "frontend/.env.example not found (recommended for documentation)"
    fi
else
    print_error "frontend directory not found"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "2. Checking Documentation"
echo "═══════════════════════════════════════════════════"

if [ -f "DEPLOYMENT.md" ]; then
    print_success "DEPLOYMENT.md found"
else
    print_warning "DEPLOYMENT.md not found (recommended for team)"
fi

if [ -f "README.md" ]; then
    print_success "README.md found"
else
    print_warning "README.md not found"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "3. Checking Git Status"
echo "═══════════════════════════════════════════════════"

if [ -d ".git" ]; then
    print_success "Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        print_success "No uncommitted changes"
    else
        print_warning "You have uncommitted changes - commit before deploying"
        echo "   Run: git status"
    fi
    
    # Check if on main/master branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
        print_success "On main/master branch"
    else
        print_warning "Not on main/master branch (current: $BRANCH)"
    fi
else
    print_error "Not a git repository"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "4. Checking .gitignore"
echo "═══════════════════════════════════════════════════"

if [ -f ".gitignore" ]; then
    print_success ".gitignore found"
    
    # Check if .env is ignored
    if grep -q "\.env" .gitignore; then
        print_success ".env files are ignored"
    else
        print_warning ".env files might not be ignored - check .gitignore"
    fi
    
    # Check if node_modules is ignored
    if grep -q "node_modules" .gitignore; then
        print_success "node_modules is ignored"
    else
        print_error "node_modules should be in .gitignore"
    fi
else
    print_error ".gitignore not found"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "5. Pre-Deployment Reminders"
echo "═══════════════════════════════════════════════════"

echo ""
echo "Before deploying to Render, make sure you have:"
echo "  📦 MongoDB Atlas account set up"
echo "  🔐 Database user created with password saved"
echo "  🌐 IP whitelist set to 0.0.0.0/0 on MongoDB Atlas"
echo "  🔗 Connection string ready"
echo "  🔑 GitHub account connected to Render"
echo ""

echo "═══════════════════════════════════════════════════"
echo "Summary"
echo "═══════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready to deploy to Render.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Commit and push any changes"
    echo "  2. Go to render.com and create a new Blueprint"
    echo "  3. Connect your GitHub repository"
    echo "  4. Follow the deployment guide in DEPLOYMENT.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s). Review and fix if needed.${NC}"
    echo ""
    echo "You can proceed with deployment, but review warnings above."
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
