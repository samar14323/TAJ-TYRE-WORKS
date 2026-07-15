# Taj Tyre Works - Database Backup & Recovery Manual

This document details policies and commands to perform snapshots, automated exports, and emergency schema restorations.

---

## 1. Automated PostgreSQL Backups

Since the project uses **Neon PostgreSQL**, backups are taken automatically every 24 hours at the database infrastructure layer. However, you can generate manual backups using standard command-line tools.

### 1.1. Export Schema and Data (pg_dump)
To take a complete snapshot of the database tables:

```bash
pg_dump -h <host_name> -U <user_name> -d <db_name> -F c -f ttw_backup.dump
```

*Note: Replace `<host_name>`, `<user_name>`, and `<db_name>` with details from your `.env` connection string.*

---

## 2. Restoring the Database

In case of data corruption or deployment to a new target database:

### 2.1. Restore Snapshot (pg_restore)
To restore a `.dump` backup file:

```bash
pg_restore -h <host_name> -U <user_name> -d <db_name> -v --clean ttw_backup.dump
```

### 2.2. Fresh Schema Creation & Re-Seed
If you wish to wipe the database and start with a clean initial seed:

```bash
# 1. Reset database tables non-interactively
npx prisma migrate reset --force

# 2. Run seeder script to recreate core accounts and products
node prisma/seed.js
```

---

## 3. Local Cache Recovery

The frontend implements a **write-through LocalStorage cache** strategy for offline robustness. If a user encounters local synchronization conflicts:
1. Log out of the portal to clear the session cookie.
2. Clear the browser cache and local storage.
3. Sign in again. The client will automatically fetch the latest database state from `/api/store`.
