package com.unimobili.api.services;

import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.domain.visita.VisitaResponseDTO;
import com.unimobili.api.repositories.VisitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;

@Service
public class VisitaService {

    @Autowired
    private VisitaRepository repository;

    public Visita createVisita(VisitaRequestDTO data){
        Visita novaVisita = new Visita();
        novaVisita.setCriado_em(OffsetDateTime.now());
        novaVisita.setData_hora(OffsetDateTime.parse(data.data_hora()).withOffsetSameInstant(ZoneOffset.UTC));
        novaVisita.setCriado_por(data.criado_por());
        novaVisita.setDesignado_a(data.designado_a());
        novaVisita.setNome_cliente(data.nome_cliente());
        novaVisita.setTelefone_cliente(data.telefone_cliente());
        novaVisita.setChaves(data.chaves());
        novaVisita.setObservacoes(data.observacoes());
        novaVisita.setStatus("Marcada");
        novaVisita.setAtiva(Boolean.TRUE);

        repository.save(novaVisita);

        return novaVisita;
    }

    public List<VisitaResponseDTO> getUpcomingVisitas(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Visita> visitasPage = this.repository.findUpcomingVisitas(OffsetDateTime.now(), pageable);
        return visitasPage.map(visita -> new VisitaResponseDTO(visita.getId(), visita.getCriado_em(),visita.getData_hora(), visita.getCriado_por(), visita.getDesignado_a(), visita.getNome_cliente(), visita.getTelefone_cliente(), visita.getChaves(), visita.getObservacoes(), visita.getStatus(), visita.getAtiva())).stream().toList();
    }
}
