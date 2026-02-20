package com.unimobili.api.domain.visita;

import com.unimobili.api.domain.enums.StatusVisita;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Table(name = "visita")
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Visita {
    @Id
    @GeneratedValue
    private UUID id;

    private OffsetDateTime criado_em;

    private OffsetDateTime data_hora;

    private String criado_por;

    private String designado_a;

    private String nome_cliente;

    private String telefone_cliente;

    private String chaves;

    private String observacoes;

    private StatusVisita status;

    private Boolean ativa;
}
