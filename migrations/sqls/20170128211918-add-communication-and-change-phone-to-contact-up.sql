ALTER TABLE registrations RENAME phone to contact;
ALTER TABLE registrations ADD communication_type TEXT;
UPDATE registrations SET communication_type = 'sms';
ALTER TABLE sent_messages RENAME phone to contact;
ALTER TABLE sent_messages ADD communication_type TEXT;
UPDATE sent_messages SET communication_type = 'sms';
