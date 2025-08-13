CREATE TABLE IF NOT EXISTS jobs(
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    date_applied DATE NOT NULL,
    status  TEXT NOT NULL,
    referred INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cv TEXT,
    cover_letter TEXT,
    location TEXT,
    source TEXT,
    application_url TEXT,
    next_action DATE,
    notes TEXT,
    UNIQUE (company, title, date_applied),
    CHECK (status IN ('Applied', 'Home_Assignment', 'Interview', 'Offer', 'Offer_Accepted', 'Rejected')),
    CHECK (referred IN (0, 1))
    );
CREATE TRIGGER IF NOT EXISTS update_last_updated --update trigger - everyrtime a row has been updated, last_update will be set to the current timestampe 
AFTER UPDATE ON jobs
FOR EACH ROW
BEGIN
    UPDATE jobs 
    SET last_updated = CURRENT_TIMESTAMP 
    WHERE job_id = OLD.job_id;
END;

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_date_applied ON jobs(date_applied);