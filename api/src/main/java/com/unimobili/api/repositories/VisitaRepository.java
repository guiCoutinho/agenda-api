package com.unimobili.api.repositories;

import com.unimobili.api.domain.visita.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface VisitaRepository extends JpaRepository<Visita, UUID> {
    @Query("""
    SELECT v
    FROM Visita v
    WHERE v.data_hora >= :currentDate
      AND v.ativa = true
    ORDER BY v.data_hora ASC
""")
    List<Visita> findUpcomingVisitas(@Param("currentDate") OffsetDateTime currentDate);

    @Query(value = """
    SELECT EXISTS (
      SELECT 1
      FROM visita v
      WHERE v.ativa = true
        AND v.designado_a_id = :visitadorId
        AND tstzrange(v.data_hora, v.data_hora_fim, '[)') &&
            tstzrange(:inicio, :fim, '[)')
    )
    """, nativeQuery = true)
    boolean existsOverlappingVisit(
            @Param("visitadorId") UUID visitadorId,
            @Param("inicio") OffsetDateTime inicio,
            @Param("fim") OffsetDateTime fim
    );

    @Query("""
    SELECT v
    FROM Visita v
    WHERE v.data_hora >= :currentDate
      AND v.designadoA.id = :visitadorId
      AND v.ativa = true
    ORDER BY v.data_hora ASC
""")
    List<Visita> findUpcomingVisitasByVisitador(
            @Param("visitadorId") UUID visitadorId,
            @Param("currentDate") OffsetDateTime currentDate
    );
    @Query(value = """
    SELECT EXISTS (
      SELECT 1
      FROM visita v
      WHERE v.ativa = true
        AND v.designado_a_id = :visitadorId
        AND v.id != :excludeId
        AND tstzrange(v.data_hora, v.data_hora_fim, '[)') &&
            tstzrange(:inicio, :fim, '[)')
    )
    """, nativeQuery = true)
    boolean existsOverlappingVisitExcluding(
            @Param("visitadorId") UUID visitadorId,
            @Param("inicio") OffsetDateTime inicio,
            @Param("fim") OffsetDateTime fim,
            @Param("excludeId") UUID excludeId
    );
}
