**Squire Job Tracker**

A personal job application tracking tool built with Python, SQLite, and Docker.

**Progress Log**

**Day 1** — Project initialization.

- Defined initial database schema, constraints, and indexes.

- Populated with seed data for testing.

- Added .gitignore.

**Day 2** — Database connection and basic listing functionality.

- Implemented initial connector setup.

- Added first version of list_jobs.

**Day 3** — CRUD expansion and schema adjustments.

- Released second version of list_jobs.

- Implemented first version of add_job.

- Updated database schema to support new requirements.

**Day 4** — Schema refactor and normalization improvements.

- Split company, title, location, and source into *_display (user-facing) and *_key (normalized) columns.

Keys are system-managed and derived from the corresponding display fields; cannot be set manually.

**Normalization rules:**

Displays: trimmed, multiple spaces collapsed.

Keys: lowercase, trimmed, multiple spaces collapsed.

status: mapped to predefined values (Applied, Offer, etc.).

referred: coerced to 0 or 1.

- Added NOT NULL constraints for company_display, title_display, and status.

- Updated CRUD operations:

- checklist() now validates required display fields.

- normalize() derives all keys automatically.


- Added indexes for all *_key columns and frequently queried fields.

Removed legacy field-name shim; all inputs now use *_display fields.

Outcome:

Cleaner and safer schema.

Consistent, case-insensitive filtering.

Stronger validation to prevent inconsistent or invalid data.

**Day 5** — update_jobs and util.py

Implemented update_job() with dynamic column updates and RETURNING * support.

Enhanced normalize() for stricter data handling and date normalization, now able to be used as part of update_jobs.

Moved all helper functions, constants, and structures (e.g., template, STATUS_MAP, display_key) into a new util.py module, keeping crude.py focused and lean.

Added print_jobs() with a clean, readable output format for listing job entries.


**Day 6** – Migration from SQLite to PostgreSQL + Alembic + Docker

- Replaced the old SQLite setup with a PostgreSQL database running in a Docker container.

- Created a Docker Compose file to manage the Postgres service and persistent storage.

- Added a new app/db.py module to configure the SQLAlchemy engine, session maker, and base class.

- Converted the old manual SQL schema into a full SQLAlchemy ORM model (app/models.py), matching all constraints, indexes, and relationships from the original design.

- Initialized Alembic for database migrations and successfully generated and applied the first migration (jobs table).

- Updated main.py to test live inserts and queries through SQLAlchemy using the new Postgres database.

- Verified data persistence and schema integrity directly in Postgres via DBeaver.

- Cleaned up legacy files by removing the obsolete db/ folder from the repository (SQLite .sql files now preserved only in Git history).