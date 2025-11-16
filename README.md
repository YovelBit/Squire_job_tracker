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

**Day 7** — ORM finalization, filtering logic, and Dockerized testing

- Debugged and fixed final issues after the migration to PostgreSQL + SQLAlchemy + Alembic  + Docker.

- Updated Alembic and SQLAlchemy connection URLs to use the Docker service hostname db instead of localhost.

- Resolved import-path issues by standardizing all internal imports to the app.* structure.

- Enabled interactive CLI support inside the Docker container (stdin_open, tty) for direct testing with docker-compose run --rm app.

- Enhanced list_jobs() with:

- Safe handling of empty or missing filters.

- Case-insensitive text matching.

- Automatic normalization of filter input values.

- Robust error handling and ordering logic.

- Verified complete CRUD functionality (add_job, update_job, delete_job, list_jobs) through the CLI.

- Tested all operations end-to-end inside Docker and confirmed data persistence through DBeaver.

- System now fully stable and ready for API layer development.

**Day 8** – User authentication system & multi-user architecture

- CRUD overhaul:
    Updated update_job() and delete_job() to use public_id (UUID) and user_id, ensuring each user can access only their own records.

- API improvements:
    jobs.py now references public_id and injects a placeholder current_user, preparing for full JWT authentication.

- Schemas cleanup:
    Refactored schemas.py for clarity; added public_id visibility in job responses for API interaction.

- Introduced /core folder:

    config.py – centralizes configuration and environment constants.

    dependencies.py – manages DB sessions and user retrieval.

    security.py – handles password hashing, JWT creation, and token decoding.

- User routes:
    Added /users/register and /users/login endpoints in app/api/users.py.

- App structure:
    main.py now wires both user and job routers into a single FastAPI app.

- Authentication:
    Implemented user registration, login, hashed password storage, and JWT-based authentication; get_current_user now extracts the user ID from the verified token.