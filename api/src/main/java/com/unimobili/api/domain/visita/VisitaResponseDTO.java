package com.unimobili.api.domain.visita;

import com.unimobili.api.domain.enums.StatusVisita;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VisitaResponseDTO(
        UUID id,
        OffsetDateTime criado_em,
        OffsetDateTime data_hora,
        UUID criado_por_id,
        String criado_por_login,
        UUID designado_a_id,
        String designado_a_login,
        String nome_cliente,
        String telefone_cliente,
        String chaves,
        String observacoes,
        StatusVisita status,
        Boolean ativa,
        Integer duracao_minutos,
        String endereco_imovel
) {}