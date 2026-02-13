package com.unimobili.api.controller;

import com.unimobili.api.domain.visita.Visita;
import com.unimobili.api.domain.visita.VisitaRequestDTO;
import com.unimobili.api.services.VisitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/visita")
public class VisitaController {

    @Autowired
    private VisitaService visitaService;

    public ResponseEntity<Visita> create(@RequestBody VisitaRequestDTO body) {
        Visita novaVisita = this.visitaService.createVisita(body);
        return ResponseEntity.ok(novaVisita);
    }

}
