package com.unimobili.api.repositories;

import com.unimobili.api.domain.visita.Visita;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface VisitaRepository extends JpaRepository<Visita, UUID> {
    @Query("SELECT v FROM Visita v WHERE v.data_hora >= :currentDate")
    public Page<Visita> findUpcomingVisitas(@Param("currentDate")OffsetDateTime currentDate, Pageable pageable);
}
