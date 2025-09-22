package com.evdealer.evdealermanagement.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common errors
    SUCCESS(200, "OK"),
    BAD_REQUEST(400, "Bad request"),
    UNAUTHORIZED(401, "Invalid or expired token"),
    FORBIDDEN(403, "You do not have permission to access this resource"),
    USER_NOT_FOUND(404, "User not found"),
    RESOURCE_NOT_FOUND(4041, "Requested resource not found"),
    INTERNAL_ERROR(500, "Internal server error"),
    SERVICE_UNAVAILABLE(503, "Service temporarily unavailable"),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error"),

    // Login errors
    INVALID_CREDENTIALS(1001, "Invalid username or password"),
    ACCOUNT_LOCKED(1002, "Your account has been locked"),
    ACCOUNT_INACTIVE(1003, "Your account is not activated"),
    TOO_MANY_ATTEMPTS(1004, "Too many failed login attempts. Please try again later"),

    // Register errors
    USERNAME_ALREADY_EXISTS(1101, "Username is already taken"),
    EMAIL_ALREADY_EXISTS(1102, "Email is already registered"),
    WEAK_PASSWORD(1103, "Password does not meet security requirements"),
    PASSWORDS_DO_NOT_MATCH(1104, "Passwords do not match"),

    // Validation errors
    INVALID_INPUT(1201, "Invalid input data"),
    MISSING_REQUIRED_FIELD(1202, "Missing required field"),
    INVALID_FORMAT(1203, "Invalid data format"),
    OUT_OF_RANGE(1204, "Value is out of allowed range"),
    PASSWORD_TOO_SHORT(1105, "Password must be at least 6 characters"),


    // Security / Token
    INVALID_KEY(1301, "Invalid message key"),
    TOKEN_EXPIRED(1302, "Token has expired"),
    TOKEN_INVALID(1303, "Token is invalid"),
    TOKEN_MISSING(1304, "Token is missing"),

    // File / Upload
    FILE_TOO_LARGE(1401, "Uploaded file is too large"),
    UNSUPPORTED_FILE_TYPE(1402, "Unsupported file type"),
    FILE_UPLOAD_FAILED(1403, "File upload failed"),

    // Payment / Transaction (nếu hệ thống có)
    PAYMENT_FAILED(1501, "Payment processing failed"),
    INSUFFICIENT_FUNDS(1502, "Insufficient balance"),
    TRANSACTION_DECLINED(1503, "Transaction was declined");

    private int code;
    private String message;
}
