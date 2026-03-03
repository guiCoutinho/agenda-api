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
import com.unimobili.api.domain.user.User;
import com.unimobili.api.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static com.unimobili.api.domain.enums.StatusVisita.AGENDADA;

@Service
public class VisitaService {

    @Autowired
    private VisitaRepository repository;

    @Autowired
    private UserRepository userRepository;

    public VisitaResponseDTO createVisita(VisitaRequestDTO data) {
        User criadoPor = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User designadoA = userRepository.findById(data.designado_a_id())
                .orElseThrow(() -> new RuntimeException("Usuário designado não encontrado"));

        Visita novaVisita = new Visita();
        novaVisita.setCriado_em(OffsetDateTime.now());
        novaVisita.setData_hora(OffsetDateTime.parse(data.data_hora()).withOffsetSameInstant(ZoneOffset.UTC));
        novaVisita.setCriadoPor(criadoPor);
        novaVisita.setDesignadoA(designadoA);
        novaVisita.setNome_cliente(data.nome_cliente());
        novaVisita.setTelefone_cliente(data.telefone_cliente());
        novaVisita.setChaves(data.chaves());
        novaVisita.setObservacoes(data.observacoes());
        novaVisita.setStatus(AGENDADA);
        novaVisita.setAtiva(Boolean.TRUE);

        repository.save(novaVisita);

        return new VisitaResponseDTO(
                novaVisita.getId(),
                novaVisita.getCriado_em(),
                novaVisita.getData_hora(),
                criadoPor.getId(),
                criadoPor.getLogin(),
                designadoA.getId(),
                designadoA.getLogin(),
                novaVisita.getNome_cliente(),
                novaVisita.getTelefone_cliente(),
                novaVisita.getChaves(),
                novaVisita.getObservacoes(),
                novaVisita.getStatus(),
                novaVisita.getAtiva()
        );
    }

    public List<VisitaResponseDTO> getUpcomingVisitas(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Visita> visitasPage = this.repository.findUpcomingVisitas(OffsetDateTime.now(), pageable);
        return visitasPage.map(visita -> new VisitaResponseDTO(
                visita.getId(),
                visita.getCriado_em(),
                visita.getData_hora(),
                visita.getCriadoPor().getId(),
                visita.getCriadoPor().getLogin(),
                visita.getDesignadoA().getId(),
                visita.getDesignadoA().getLogin(),
                visita.getNome_cliente(),
                visita.getTelefone_cliente(),
                visita.getChaves(),
                visita.getObservacoes(),
                visita.getStatus(),
                visita.getAtiva()
        )).stream().toList();
    }
}
