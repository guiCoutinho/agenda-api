package com.unimobili.api.domain.user;

import com.unimobili.api.domain.enums.UserRoles;
import java.util.UUID;

public record UserMeDTO(UUID id, String login, UserRoles role) {}