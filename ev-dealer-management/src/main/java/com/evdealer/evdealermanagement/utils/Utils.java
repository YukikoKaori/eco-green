package com.evdealer.evdealermanagement.utils;

<<<<<<< HEAD
import lombok.experimental.UtilityClass;
=======
import java.util.Random;
import java.util.regex.Pattern;
>>>>>>> 66243ee49930fd8bc4a6cfab25b7f7f7235d3e02

import java.util.regex.Pattern;

@UtilityClass
public class Utils {
    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return email != null && pattern.matcher(email).matches();
    }

    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return email != null && pattern.matcher(email).matches();
    }
}
