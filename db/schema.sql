 --jobs schema 
CREATE TABLE IF NOT EXISTS jobs(
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- DISPLAY values:
    company_display   TEXT NOT NULL,
    title_display     TEXT NOT NULL,
    location_display  TEXT,
    source_display    TEXT,

    -- KEY values: normalized for filtering/sorting
    company_key   TEXT NOT NULL,
    title_key     TEXT NOT NULL,
    location_key  TEXT,
    source_key    TEXT,

    date_applied DATE NOT NULL,
    status       TEXT NOT NULL,
    referred     INTEGER NOT NULL DEFAULT 0,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    --optional fields
    cv TEXT, --name of file
    cover_letter TEXT, -- name of file
    application_url TEXT,
    next_action DATE,
    notes TEXT, --i.e "practice C++ for interview"

    UNIQUE (company_key, title_key, date_applied, source_key),

    CHECK (status IN ('Applied','Home_Assignment','Interview','Offer','Offer_Accepted','Rejected')),
    CHECK (referred IN (0,1)),

    CHECK (length(trim(company_display)) > 0),
    CHECK (length(trim(title_display)) > 0)
);
--Trigger to update last_updated, to keep track of progress for each entry
CREATE TRIGGER IF NOT EXISTS update_last_updated
AFTER UPDATE ON jobs
FOR EACH ROW
BEGIN
    UPDATE jobs
    SET last_updated = CURRENT_TIMESTAMP
    WHERE job_id = OLD.job_id;
END;

-- Indexes 
CREATE INDEX IF NOT EXISTS idx_jobs_company_key   ON jobs(company_key);
CREATE INDEX IF NOT EXISTS idx_jobs_title_key     ON jobs(title_key);
CREATE INDEX IF NOT EXISTS idx_jobs_location_key  ON jobs(location_key);
CREATE INDEX IF NOT EXISTS idx_jobs_source_key    ON jobs(source_key);
CREATE INDEX IF NOT EXISTS idx_jobs_status        ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied  ON jobs(date_applied);
