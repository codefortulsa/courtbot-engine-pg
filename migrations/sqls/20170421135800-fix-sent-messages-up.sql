ALTER TABLE sent_messages ADD COLUMN name TEXT;
ALTER TABLE sent_messages ADD COLUMN case_number TEXT;

UPDATE sent_messages SET name = date;
UPDATE sent_messages SET date = description;
UPDATE sent_messages SET description = NULL;
