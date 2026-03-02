package com.unimobili.api.domain.enums;

public enum UserRoles {
    ADMIN("admin"),
    ATENDENTE("atendente"),
    VISITADOR("visitador");

    private String role;

    UserRoles(String role) {
        this.role = role;
    }

    public String getRole() {
        return this.role;
    }
}
