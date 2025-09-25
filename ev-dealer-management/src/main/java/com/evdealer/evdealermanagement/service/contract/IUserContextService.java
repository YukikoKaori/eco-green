package com.evdealer.evdealermanagement.service.contract;

import java.util.Optional;

public interface IUserContextService {
    Optional<String> getCurrentUsername(); // từ SecurityContext

    Optional<Long> getCurrentUserId(); // map username -> account.id
}