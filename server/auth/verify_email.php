<?php

include '../config/cors.php';
include '../config/connection.php';
include '../helpers/response.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($data["email"]) || empty($data["code"])) {
    respond(false, "Email and code are required", null, 400);
}

$email = trim($data["email"]);
$code = trim($data["code"]);

$checkUser = $connect->prepare("SELECT user_id, email_verified FROM user WHERE email = ?");
$checkUser->execute([$email]);

if ($checkUser->rowCount() === 0) {
    respond(false, "Email is not found", null, 404);
}

$user = $checkUser->fetch(PDO::FETCH_ASSOC);
$user_id = $user['user_id'];

if ($user['email_verified'] == 1) {
    respond(false, "Email already verified", null, 400);
}

$checkCode = $connect->prepare("SELECT code, expires_at FROM email_verification WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$checkCode->execute([$user_id]);

if ($checkCode->rowCount() === 0) {
    respond(false, "Verification code is not found. Please request a new one.", null, 404);
}

$verification = $checkCode->fetch(PDO::FETCH_ASSOC);

if ($verification['code'] !== $code) {
    respond(false, "Invalid verification code", null, 400);
}

$current_time = date("Y-m-d H:i:s");
if ($current_time > $verification['expires_at']) {
    respond(false, "Verification code has expired. Please request a new one.", null, 400);
}

try {
    // Start explicit transaction
    $connect->beginTransaction();
    
    // Update email_verified
    $updateUser = $connect->prepare("UPDATE user SET email_verified = 1 WHERE user_id = ?");
    $updateUser->execute([$user_id]);
    
    // Delete verification code
    $deleteCode = $connect->prepare("DELETE FROM email_verification WHERE user_id = ?");
    $deleteCode->execute([$user_id]);
    
    // Commit the transaction
    $connect->commit();
    
    // Verify the update worked
    $verifyUpdate = $connect->prepare("SELECT email_verified FROM user WHERE user_id = ?");
    $verifyUpdate->execute([$user_id]);
    $updatedUser = $verifyUpdate->fetch(PDO::FETCH_ASSOC);
    
    if ($updatedUser['email_verified'] != 1) {
        respond(false, "Email verification failed to persist. Current value: " . $updatedUser['email_verified'], null, 500);
    }
    
    respond(true, "Email verified successfully", null, 200);
    
} catch (PDOException $e) {
    // Rollback on error
    if ($connect->inTransaction()) {
        $connect->rollBack();
    }
    respond(false, "Database error: " . $e->getMessage(), null, 500);
}

?>