ALTER TABLE movement_transactions
ALTER COLUMN signature_hash TYPE CHAR(64),
    ALTER COLUMN previous_hash  TYPE CHAR(64);