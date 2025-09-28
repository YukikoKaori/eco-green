package com.evdealer.evdealermanagement.utils;

import java.util.Random;

public class Utils {

    public static String generateUsernameFromName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            fullName = "user";
        }
        String base = fullName.trim().toLowerCase().replaceAll("\\s+", "");

        // random 4 chữ số
        int randomNum = new Random().nextInt(9000) + 1000;
        return base + randomNum;
    }
}
