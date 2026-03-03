
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);