package com.unimobili.api.services;

import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class VisitaService {
    public Visita createVisita(VisitaRequestDTO data){
        Visita novaVisita = new Visita();
        novaVisita.setCriado_em(OffsetDateTime.now());
        novaVisita.setData_hora(OffsetDateTime.parse(data.data_hora()));
        novaVisita.setCriado_por(data.criado_por());
        novaVisita.setDesignado_a(data.designado_a());
        novaVisita.setNome_cliente(data.nome_cliente());
        novaVisita.setTelefone_cliente(data.telefone_cliente());
        novaVisita.setChaves(data.chaves());
        novaVisita.setObservacoes(data.observacoes());
        novaVisita.setStatus("Marcada");
        novaVisita.setAtiva(Boolean.TRUE);

        return novaVisita;
    }
}
