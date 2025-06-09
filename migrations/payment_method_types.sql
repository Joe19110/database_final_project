-- Create payment_method_types table
CREATE TABLE IF NOT EXISTS payment_method_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default payment method types if they don't exist
INSERT INTO payment_method_types (type_name) 
VALUES 
    ('Credit/Debit Card'),
    ('Digital Wallet'),
    ('Bank Transfer')
ON DUPLICATE KEY UPDATE type_name = VALUES(type_name);

-- Add type_id column to payment_methods if it doesn't exist
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS payment_method_type_id INTEGER;

-- Update existing payment methods with their types
UPDATE payment_methods
SET payment_method_type_id = (
    CASE 
        WHEN payment_method_name IN ('Visa', 'Mastercard', 'American Express') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Credit/Debit Card')
        WHEN payment_method_name IN ('PayPal', 'Google Pay', 'Apple Pay') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Digital Wallet')
        WHEN payment_method_name IN ('Direct Deposit', 'Wire Transfer') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Bank Transfer')
    END
);

-- Add foreign key constraint
ALTER TABLE payment_methods
ADD CONSTRAINT fk_payment_method_type
FOREIGN KEY (payment_method_type_id) 
REFERENCES payment_method_types(type_id);

-- Make payment_method_type_id NOT NULL
ALTER TABLE payment_methods
MODIFY COLUMN payment_method_type_id INTEGER NOT NULL; 