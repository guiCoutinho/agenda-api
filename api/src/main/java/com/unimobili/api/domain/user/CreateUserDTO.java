package com.unimobili.api.domain.user;

import com.unimobili.api.domain.enums.UserRoles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserDTO(
        @NotBlank String login,
        @NotNull UserRoles role
) {}