package com.example.pensamientoComputacional.security;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<String> permissionNames = user.getRoles().stream()
            .flatMap((Role role) -> role.getPermissions().stream())
            .map(Permission::getName)
            .collect(Collectors.toSet());

        // Also include ROLE_ authorities for roles
        Set<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toSet());

        authorities.addAll(permissionNames.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toSet()));
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive());
    }

    public User getDomainUser() {
        return user;
    }
}


