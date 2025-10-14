-- Migration: Create missing profiles from user_job_activity
-- This script will insert minimal profile rows for any user_id referenced in user_job_activity
-- that does not yet have a corresponding profiles row.

-- IMPORTANT: Review before running in production. Run in a transaction.

BEGIN;

INSERT INTO profiles (user_id)
SELECT DISTINCT u.user_id
FROM user_job_activity u
LEFT JOIN profiles p ON p.user_id = u.user_id
WHERE u.user_id IS NOT NULL
  AND p.user_id IS NULL;

COMMIT;
