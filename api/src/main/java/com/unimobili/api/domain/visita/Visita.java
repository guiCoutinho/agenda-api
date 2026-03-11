package com.unimobili.api.domain.visita;

import com.unimobili.api.domain.enums.StatusVisita;
import com.unimobili.api.domain.user.User;
import jakarta.persistence.*;
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

    @ManyToOne(optional = false)
    @JoinColumn(name = "criado_por_id")
    private User criadoPor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "designado_a_id")
    private User designadoA;

    private String nome_cliente;
    private String telefone_cliente;
    private String chaves;
    private String observacoes;

    @Enumerated(EnumType.STRING)
    private StatusVisita status;

    private Boolean ativa;

    private Integer duracao_minutos;
    private OffsetDateTime data_hora_fim;

    // Endereço do imóvel (campo livre)
    private String endereco_imovel;
}