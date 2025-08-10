INSERT INTO jobs (company, title, date_applied, status, referred, cv, location, source, application_url, next_action)
VALUES
('Company A', 'Software Engineer', '2025-08-11', 'Applied', 0, 'YBCV2', 'Tel Aviv', 'LinkedIn', 'https://example.com/apply', '2025-08-15');
INSERT INTO jobs (company, title, date_applied, status, referred, cv, location, source, application_url, next_action)
VALUES
('Company B', 'Software Developer', '2025-08-10', 'Interview', 1, 'YBCV2', 'New York', 'Indeed', 'https://example.com/apply', '2025-08-15');
INSERT INTO jobs (company, title, date_applied, status, referred, cv, location, source, application_url, next_action)
VALUES
('Company C', 'Product Manager', '2025-08-15', 'Offer_Accepted', 2, NULL, 'San Francisco', 'Company Website', NULL, NULL);
INSERT INTO jobs (company, title, date_applied, status, referred, cv, location, source, application_url, next_action)
VALUES
('Company D', 'DevOps Engineer', '2025-08-20', 'Waiting', 0, NULL, 'Berlin', 'Glassdoor', NULL, NULL);
SELECT company, title, date_applied FROM jobs;
SELECT * FROM jobs
WHERE company = 'Company A'
  AND title = 'Software Engineer'
  AND date_applied = '2025-08-10';
DELETE FROM jobs;
INSERT INTO jobs (company, title, date_applied, status)
VALUES ('Y Co', 'Data Eng', '2025-08-12', 'Applied');
SELECT company, referred, created_at, last_updated FROM jobs WHERE company='Y Co';
INSERT INTO jobs (company, title, date_applied, status, referred)
VALUES ('B Co', 'Software Engineer', '2025-08-10', 'Interview', 1);
INSERT INTO jobs (company, title, date_applied, status, referred)
VALUES ('B Co', 'Software Engineer', '2025-08-10', 'Applied', 0);
SELECT company, title, date_applied, status, referred FROM jobs WHERE company='B Co' AND title='Software Engineer';
UPDATE jobs SET status='Foo' WHERE company='B Co' AND title='Software Engineer';
INSERT INTO jobs (company, title, date_applied, status, referred, cv, cover_letter, application_url, next_action)
VALUES ('D Co', 'QA', '2025-08-16', 'Applied', 0, NULL, NULL, NULL, NULL);
SELECT company, title, date_applied, status, referred, cv, cover_letter, application_url, next_action FROM jobs WHERE company='D Co' AND title='QA';
UPDATE jobs SET date_applied='2025-15-10' WHERE company='D Co' AND title='QA';
DELETE FROM jobs;
DELETE FROM sqlite_sequence WHERE name='jobs';