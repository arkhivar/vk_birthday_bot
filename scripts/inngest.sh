#!/usr/bin/env bash

set -e

INNGEST_CONFIG=".config/inngest/inngest.yaml"

# Try to store Inngest data in Postgres if it's available. Otherwise, put it in SQLite.
if [[ ! -f  "${INNGEST_CONFIG}" ]]; then
    mkdir -p "$(dirname "${INNGEST_CONFIG}")"
    if [[ -n "${DATABASE_URL}" ]]; then
        printf 'postgres-uri: "%s"' "${DATABASE_URL}" > "${INNGEST_CONFIG}"
    else
        printf 'sqlite-dir: "/home/runner/workspace/.local/share/inngest"' > "${INNGEST_CONFIG}"
    fi
fi

# Use production mode if NODE_ENV is production, otherwise use dev mode
if [[ "${NODE_ENV}" == "production" ]]; then
    # In production, Inngest should connect to Inngest Cloud, not run a dev server
    # The Mastra server will handle webhook connections to Inngest Cloud
    echo "Production mode: Inngest will use cloud connection via Mastra server"
    # Keep the process alive but don't run a local dev server
    tail -f /dev/null
else
    exec npx inngest-cli dev -u http://localhost:5000/api/inngest --host 127.0.0.1 --port 3000 --config "${INNGEST_CONFIG}"
fi
