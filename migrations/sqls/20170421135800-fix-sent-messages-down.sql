UPDATE sent_messages SET description = date;
UPDATE sent_messages SET date = name;

ALTER TABLE sent_messages DROP COLUMN name TEXT;
ALTER TABLE sent_messages DROP COLUMN case_number TEXT;
