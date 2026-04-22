package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.security.UserPrincipal;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.security.TokenProvider;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;

    // Simple login: match by email (no password needed for student project)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "No account found with that email"));
        }

        User user = userOpt.get();
        String token = tokenProvider.createToken(UserPrincipal.create(user));
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    // Login with email + name (auto-register if not found)
    @PostMapping("/login-or-register")
    public ResponseEntity<?> loginOrRegister(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name  = body.get("name");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
            .orElseGet(() -> {
                User newUser = User.builder()
                    .email(email.trim().toLowerCase())
                    .name(name != null ? name : email.split("@")[0])
                    .role(User.Role.STUDENT)
                    .provider("local")
                    .providerId("local-" + System.currentTimeMillis())
                    .build();
                return userRepository.save(newUser);
            });

        String token = tokenProvider.createToken(UserPrincipal.create(user));
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
        }
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));
        return ResponseEntity.ok(user);
    }
}
