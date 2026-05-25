CREATE TABLE organizations
(
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200)        NOT NULL UNIQUE,
    type          VARCHAR(20)         NOT NULL,
    contact_email VARCHAR(255)        NOT NULL,
    address       VARCHAR(500)        NOT NULL,
    active        BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_org_type CHECK (type IN ('MANUFACTURER', 'SHIPPER', 'RETAILER'))
);