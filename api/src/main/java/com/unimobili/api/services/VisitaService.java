package com.unimobili.api.services;

import com.unimobili.api.domain.enums.UserRoles;
import com.unimobili.api.domain.user.User;
import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.domain.visita.VisitaResponseDTO;
import com.unimobili.api.repositories.UserRepository;
import com.unimobili.api.repositories.VisitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static com.unimobili.api.domain.enums.StatusVisita.AGENDADA;
import static com.unimobili.api.domain.enums.StatusVisita.CANCELADA;

@Service
public class VisitaService {

    private static final int DURACAO_PADRAO_MINUTOS = 60;

    @Autowired
    private VisitaRepository repository;

    @Autowired
    private UserRepository userRepository;

    private VisitaResponseDTO toDTO(Visita v) {
        return new VisitaResponseDTO(
                v.getId(),
                v.getCriado_em(),
                v.getData_hora(),
                v.getCriadoPor().getId(),
                v.getCriadoPor().getLogin(),
                v.getDesignadoA().getId(),
                v.getDesignadoA().getLogin(),
                v.getNome_cliente(),
                v.getTelefone_cliente(),
                v.getChaves(),
                v.getObservacoes(),
                v.getStatus(),
                v.getAtiva(),
                v.getDuracao_minutos(),
                v.getEndereco_imovel()
        );
    }

    private OffsetDateTime inicioDoDiaUtc() {
        return LocalDate.now(ZoneId.of("America/Sao_Paulo"))
                .atStartOfDay(ZoneId.of("America/Sao_Paulo"))
                .toOffsetDateTime()
                .withOffsetSameInstant(ZoneOffset.UTC);
    }

    public VisitaResponseDTO createVisita(VisitaRequestDTO data) {
        User criadoPor = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User designadoA = userRepository.findById(data.designado_a_id())
                .orElseThrow(() -> new java.util.NoSuchElementException("Usuario designado nao encontrado"));

        OffsetDateTime inicioUtc = OffsetDateTime
                .parse(data.data_hora())
                .withOffsetSameInstant(ZoneOffset.UTC);

        int duracao = (data.duracao_minutos() == null || data.duracao_minutos() <= 0)
                ? DURACAO_PADRAO_MINUTOS
                : data.duracao_minutos();

        OffsetDateTime fimUtc = inicioUtc.plusMinutes(duracao);

        boolean sobrepoe = repository.existsOverlappingVisit(
                designadoA.getId(), inicioUtc, fimUtc
        );

        if (sobrepoe) {
            throw new IllegalArgumentException("Esse visitador ja possui uma visita em horario sobreposto.");
        }

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
        novaVisita.setEndereco_imovel(data.endereco_imovel());

        repository.save(novaVisita);

        return toDTO(novaVisita);
    }

    public List<VisitaResponseDTO> getUpcomingVisitas() {
        return repository.findUpcomingVisitas(inicioDoDiaUtc())
                .stream().map(this::toDTO).toList();
    }

    public List<VisitaResponseDTO> getUpcomingVisitasByVisitador(UUID visitadorId) {
        return repository.findUpcomingVisitasByVisitador(visitadorId, inicioDoDiaUtc())
                .stream().map(this::toDTO).toList();
    }

    public void cancelVisita(UUID visitaId) {
        User usuarioLogado = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Visita visita = repository.findById(visitaId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Visita nao encontrada"));

        boolean isAdmin     = usuarioLogado.getRole() == UserRoles.ADMIN;
        boolean isCriador   = visita.getCriadoPor().getId().equals(usuarioLogado.getId());
        boolean isDesignado = visita.getDesignadoA().getId().equals(usuarioLogado.getId());

        if (!isAdmin && !isCriador && !isDesignado) {
            throw new AccessDeniedException("Voce nao tem permissao para cancelar esta visita.");
        }

        if (Boolean.FALSE.equals(visita.getAtiva())) {
            throw new IllegalArgumentException("Esta visita ja esta cancelada.");
        }

        visita.setAtiva(Boolean.FALSE);
        visita.setStatus(CANCELADA);
        repository.save(visita);
    }
}