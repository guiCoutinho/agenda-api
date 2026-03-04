package com.unimobili.api.controller;

import com.unimobili.api.domain.enums.UserRoles;
import com.unimobili.api.domain.user.User;
import com.unimobili.api.domain.user.UserListDTO;
import com.unimobili.api.domain.user.UserMeDTO;
import com.unimobili.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/visitadores")
    public ResponseEntity<List<UserListDTO>> listVisitadores() {
        List<UserListDTO> users = userRepository
                .findByRoleOrderByLoginAsc(UserRoles.VISITADOR)
                .stream()
                .map(u -> new UserListDTO(u.getId(), u.getLogin(), u.getRole()))
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeDTO> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserMeDTO(user.getId(), user.getLogin(), user.getRole()));
    }
}