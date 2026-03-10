package com.unimobili.api.domain.user;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordDTO(
        @NotBlank String newPassword
) {}