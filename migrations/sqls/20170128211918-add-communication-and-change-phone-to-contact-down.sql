ALTER TABLE registrations RENAME contact to phone;
ALTER TABLE sent_messages RENAME contact to phone;
ALTER TABLE registrations DROP COLUMN communication_type;
ALTER TABLE sent_messages DROP COLUMN communication_type;
