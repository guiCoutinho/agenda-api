CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE visita (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    criado_em TIMESTAMP WITH TIME ZONE,
    data_hora TIMESTAMP WITH TIME ZONE,
    criado_por VARCHAR(100) NOT NULL,
    designado_a VARCHAR(100) NOT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    telefone_cliente VARCHAR(30) NOT NULL,
    chaves VARCHAR(150) NOT NULL,
    observacoes VARCHAR(300),
    status VARCHAR(50) NOT NULL,
    ativa BOOLEAN NOT NULL
);