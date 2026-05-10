CREATE TABLE products
(
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    description VARCHAR(1000),
    sku         VARCHAR(50)   NOT NULL UNIQUE,
    category    VARCHAR(100)  NOT NULL,
    created_by  BIGINT        NOT NULL REFERENCES users (id),
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE batches
(
    id                BIGSERIAL PRIMARY KEY,
    batch_number      VARCHAR(100)  NOT NULL UNIQUE,
    product_id        BIGINT        NOT NULL REFERENCES products (id),
    quantity          INTEGER       NOT NULL CHECK (quantity > 0),
    manufactured_date DATE          NOT NULL,
    expiry_date       DATE,
    status            VARCHAR(20)   NOT NULL DEFAULT 'CREATED',
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_batch_status CHECK (status IN ('CREATED', 'IN_TRANSIT', 'DELIVERED', 'COMPROMISED'))
);