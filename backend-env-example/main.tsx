# Backend Configuration
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://localhost:5432/ea_accounting
# Or for SQLite: sqlite:./data/ea_accounting.db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# License Server (optional)
LICENSE_API_URL=https://license.ea-accounting.com/api

# Tax Authority APIs
# Kenya TIMS
TIMS_API_URL=https://api.kra.go.ke/tims
TIMS_API_KEY=your-tims-api-key

# Uganda EFRIS
EFRIS_API_URL=https://api.ura.go.ug/efris
EFRIS_API_KEY=your-efris-api-key

# Tanzania VFD
VFD_API_URL=https://api.tra.go.tz/vfd
VFD_API_KEY=your-vfd-api-key

# Rwanda EBM
EBM_API_URL=https://api.rra.go.rw/ebm
EBM_API_KEY=your-ebm-api-key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (optional, for queue)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug
