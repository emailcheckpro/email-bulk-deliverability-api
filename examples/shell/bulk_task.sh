#!/usr/bin/env bash
set -euo pipefail
: "${EMAILCHECKPRO_API_KEY:?Set EMAILCHECKPRO_API_KEY}"
PRODUCT="${PRODUCT:-email_batch}"
FILE="${FILE:-emails.txt}"

task=$(curl -fsS -X POST 'https://emailcheckpro.com/api/v1/bulk-tasks' \
  -H "X-API-Key: $EMAILCHECKPRO_API_KEY" \
  -F "product=$PRODUCT" -F "file=@$FILE")
echo "$task"
id=$(printf '%s' "$task" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 轮询间隔不得短于 30 秒，这是服务端的契约而不是建议。
while true; do
  sleep 30
  body=$(curl -fsS "https://emailcheckpro.com/api/v1/bulk-tasks/$id" -H "X-API-Key: $EMAILCHECKPRO_API_KEY")
  echo "$body"
  printf '%s' "$body" | grep -q '"status":"processing"' || break
done
