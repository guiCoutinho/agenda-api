package com.unimobili.api.controller;

import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.domain.visita.VisitaResponseDTO;
import com.unimobili.api.domain.visita.TransferirVisitaDTO;
import com.unimobili.api.services.VisitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/visita")
public class VisitaController {

    @Autowired
    private VisitaService visitaService;

    @PostMapping
    public ResponseEntity<VisitaResponseDTO> create(@RequestBody VisitaRequestDTO body) {
        VisitaResponseDTO novaVisita = this.visitaService.createVisita(body);
        return ResponseEntity.ok(novaVisita);
    }

    @GetMapping
    public ResponseEntity<List<VisitaResponseDTO>> getVisitas() {
        List<VisitaResponseDTO> allVisitas = this.visitaService.getUpcomingVisitas();
        return ResponseEntity.ok(allVisitas);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelVisita(@PathVariable UUID id) {
        visitaService.cancelVisita(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/upcoming/visitador/{visitadorId}")
    public ResponseEntity<List<VisitaResponseDTO>> getUpcomingVisitasByVisitador(
            @PathVariable UUID visitadorId
    ) {
        List<VisitaResponseDTO> visitas = visitaService.getUpcomingVisitasByVisitador(visitadorId);
        return ResponseEntity.ok(visitas);
    }

    @PutMapping("/{id}/transferir")
    public ResponseEntity<VisitaResponseDTO> transferirVisita(
            @PathVariable UUID id,
            @RequestBody TransferirVisitaDTO body
    ) {
        VisitaResponseDTO visita = visitaService.transferirVisita(id, body.novoVisitadorId());
        return ResponseEntity.ok(visita);
    }
}
