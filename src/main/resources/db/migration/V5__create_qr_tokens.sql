CREATE TABLE qr_tokens
(
    id             BIGSERIAL PRIMARY KEY,
    batch_id       BIGINT       NOT NULL UNIQUE REFERENCES batches (id),
    token_value    VARCHAR(36)  NOT NULL UNIQUE,
    qr_image       TEXT         NOT NULL,
    scan_count     INTEGER      NOT NULL DEFAULT 0,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);