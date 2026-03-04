package com.unimobili.api.services;

import com.unimobili.api.domain.user.User;
import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.domain.visita.VisitaResponseDTO;
import com.unimobili.api.repositories.UserRepository;
import com.unimobili.api.repositories.VisitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static com.unimobili.api.domain.enums.StatusVisita.AGENDADA;

@Service
public class VisitaService {

    private static final int DURACAO_PADRAO_MINUTOS = 60;

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

        // 1) Parse em UTC (padrão do seu projeto)
        OffsetDateTime inicioUtc = OffsetDateTime
                .parse(data.data_hora())
                .withOffsetSameInstant(ZoneOffset.UTC);

        // 2) Duração (default 60)
        int duracao = (data.duracao_minutos() == null || data.duracao_minutos() <= 0)
                ? DURACAO_PADRAO_MINUTOS
                : data.duracao_minutos();

        OffsetDateTime fimUtc = inicioUtc.plusMinutes(duracao);


        // 3) Regra de negócio: não pode sobrepor
        boolean sobrepoe = repository.existsOverlappingVisit(
                designadoA.getId(),
                inicioUtc,
                fimUtc
        );

        if (sobrepoe) {
            throw new IllegalArgumentException("Esse visitador já possui uma visita em horário sobreposto.");
        }

        // 4) Monta e salva
        Visita novaVisita = new Visita();
        novaVisita.setCriado_em(OffsetDateTime.now(ZoneOffset.UTC));
        novaVisita.setData_hora(inicioUtc);
        novaVisita.setDuracao_minutos(duracao);
        novaVisita.setData_hora_fim(fimUtc);

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
                novaVisita.getAtiva(),
                novaVisita.getDuracao_minutos()
        );
    }

    public List<VisitaResponseDTO> getUpcomingVisitas() {
        List<Visita> visitas = this.repository.findUpcomingVisitas(
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        return visitas.stream()
                .map(visita -> new VisitaResponseDTO(
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
                        visita.getAtiva(),
                        visita.getDuracao_minutos()
                ))
                .toList();
    }

    public List<VisitaResponseDTO> getUpcomingVisitasByVisitador(UUID visitadorId) {
        List<Visita> visitas = repository.findUpcomingVisitasByVisitador(
                visitadorId,
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        return visitas.stream()
                .map(visita -> new VisitaResponseDTO(
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
                        visita.getAtiva(),
                        visita.getDuracao_minutos()
                ))
                .toList();
    }
}