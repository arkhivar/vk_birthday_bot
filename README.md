# 🎂 VK Birthday Notification Automation

Automated daily birthday notifications system that fetches birthday data from Grist and posts formatted Russian announcements to a private VK group.

## 📋 Overview

This automation runs **daily at 11 AM Brisbane time (1 AM UTC)** and:
- Fetches birthday data from a Grist document
- Identifies people with birthdays today
- Calculates their current age
- Posts a formatted Russian message to your VK group wall

## 🏗️ Architecture

**Stack:** Mastra/TypeScript with Inngest workflow orchestration

**Components:**
- **Grist Tool** (`src/mastra/tools/gristTool.ts`) - Fetches birthday records from Grist API
- **VK Tool** (`src/mastra/tools/vkTool.ts`) - Posts messages to VK group wall using VK API v5.131
- **Birthday Agent** (`src/mastra/agents/birthdayAgent.ts`) - AI agent for handling posting logic
- **Birthday Workflow** (`src/mastra/workflows/birthdayWorkflow.ts`) - Orchestrates the birthday checking and posting
- **Cron Trigger** - Time-based trigger configured in `src/mastra/index.ts`

## 🔧 Configuration

### Required Environment Variables (Secrets)

Create these secrets in your Replit project or set them in `.env`:

```bash
# Grist Configuration
GRIST_API_KEY=your_grist_api_key_here

# VK Configuration  
VK_ACCESS_TOKEN=your_vk_access_token_here

# Database (auto-configured by Replit)
DATABASE_URL=your_postgres_url
PGDATABASE=your_db_name
PGHOST=your_db_host
PGPASSWORD=your_db_password
PGPORT=your_db_port
PGUSER=your_db_user

# Session Secret
SESSION_SECRET=your_session_secret

# AI Integration (auto-configured by Replit AI Integrations)
AI_INTEGRATIONS_OPENAI_BASE_URL=auto_configured
AI_INTEGRATIONS_OPENAI_API_KEY=auto_configured
```

### Grist Configuration

- **Document ID**: `4w9eBjjxRqUh`
- **Table ID**: `Folks`
- **Required Columns**:
  - `name` (Text) - Person's name
  - `DoB` (Date/Unix timestamp) - Date of birth

**Important:** Your Grist API key must have at least **Viewer** access to the document.

### VK Configuration

- **Group ID**: `-227823182` (vk.com/secity)
- **API Version**: v5.131
- **Post Format**: Form-encoded POST with `from_group=1`
- **Access Token**: Must be a standalone app token with wall posting permissions

## 🚀 Deployment

### Option 1: Deploy on Replit (Recommended)

1. **Fork or import this project** to your Replit account
2. **Add required secrets** via Replit Secrets tab:
   - `GRIST_API_KEY`
   - `VK_ACCESS_TOKEN`
3. **Deploy** using Replit's deployment feature
4. The automation will run automatically every day at 11 AM Brisbane time

### Option 2: Migrate to Another Replit Account

1. **Push to GitHub**:
   ```bash
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Import to new Replit account**:
   - Go to Replit homepage
   - Select **"Agents & Automations"** as app type
   - Choose **"Timed Automation"** trigger
   - Import from GitHub repository
   - Select this repository

3. **Configure in new account**:
   - Add all required secrets (see Environment Variables section)
   - Enable Replit AI Integrations for OpenAI
   - Create a PostgreSQL database (via Replit Database tool)
   - Deploy the automation

**⚠️ Important for Migration:**
- Make sure to select **"Agents & Automations"** when creating the project (not "App")
- The `.replit` file is already configured with `stack = "AGENT_STACK"` and `outputType = "automations"`
- All secrets must be reconfigured in the new account

## 📁 Project Structure

```
.
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── birthdayAgent.ts       # AI agent for handling birthday posts
│   │   ├── tools/
│   │   │   ├── gristTool.ts           # Grist API integration
│   │   │   └── vkTool.ts              # VK API integration
│   │   ├── workflows/
│   │   │   └── birthdayWorkflow.ts    # Main workflow logic
│   │   ├── inngest/
│   │   │   └── index.ts               # Inngest client and cron setup
│   │   └── index.ts                   # Mastra instance and configuration
│   └── triggers/                      # (unused in this automation)
├── scripts/
│   ├── build.sh                       # Build script for deployment
│   └── inngest.sh                     # Inngest server startup
├── .replit                            # Replit configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

## 🧪 Testing

### Test in Playground (Development)

1. Go to the **Playground** tab in Replit
2. Select "Birthday Notification Workflow"
3. Click **"Run"**
4. Check the execution logs and VK group for the post

### Manual Test via API

```bash
# Trigger the workflow manually
curl -X POST "http://localhost:5000/api/workflows/birthdayWorkflow/run" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📅 Schedule

- **Cron Expression**: `0 1 * * *`
- **UTC Time**: 01:00 AM
- **Brisbane Time**: 11:00 AM (AEST/AEDT)
- **Frequency**: Daily

The schedule is configured in `src/mastra/index.ts` at line 161:
```typescript
registerCronWorkflow("0 1 * * *", birthdayWorkflow);
```

## 🔍 Troubleshooting

### No post appeared in VK group

**Check:**
1. Workflow execution logs in Playground
2. Grist API key has access to the document
3. VK access token is valid and has wall posting permissions
4. Server was running at scheduled time (1 AM UTC)
5. There are actually birthdays today in the Grist table

### Grist API returns "No view access"

**Solution:**
1. Go to your Grist document settings
2. Share the document with the account that owns the API key
3. Grant at least "Viewer" permissions

### Workflow not running automatically

**In Development:**
- The Replit must be active at 1 AM UTC for the cron to trigger
- If the server is sleeping, the job won't run

**In Production (Deployed):**
- The automation runs 24/7 regardless of activity
- Check deployment logs for errors

### Date/Birthday matching issues

The workflow uses TypeScript date logic (not AI) for reliable matching:
- DoB field is converted from Unix timestamp
- Only month and day are compared (year is ignored)
- Age is calculated as: current year - birth year

## 🛠️ Development

### Prerequisites
- Node.js >= 20.9.0
- PostgreSQL database
- Grist account with API access
- VK group with API access token

### Local Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# In another terminal, start Inngest server
./scripts/inngest.sh

# Run type checking
npm run check

# Format code
npm run format
```

### Key Technologies

- **Mastra** - AI agent framework
- **Inngest** - Workflow orchestration and scheduling
- **AI SDK v4** - For LLM integration (compatible with legacy Mastra methods)
- **Grist API** - Document and table data access
- **VK API v5.131** - Social media posting

## 📝 Notes

- **AI Integration**: Uses Replit AI Integrations for OpenAI (no personal API key needed)
- **Database**: PostgreSQL is used by Mastra for agent memory and workflow state
- **Security**: All secrets are managed via Replit Secrets (never committed to git)
- **Reliability**: TypeScript handles date matching (more reliable than AI date parsing)

## 📄 License

ISC

## 🤝 Support

For issues or questions about:
- **Mastra framework**: [Mastra Documentation](https://mastra.ai)
- **Grist API**: [Grist API Documentation](https://support.getgrist.com/api/)
- **VK API**: [VK API Documentation](https://dev.vk.com/reference)
- **Replit Deployment**: [Replit Documentation](https://docs.replit.com)

---

**Built with Replit Agents & Automations** 🤖
