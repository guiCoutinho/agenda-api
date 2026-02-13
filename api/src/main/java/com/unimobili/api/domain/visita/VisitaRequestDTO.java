package com.unimobili.api.domain.visita;

import java.time.OffsetDateTime;

public record VisitaRequestDTO(String data_hora, String criado_por, String designado_a, String nome_cliente, String telefone_cliente, String chaves, String observacoes) {
}
