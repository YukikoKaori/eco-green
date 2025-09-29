package com.evdealer.evdealermanagement.utils;

import lombok.experimental.UtilityClass;
import java.util.Random;
import java.util.regex.Pattern;

import java.util.regex.Pattern;

@UtilityClass
public class Utils {
    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return email != null && pattern.matcher(email).matches();
    }
}
