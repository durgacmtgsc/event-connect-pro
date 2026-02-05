-- Add validation constraints to slot_purchases table
ALTER TABLE public.slot_purchases 
  ADD CONSTRAINT valid_customer_phone 
    CHECK (length(customer_phone) >= 10 AND length(customer_phone) <= 20),
  ADD CONSTRAINT valid_customer_name
    CHECK (length(customer_name) >= 1 AND length(customer_name) <= 100),
  ADD CONSTRAINT valid_price 
    CHECK (price >= 0 AND price <= 100000),
  ADD CONSTRAINT valid_slot_count
    CHECK (slot_count > 0 AND slot_count <= 1000),
  ADD CONSTRAINT valid_customer_email
    CHECK (customer_email IS NULL OR (length(customer_email) >= 3 AND length(customer_email) <= 255)),
  ADD CONSTRAINT valid_slot_plan
    CHECK (length(slot_plan) >= 1 AND length(slot_plan) <= 100);

-- Add validation constraints to contact_inquiries table
ALTER TABLE public.contact_inquiries
  ADD CONSTRAINT valid_inquiry_name
    CHECK (length(name) >= 1 AND length(name) <= 100),
  ADD CONSTRAINT valid_inquiry_phone
    CHECK (length(phone) >= 10 AND length(phone) <= 20),
  ADD CONSTRAINT valid_inquiry_email
    CHECK (email IS NULL OR (length(email) >= 3 AND length(email) <= 255)),
  ADD CONSTRAINT valid_inquiry_message
    CHECK (message IS NULL OR length(message) <= 2000);