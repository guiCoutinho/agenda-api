package com.unimobili.api.repositories;

import com.unimobili.api.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import com.unimobili.api.domain.enums.UserRoles;
import java.util.List;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    UserDetails findByLogin(String login);
    List<User> findByRoleOrderByLoginAsc(UserRoles role);
    List<User> findAllByOrderByLoginAsc();
}
