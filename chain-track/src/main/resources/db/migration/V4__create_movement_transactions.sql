CREATE TABLE movement_transactions
(
    id             BIGSERIAL PRIMARY KEY,
    batch_id       BIGINT       NOT NULL REFERENCES batches (id),
    event_type     VARCHAR(20)  NOT NULL,
    from_org_id    BIGINT       REFERENCES organizations (id),
    to_org_id      BIGINT       NOT NULL REFERENCES organizations (id),
    timestamp      TIMESTAMP    NOT NULL,
    signature_hash CHAR(64)     NOT NULL,
    previous_hash  CHAR(64),
    performed_by   BIGINT       NOT NULL REFERENCES users (id),
    notes          VARCHAR(500),
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_event_type CHECK (event_type IN ('MANUFACTURED', 'SHIPPED', 'IN_TRANSIT', 'RECEIVED'))
);