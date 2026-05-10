CREATE TABLE users
(
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255)        NOT NULL UNIQUE,
    password_hash   VARCHAR(255)        NOT NULL,
    role            VARCHAR(20)         NOT NULL,
    organization_id BIGINT              NOT NULL REFERENCES organizations (id),
    active          BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'MANUFACTURER', 'SHIPPER', 'RETAILER'))
);