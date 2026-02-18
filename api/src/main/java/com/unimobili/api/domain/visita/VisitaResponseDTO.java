package com.unimobili.api.domain.visita;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VisitaResponseDTO(UUID id, OffsetDateTime criado_em, OffsetDateTime data_hora, String criado_por, String designado_a, String nome_cliente, String telefone_cliente, String chaves, String observacoes, String status, Boolean ativa) {
}
