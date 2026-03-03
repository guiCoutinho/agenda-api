ALTER TABLE visita
  DROP COLUMN criado_por,
  DROP COLUMN designado_a;

ALTER TABLE visita
  ADD COLUMN criado_por_id UUID NOT NULL,
  ADD COLUMN designado_a_id UUID NOT NULL;


ALTER TABLE visita
  ADD CONSTRAINT fk_visita_criado_por
    FOREIGN KEY (criado_por_id) REFERENCES users(id);

ALTER TABLE visita
  ADD CONSTRAINT fk_visita_designado_a
    FOREIGN KEY (designado_a_id) REFERENCES users(id);