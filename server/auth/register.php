<?php

include "../config/cors.php";
include "../config/connection.php";         
include "../helpers/response.php";  
include "../helpers/EmailSender.php";  
require '../vendor/autoload.php';


$input = file_get_contents("php://input");
$data = json_decode($input, true);


if (empty($data["username"]) || empty($data["email"]) || empty($data["password"])) {
    respond(false, "All fields are required", null, 400);
}

$username = trim($data["username"]);
$email = trim($data["email"]);
$password = $data["password"];
$image = isset($data["image"]) ? trim($data["image"]) : null;
$bio = isset($data["bio"]) ? trim($data["bio"]) : null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, "Invalid email format", null, 400);
}

$checkUsername = $connect->prepare("SELECT user_id FROM user WHERE username = ?");
$checkUsername->execute([$username]);
if ($checkUsername->rowCount() > 0) {
    respond(false, "Username already exists", null, 400);
}

$checkEmail = $connect->prepare("SELECT user_id FROM user WHERE email = ?");
$checkEmail->execute([$email]);
if ($checkEmail->rowCount() > 0) {
    respond(false, "Email already registered", null, 400);
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$insert = $connect->prepare("INSERT INTO user (username, email, password, image, bio, join_date, email_verified) VALUES (?, ?, ?, ?, ?, NOW(), 0)");
$insert->execute([$username, $email, $hashedPassword, $image, $bio]);

if ($insert->rowCount() !== 1) {
    respond(false, "Insertion error: " . implode(", ", $insert->errorInfo()), null, 500);
}

$user_id = $connect->lastInsertId();

$code = random_int(100000, 999999);
$expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));
$delete = $connect->prepare("DELETE FROM email_verification WHERE user_id = ?");
$delete->execute([$user_id]);

$verify = $connect->prepare("INSERT INTO email_verification (user_id, code, expires_at, created_at) VALUES (?, ?, ?, NOW())");
$verify->execute([$user_id, $code, $expires_at]);

if ($verify->rowCount() !== 1) {
    respond(false, "Verification error: " . implode(", ", $verify->errorInfo()), null, 500);
}

$msgResponse = "User registered successfully and Verification email sent";
$msgResponseFaild = "User registered successfully but failed to send verification email";
$subject = 'Verify Your Email';
$body = '<h1>Welcome ' . $username . '!</h1>
    <p>Thank you for registering at <b>Snapgram</b>. We are excited to have you on board!</p><br>
    <p>Your verification code is:</p>
    <h1>' . $code . '</h1>
    <p>This code expires at ' . $expires_at . '.</p>
    <br>
    <p>Best regards,<br>Snapgram Team</p>';

SendEmail($email, $username, $subject, $body, $msgResponse, $msgResponseFaild, 201, 201);

?>