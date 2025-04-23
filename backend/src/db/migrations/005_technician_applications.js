/**
 * Migration to create the technician_applications table
 */
export const technician_applications_up = `
CREATE TABLE IF NOT EXISTS technician_applications (
  application_id INTEGER PRIMARY KEY AUTOINCREMENT,
  personal_info TEXT NOT NULL, -- JSON with name, email, phone, location
  professional_info TEXT NOT NULL, -- JSON with specialization, years experience, etc.
  background TEXT, -- JSON with education, work history, etc.
  additional_info TEXT, -- JSON with skills, languages, etc.
  documents TEXT NOT NULL, -- JSON with file paths for CV, diplomas, motivation letter
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
  admin_notes TEXT, -- Notes from admin about the application
  technician_id INTEGER, -- ID of the created technician if approved
  submitted_at TEXT NOT NULL, -- ISO date string
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (technician_id) REFERENCES technicians (technician_id)
);

-- Create index for faster status lookups
CREATE INDEX IF NOT EXISTS idx_technician_applications_status ON technician_applications (status);
`;

/**
 * Migration to revert the technician_applications table creation
 */
export const technician_applications_down = `
DROP TABLE IF EXISTS technician_applications;
`; 