package com.unimobili.api.domain.user;

import com.unimobili.api.domain.enums.UserRoles;

public record RegisterDTO(String login, String password, UserRoles role) {
}
