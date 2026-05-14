CREATE TABLE jwt_blacklist
(
    id         BIGSERIAL PRIMARY KEY,
    token      TEXT        NOT NULL UNIQUE,
    expired_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jwt_blacklist_token ON jwt_blacklist (token);