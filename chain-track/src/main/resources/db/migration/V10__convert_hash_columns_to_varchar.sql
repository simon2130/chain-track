ALTER TABLE movement_transactions
ALTER COLUMN signature_hash TYPE VARCHAR(64),
    ALTER COLUMN previous_hash  TYPE VARCHAR(64);