-- Necessário para EXCLUDE com UUID (=) usando GiST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Duração da visita (minutos). Padrão 60.
ALTER TABLE visita
ADD COLUMN IF NOT EXISTS duracao_minutos INTEGER NOT NULL DEFAULT 60;

-- Coluna de fim (evita expressão não-IMMUTABLE dentro do índice/constraint)
ALTER TABLE visita
ADD COLUMN IF NOT EXISTS data_hora_fim TIMESTAMP WITH TIME ZONE;

-- Preenche o fim para registros existentes (se houver)
UPDATE visita
SET data_hora_fim = data_hora + (duracao_minutos * interval '1 minute')
WHERE data_hora_fim IS NULL;

-- Garante que o fim não seja nulo a partir daqui
ALTER TABLE visita
ALTER COLUMN data_hora_fim SET NOT NULL;

-- Impede sobreposição para o mesmo visitador (somente visitas ativas)
-- Agora o range é feito apenas com COLUNAS -> passa no IMMUTABLE
ALTER TABLE visita
ADD CONSTRAINT visita_sem_sobreposicao
EXCLUDE USING gist (
  designado_a_id WITH =,
  tstzrange(data_hora, data_hora_fim, '[)') WITH &&
)
WHERE (ativa = true);