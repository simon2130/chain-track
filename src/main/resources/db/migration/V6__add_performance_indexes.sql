CREATE INDEX idx_users_email              ON users (email);
CREATE INDEX idx_products_sku             ON products (sku);
CREATE INDEX idx_batches_batch_number     ON batches (batch_number);
CREATE INDEX idx_transactions_batch_time  ON movement_transactions (batch_id, timestamp);
CREATE INDEX idx_qr_tokens_token_value    ON qr_tokens (token_value);