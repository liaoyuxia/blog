package com.linstudio.blog.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
        @Value("${ADMIN_USERNAME:admin}") String username,
        @Value("${ADMIN_PASSWORD:admin123456}") String password,
        PasswordEncoder passwordEncoder
    ) {
        return new InMemoryUserDetailsManager(
            User.withUsername(username)
                .password(passwordEncoder.encode(password))
                .roles("ADMIN")
                .build()
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .httpBasic(Customizer.withDefaults())
            .authorizeRequests()
            .antMatchers("/api/admin/**").hasRole("ADMIN")
            .antMatchers(HttpMethod.POST, "/api/messages").permitAll()
            .antMatchers(HttpMethod.POST, "/api/visits").permitAll()
            .antMatchers(HttpMethod.POST, "/api/posts/*/views").permitAll()
            .antMatchers(HttpMethod.POST, "/api/posts/*/likes").permitAll()
            .antMatchers(HttpMethod.DELETE, "/api/posts/*/likes").permitAll()
            .antMatchers(HttpMethod.POST, "/api/posts/*/comments").permitAll()
            .antMatchers(HttpMethod.GET, "/api/**").permitAll()
            .anyRequest().permitAll();

        return http.build();
    }
}
