-- Wipe everything and start fresh
delete from payments;
delete from suggestions;
delete from itinerary_items;
delete from tables;
delete from participants;

-- Add unique constraint to prevent duplicate participants in future
alter table participants add constraint participants_name_unique unique (name);
