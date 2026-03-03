package com.unimobili.api.domain.user;

import com.unimobili.api.domain.enums.UserRoles;

import java.util.UUID;

public record UserListDTO(
        UUID id,
        String login,
        UserRoles role
) {}
