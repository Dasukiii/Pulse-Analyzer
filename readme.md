# Pulse Analyzer

Survey Intelligence Platform for HR Analytics - AI-powered theme detection, narrative generation, and engagement insights.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key (for AI features)
- Supabase account (for database - optional for demo mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pulse-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # OpenAI API Key (for AI-powered analysis)
   VITE_OPENAI_API_KEY=sk-your-openai-api-key
   
   # Supabase Configuration (optional - runs in demo mode without these)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup (Supabase)

If you want to use Supabase for data persistence:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the schema SQL**
   - Go to your Supabase project → SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL to create all tables, indexes, and policies

3. **Get your API keys**
   - Go to Settings → API
   - Copy the Project URL and anon/public key
   - Add them to your `.env` file

## 📁 Project Structure

```
pulse-analyzer/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── AppLayout.tsx       # Main app shell with sidebar
│   │   ├── ProtectedRoute.tsx  # Auth guard for routes
│   │   └── ApiKeySettings.tsx  # API key configuration modal
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── pages/           # Page components
│   ├── services/        # API services
│   │   ├── openai.ts          # OpenAI API integration
│   │   ├── database.ts        # Supabase database operations
│   │   ├── auth.ts            # Authentication service
│   │   └── upload.ts          # File upload & CSV parsing
│   ├── lib/             # Supabase client and types
│   ├── data/            # Mock data for demo mode
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point with providers
│   └── index.css        # Global styles
├── supabase/
│   └── schema.sql       # Database schema
├── public/              # Static assets
└── .env.example         # Environment variables template
```

## 🔐 Authentication

Pulse Analyzer features a complete authentication system:

### Features
- **Sign Up**: Create new accounts with email/password
- **Sign In**: Authenticate existing users
- **Demo Mode**: Try the app without signing up
- **Protected Routes**: All main features require authentication
- **Session Persistence**: Stay logged in across browser sessions

### How It Works
- When Supabase is configured, uses real Supabase Auth
- When in demo mode, creates a mock user session
- Automatically redirects unauthenticated users to landing page

## 📤 File Upload

Real CSV file parsing and upload functionality:

### Features
- **Drag & Drop**: Easy file upload interface
- **Auto-Detection**: Smart column mapping based on headers
- **Column Mapping**: Manual override of auto-detected mappings
- **CSV Template**: Download a pre-formatted template
- **Validation**: Check for required columns before processing
- **AI Processing**: Automatic theme detection and sentiment analysis

### Supported Columns
| Column | Required | Description |
|--------|----------|-------------|
| Timestamp | ✅ | Date/time of response |
| Department | ✅ | Department or team name |
| Overall Satisfaction | ✅ | Rating (1-5 or 1-10) |
| Email | ❌ | Respondent email |
| Work-Life Balance | ❌ | Rating score |
| Career Growth | ❌ | Rating score |
| Management | ❌ | Rating score |
| Open Feedback | ❌ | Free-text comments |

## 🤖 AI Features

Pulse Analyzer uses **GPT-4o-mini** for:

- **Theme Detection**: Analyzes open-ended survey responses to identify key themes
- **Sentiment Analysis**: Determines positive/negative/neutral sentiment
- **Narrative Generation**: Creates executive summaries and insights
- **Recommendations**: Generates actionable improvement recommendations

## 📊 Features

- **Dashboard**: Organization-wide metrics, heatmaps, and trends
- **Survey Library**: Browse, search, and compare surveys
- **Survey Upload**: Drag-and-drop CSV/Excel upload with AI processing
- **Heatmap View**: Interactive department × category visualization
- **Theme Analysis**: AI-powered theme detection from text responses
- **Indicator Tracking**: Track engagement, eNPS, and custom metrics
- **Narrative Highlights**: AI-generated executive summaries

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini

## 📝 Demo Mode

The app runs in **demo mode** when Supabase is not configured:
- Uses mock data for all features
- Authentication with any credentials works
- AI features require OpenAI API key (can be set in Settings)
- Perfect for testing and development

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- API keys stored in environment variables
- User authentication via Supabase Auth
- Protected routes for authenticated users
- Role-based access control (Admin, Manager, Viewer)

## 📄 License

MIT License
