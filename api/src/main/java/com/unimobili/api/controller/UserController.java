package com.unimobili.api.controller;

import com.unimobili.api.domain.enums.UserRoles;
import com.unimobili.api.domain.user.*;
import com.unimobili.api.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        return ResponseEntity.ok(
                new UserMeDTO(
                        user.getId(),
                        user.getLogin(),
                        user.getRole(),
                        user.getMustChangePassword()
                )
        );
    }

    @PostMapping
    public ResponseEntity createUser(@RequestBody @Valid CreateUserDTO data) {
        if (userRepository.findByLogin(data.login()) != null) {
            return ResponseEntity.badRequest().body("Login já existe.");
        }

        String encryptedPassword = passwordEncoder.encode("123");

        User newUser = new User(
                data.login(),
                encryptedPassword,
                data.role(),
                true
        );

        userRepository.save(newUser);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity changeMyPassword(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid ChangePasswordDTO data
    ) {
        user.setPassword(passwordEncoder.encode(data.newPassword()));
        user.setMustChangePassword(false);

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}