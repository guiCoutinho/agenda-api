package com.unimobili.api.controller;

import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.domain.visita.VisitaResponseDTO;
import com.unimobili.api.services.VisitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

}
