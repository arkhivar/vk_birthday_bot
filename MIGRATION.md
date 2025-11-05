# 🔄 Migration Guide

This guide helps you migrate the VK Birthday Notification Automation to another Replit account.

## ✅ Pre-Migration Checklist

Before pushing to GitHub, ensure:

- [ ] All secrets are documented in `.env.example`
- [ ] No actual secrets are committed to the repository
- [ ] `.gitignore` includes `.env`, `.env.development`, `node_modules`, `.mastra`
- [ ] README.md is complete and accurate
- [ ] All dependencies are listed in `package.json`
- [ ] `.replit` file has `stack = "AGENT_STACK"` (line 4)
- [ ] Workflow metadata has `outputType = "automations"` (lines 65, 77 in `.replit`)

## 📤 Step 1: Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/vk-birthday-automation.git

# Add all files
git add .

# Commit
git commit -m "Birthday automation ready for migration"

# Push to GitHub
git push -u origin main
```

## 📥 Step 2: Import to New Replit Account

### Important: Select Correct App Type

1. **Go to Replit homepage** with your target account
2. **Click "Create Repl"**
3. **⚠️ CRITICAL: Select "Agents & Automations"** from the app type selector
   - If you select "App" instead, it will be miscategorized
4. **Choose "Timed Automation"** as trigger type
5. **Select "Import from GitHub"**
6. **Authenticate with GitHub** if needed
7. **Select your repository** from the list
8. **Click "Import & Run"**

### Why This Matters

The app type selection determines how Replit categorizes and runs your project:
- **"Agents & Automations"** → Correct for scheduled workflows
- **"App"** → Wrong, treats it as a web application

The `.replit` file already contains the correct configuration (`stack = "AGENT_STACK"`), but the initial import selection is crucial.

## 🔧 Step 3: Configure in New Account

### A. Set Up Secrets

Go to the **Secrets** tab (Tools → Secrets) and add:

```bash
GRIST_API_KEY=<your-grist-api-key>
VK_ACCESS_TOKEN=<your-vk-access-token>
```

**How to get these:**
- **Grist API Key**: https://docs.getgrist.com → Profile Settings → API → Create
- **VK Access Token**: https://dev.vk.com → Create Standalone App → Get Token

### B. Enable AI Integration

1. Go to **Tools** → **AI Integrations**
2. Enable **OpenAI** integration
3. Confirm the integration is active

This automatically sets:
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`

### C. Create Database

1. Go to **Tools** → **Database**
2. Click **"Create Database"**
3. Select **PostgreSQL**
4. Database credentials are auto-configured

This automatically sets:
- `DATABASE_URL`
- `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER`

### D. Verify Configuration

Check that the `.replit` file shows:

```toml
[agent]
stack = "AGENT_STACK"
integrations = ["agentstack-trigger-time_based:1.0.0", "javascript_openai_ai_integrations:1.0.0"]
```

And workflows have:

```toml
[workflows.workflow.metadata]
outputType = "automations"
```

## ▶️ Step 4: Test the Automation

### Test in Playground

1. Go to **Playground** tab
2. Select **"Birthday Notification Workflow"**
3. Click **"Run"**
4. Verify:
   - Grist data fetches successfully
   - Birthdays are detected (if any today)
   - VK post appears in your group

### Check Logs

Monitor the workflow execution:
1. **Playground** shows real-time execution
2. **Console** tab shows server logs
3. **Inngest** server logs show workflow events

## 🚀 Step 5: Deploy

### Deploy the Automation

1. Click **"Deploy"** button (top right)
2. Select **"Scheduled Deployment"** (for time-based automations)
3. Review configuration
4. Click **"Deploy"**

### Verify Deployment

- **Cron schedule**: Runs daily at 1 AM UTC (11 AM Brisbane)
- **Status**: Should show "Active" or "Running"
- **Logs**: Check deployment logs for any errors

### Monitor First Scheduled Run

Wait until the next scheduled time (1 AM UTC / 11 AM Brisbane):
1. Check deployment logs
2. Verify VK group for the post
3. Check Inngest logs for execution history

## ⚠️ Common Migration Issues

### Issue: Project imported as "App" instead of "Automation"

**Symptoms:**
- Workflows don't appear in Playground
- Scheduled execution doesn't work
- Missing automation features

**Fix:**
1. Delete the incorrectly imported repl
2. Start over, making sure to select **"Agents & Automations"** in Step 2

### Issue: Secrets not working

**Symptoms:**
- "GRIST_API_KEY not set" errors
- "VK_ACCESS_TOKEN not found" errors

**Fix:**
1. Go to Secrets tab
2. Verify secrets are added to **"App Secrets"**
3. Make sure they're **linked** to this app (checkbox should be checked)
4. Restart the workflows

### Issue: Database connection errors

**Symptoms:**
- "DATABASE_URL not defined" errors
- PostgreSQL connection failures

**Fix:**
1. Go to Tools → Database
2. Make sure database is created
3. Verify database is linked to this app
4. Restart the workflows

### Issue: AI Integration not working

**Symptoms:**
- "AI_INTEGRATIONS_OPENAI_API_KEY not set"
- OpenAI API errors

**Fix:**
1. Go to Tools → AI Integrations
2. Enable OpenAI integration
3. Confirm it's active for this project
4. Restart the workflows

### Issue: Workflow doesn't run at scheduled time

**In Development Mode:**
- Server must be running at 1 AM UTC
- If server is sleeping, cron won't trigger
- **Solution**: Deploy to production

**In Production:**
- Check deployment status
- Review deployment logs for errors
- Verify cron expression is correct: `0 1 * * *`

## 📋 Post-Migration Verification

- [ ] Project appears as "Automation" (not "App")
- [ ] All secrets are configured
- [ ] AI Integration is enabled
- [ ] Database is created and connected
- [ ] Playground shows the workflow
- [ ] Manual test run succeeds
- [ ] Deployment is active
- [ ] First scheduled run completed successfully

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs**: Console, Playground, and Deployment logs
2. **Verify Secrets**: Make sure all required secrets are set
3. **Test Manually**: Use Playground to test before relying on scheduled runs
4. **Consult Docs**:
   - [Replit Agents & Automations](https://docs.replit.com)
   - [Mastra Documentation](https://mastra.ai)

---

**Pro Tip**: After successful migration, test the full flow by temporarily changing the cron schedule to run soon (e.g., next minute), then revert to the original `0 1 * * *` schedule.
