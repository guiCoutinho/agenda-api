package com.unimobili.api.repositories;

import com.unimobili.api.domain.visita.Visita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VisitaRepository extends JpaRepository<Visita, UUID> {
}
