# Agentic AI Agent Apps.com - Secure BYOK Platform

A sophisticated AI marketplace platform enabling users to discover, deploy, and interact with AI-powered web applications across various business domains using a secure Bring Your Own Key (BYOK) model.

## 🚀 Features

### Core Functionality
- **AI App Discovery**: Browse and explore AI applications with Adobe Express-style interface
- **BYOK Model**: Secure API key management with AES-256-GCM encryption
- **User Authentication**: Email/password registration and Google OAuth integration
- **Responsive Design**: Modern UI built with shadcn/ui components and Tailwind CSS

### Security Features
- **Advanced Encryption**: AES-256-GCM encryption for API key storage
- **Rate Limiting**: Protection against brute force attacks (5 requests/15min for sensitive operations)
- **Security Headers**: CSP, CSRF protection, and HTTP-only cookies
- **Audit Logging**: Comprehensive logging of all security events
- **Input Validation**: Sanitization and validation of all user inputs
- **Session Security**: Secure session management with PostgreSQL storage

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** with custom theming
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Express sessions** with PostgreSQL store
- **Helmet** for security headers
- **Express Rate Limit** for API protection

### Security
- **scrypt** for password hashing
- **AES-256-GCM** for API key encryption
- **CSRF** protection
- **Rate limiting** and **audit logging**
- **Input validation** and **sanitization**

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd agentic-ai-agent-apps
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication setup
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── security.ts        # Security middleware
│   └── encryption.ts      # Encryption utilities
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
└── README.md
```

## 🔒 Security Features

### API Key Management
- **Encrypted Storage**: All API keys are encrypted using AES-256-GCM
- **Secure Display**: Keys are masked in the UI and never logged
- **Provider Support**: Support for major AI providers (OpenAI, Anthropic, etc.)

### Authentication & Authorization
- **Password Security**: scrypt hashing with random salt
- **Session Management**: PostgreSQL-backed secure sessions
- **Rate Limiting**: Automatic protection against brute force attacks
- **Audit Logging**: All security events tracked with IP and user agent

### Security Dashboard
- **Real-time Monitoring**: View active security features
- **Security Recommendations**: Best practices guidance
- **Account Status**: Monitor authentication and encryption status

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `GET /api/auth/google` - Google OAuth login

### API Keys
- `GET /api/user/api-keys` - List user's API keys
- `POST /api/user/api-keys` - Create new API key
- `PUT /api/user/api-keys/:id` - Update API key
- `DELETE /api/user/api-keys/:id` - Delete API key

### Applications
- `GET /api/applications` - List all applications
- `POST /api/applications` - Create new application (admin)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
Ensure all required environment variables are set in your production environment.

### Database Migration
```bash
npm run db:push
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security

This application implements enterprise-grade security measures:
- All sensitive data is encrypted at rest
- Rate limiting prevents abuse
- Comprehensive audit logging
- Input validation and sanitization
- Secure session management

For security issues, please email [security@yourcompany.com](mailto:security@yourcompany.com)

## 📞 Support

For support, please open an issue in the GitHub repository or contact us at [support@yourcompany.com](mailto:support@yourcompany.com)