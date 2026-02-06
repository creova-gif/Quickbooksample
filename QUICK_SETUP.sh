#!/bin/bash

echo "======================================================="
echo "EA Accounting Platform - Quick Setup"
echo "======================================================="
echo ""

# Step 1: Setup Backend
echo "Step 1/4: Setting up backend..."
echo ""

# Create backend directory if it doesn't exist
if [ ! -d "../backend" ]; then
  echo "Creating backend directory..."
  mkdir -p ../backend/src/db/migrations
  mkdir -p ../backend/src/routes
  mkdir -p ../backend/src/services
  mkdir -p ../backend/src/middleware
  mkdir -p ../backend/src/utils
  cd ../backend
else
  echo "Backend directory exists, navigating..."
  cd ../backend
fi

# Copy package.json
echo "Creating package.json..."
cp ../frontend/backend-package.json package.json 2>/dev/null || cat > package.json << 'EOF'
{
  "name": "ea-accounting-backend",
  "version": "1.0.0",
  "description": "EA Accounting Platform - Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^9.0.1",
    "decimal.js": "^10.4.3",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/cors": "^2.8.17",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
EOF

# Copy tsconfig.json
echo "Creating tsconfig.json..."
cp ../frontend/backend-tsconfig.json tsconfig.json 2>/dev/null || cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Copy source files
echo "Creating source files..."
cp ../frontend/backend-index.ts src/index.ts 2>/dev/null
cp ../frontend/backend-db-connection.ts src/db/connection.ts 2>/dev/null
cp ../frontend/backend-env-example .env.example 2>/dev/null
cp .env.example .env 2>/dev/null

# Install dependencies
echo ""
echo "Installing dependencies (this may take a minute)..."
npm install

echo ""
echo "✓ Backend setup complete!"
echo ""

# Step 2: Test Backend
echo "Step 2/4: Testing backend..."
echo ""
echo "Starting backend server..."
echo "(Press Ctrl+C to stop)"
echo ""

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3000/health | json_pp || echo "Backend not responding yet"

echo ""
echo "✓ Backend test complete!"
echo ""

# Stop background server
kill $SERVER_PID 2>/dev/null

# Step 3: Connect Frontend
echo "Step 3/4: Connecting frontend to backend..."
echo ""

cd ../frontend

# Update .env
if [ ! -f .env ]; then
  echo "Creating frontend .env file..."
  echo "VITE_API_URL=http://localhost:3000" > .env
else
  echo "Frontend .env already exists"
fi

echo ""
echo "✓ Frontend connected!"
echo ""

# Step 4: Summary
echo "======================================================="
echo "Setup Complete! 🎉"
echo "======================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend:"
echo "   cd ../backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Test the connection:"
echo "   Open http://localhost:5173"
echo "   Open browser console"
echo "   Test API calls"
echo ""
echo "4. Generate API routes with Cursor AI:"
echo "   Open CURSOR_PROMPTS.md"
echo "   Copy prompts and paste into Cursor"
echo ""
echo "======================================================="
echo ""
