CREATE TABLE users ( 
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
);


CREATE TABLE accounts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    starting_amt NUMERIC(18, 2) NOT NULL DEFAULT 10000 CHECK (starting_amt >= 0),
    balance NUMERIC(18, 2) DEFAULT 10000 NOT NULL CHECK(balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE assets (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL UNIQUE,
    product_id VARCHAR(50)
);

CREATE TABLE holdings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),

    -- same account and asset combination cannot appear twice in holdings
    UNIQUE(account_id, asset_id),
    quantity NUMERIC(24, 8) NOT NULL CHECK (quantity >= 0),
    average_buy_price NUMERIC(24, 8) NOT NULL
);

CREATE TABLE trades ( 
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity NUMERIC(28, 8) NOT NULL CHECK (quantity > 0),
    price DECIMAL(24, 8) NOT NULL CHECK (price > 0),
    total DECIMAL(24, 8) NOT NULL CHECK (total > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);