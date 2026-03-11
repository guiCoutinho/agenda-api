package com.unimobili.api.domain.visita;

import java.util.UUID;

public record VisitaRequestDTO(
        String data_hora,
        UUID designado_a_id,
        String nome_cliente,
        String telefone_cliente,
        String chaves,
        String observacoes,
        Integer duracao_minutos,
        String endereco_imovel
) {}