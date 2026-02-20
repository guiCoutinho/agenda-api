package com.unimobili.api.domain.visita;

import com.unimobili.api.domain.enums.StatusVisita;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VisitaResponseDTO(UUID id, OffsetDateTime criado_em, OffsetDateTime data_hora, String criado_por, String designado_a, String nome_cliente, String telefone_cliente, String chaves, String observacoes, StatusVisita status, Boolean ativa) {
}
