# Overview

This is a VK Birthday Notification Automation system built with Mastra/TypeScript and Inngest. The application runs daily at 9 AM VLAT (Vladivostok time, UTC+10) to check for birthdays in a Grist database and posts Russian-language birthday announcements to a VK group wall.

The system is designed as a timed automation workflow that:
- Fetches birthday records from Grist
- Identifies people with birthdays today using TypeScript date logic
- Calculates their current age
- Posts formatted Russian messages to a VK group

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Framework & Runtime
- **Framework**: Mastra (v0.20.0) - TypeScript workflow framework (no AI/LLM used)
- **Workflow Engine**: Inngest (v3.40.2) - Handles workflow orchestration, step execution, and retry logic
- **Runtime**: Node.js >=20.9.0 with ES2022 modules
- **Language**: TypeScript with strict type checking

## Core Components

### Workflow Architecture
The application uses Mastra's workflow system to create a deterministic birthday checking process:
- **Birthday Workflow** (`src/mastra/workflows/birthdayWorkflow.ts`) - Main orchestration logic
- **Workflow Steps**: Single step that fetches from Grist, processes birthdays, and posts to VK
- **Cron Trigger**: Configured in `src/mastra/index.ts` for daily execution at 11 PM UTC (9 AM Brisbane time)
- **Direct Tool Calls**: Workflow calls gristTool and vkTool directly (no AI agent middleman)
- **Pure TypeScript**: All date logic, birthday matching, and age calculation done with TypeScript

### Tool System
Mastra's tool pattern is used to encapsulate external API interactions:
- **Grist Tool** (`src/mastra/tools/gristTool.ts`) - Fetches birthday records via Grist API
- **VK Tool** (`src/mastra/tools/vkTool.ts`) - Posts messages to VK group wall using VK API v5.131
- **Direct Execution**: Workflow calls tools directly using tool.execute() method
- Tools provide type-safe schemas using Zod for validation

### Storage & State Management
- **PostgreSQL**: Used by Mastra for workflow state persistence
- **Connection**: Configured via `@mastra/pg` package
- **Storage Instance**: Shared PostgreSQL store in `src/mastra/storage/index.ts`
- **Purpose**: Tracks workflow execution and manages state snapshots

### Logging
- **Pino Logger**: Production-grade logging with JSON output
- **Custom Implementation**: `ProductionPinoLogger` extends Mastra's logger base class
- **Log Levels**: Configurable (DEBUG, INFO, WARN, ERROR)
- **Structured Logging**: Includes timestamps and contextual data

## Data Flow

1. **Trigger**: Replit Scheduled Deployment fires at 9 AM VLAT (Vladivostok time, UTC+10)
2. **Fetch**: Grist tool retrieves all birthday records from document/table
3. **Process**: Workflow step filters records for today's birthdays and calculates ages
4. **Post**: VK tool posts formatted Russian message to group wall
5. **Result**: Workflow returns success/failure status with details

## Configuration Management

### Environment Variables (Required)
- **Grist**: `GRIST_API_KEY` for API authentication
- **VK**: `VK_ACCESS_TOKEN` for VK API authorization
- **Database**: Multiple PostgreSQL connection variables (DATABASE_URL, PGHOST, PGPORT, etc.) - auto-configured by Replit
- **Session**: `SESSION_SECRET` for application security - auto-configured by Replit
- **Deployment**: `NODE_ENV` determines production vs development behavior

**Note**: No AI/OpenAI API keys required - this automation uses pure TypeScript logic

### Hard-coded Configuration
- **Grist Document ID**: `4w9eBjjxRqUh`
- **Grist Table**: `Folks`
- **VK Group ID**: Negative number (e.g., -227823182) passed to VK tool

## Error Handling & Reliability

### Retry Logic
- **Production**: Inngest configured with 3 retry attempts
- **Development**: 0 retries for faster debugging
- **Non-Retriable Errors**: Uses Inngest's `NonRetriableError` for permanent failures

### Validation
- **Zod Schemas**: All tool inputs/outputs are validated
- **Type Safety**: Full TypeScript type checking throughout
- **Error Messages**: Descriptive error objects returned from tools

## Development vs Production

### Development Mode
- **Inngest Dev Server**: Runs on localhost:3000 with real-time middleware
- **No Retries**: Faster iteration during development
- **Mastra Dev Command**: `npm run dev` starts local development server

### Production Mode
- **Inngest Cloud**: Production event system
- **Retry Logic**: 3 attempts for failed operations
- **Logging**: Production-grade JSON logs
- **Build Process**: `npm run build` compiles TypeScript

## Deployment Constraints

### Replit-Specific
- **App Type**: Must be categorized as "Agents & Automations" (not "App")
- **Stack**: Requires `AGENT_STACK` in `.replit` configuration
- **Output Type**: Workflow metadata must specify `automations`
- **Migration**: Specific import process documented in MIGRATION.md

# External Dependencies

## Third-Party Services

### Grist (Data Source)
- **Purpose**: Cloud-based spreadsheet/database for birthday records
- **API Version**: REST API
- **Authentication**: Bearer token via `GRIST_API_KEY`
- **Endpoint Pattern**: `https://docs.getgrist.com/api/docs/{docId}/tables/{tableId}/records`
- **Data Format**: JSON with records array containing id and fields

### VK (VKontakte Social Network)
- **Purpose**: Russian social network for posting birthday announcements
- **API Version**: v5.131
- **Authentication**: Access token via `VK_ACCESS_TOKEN`
- **Method Used**: `wall.post` for posting to group walls
- **Parameters**: message, owner_id (negative for groups), from_group flag

## Database

### PostgreSQL
- **Provider**: Replit-managed PostgreSQL instance (auto-configured)
- **Client**: `@mastra/pg` package for Mastra integration
- **Connection**: Via multiple environment variables or single `DATABASE_URL`
- **Usage**: Workflow state persistence and execution tracking

## Key NPM Packages

### Core Framework
- `@mastra/core@^0.20.0` - Main framework for agents and workflows
- `@mastra/inngest@^0.16.0` - Inngest integration for workflow execution
- `inngest@^3.40.2` - Workflow orchestration engine

### Database & Storage
- `@mastra/pg@^0.17.1` - PostgreSQL integration
- `@mastra/libsql@^0.15.1` - Alternative storage option
- `@types/pg@^8.15.5` - TypeScript types for PostgreSQL

### Logging & Observability
- `@mastra/loggers@^0.10.15` - Logger integrations
- `pino@^9.9.4` - High-performance JSON logger

### AI/LLM (Available but Not Used)
- `@ai-sdk/openai@^1.3.24` - OpenAI SDK
- `ai@^4.3.16` - Vercel AI SDK
- `openai@^6.7.0` - OpenAI official client
- Note: While installed, the birthday workflow uses pure TypeScript logic without AI

### Utilities
- `zod@^3.25.76` - Schema validation
- `dotenv@^17.2.0` - Environment variable management
- `tsx@^4.20.3` - TypeScript execution

### Development Tools
- `typescript@^5.9.3` - TypeScript compiler
- `prettier@^3.6.2` - Code formatting
- `mastra@^0.14.0` - CLI development tools