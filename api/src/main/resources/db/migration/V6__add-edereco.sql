-- Adiciona campo de endereço do imóvel à tabela visita
ALTER TABLE visita
    ADD COLUMN IF NOT EXISTS endereco_imovel VARCHAR(300);