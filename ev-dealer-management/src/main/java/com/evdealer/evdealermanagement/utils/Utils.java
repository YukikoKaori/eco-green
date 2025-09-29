package com.evdealer.evdealermanagement.utils;

import java.util.Random;
import java.util.regex.Pattern;

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

    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return email != null && pattern.matcher(email).matches();
    }
}
