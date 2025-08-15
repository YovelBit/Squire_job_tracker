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