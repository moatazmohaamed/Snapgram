<?php
include "../config/cors.php";
include "../config/connection.php";     
include "../helpers/response.php";  
include "../helpers/EmailSender.php";  
require '../vendor/autoload.php';
if($_SERVER["REQUEST_METHOD"]=="GET"){
    $email=trim($_GET["email"]??"");
    $checkEmail=$connect->prepare("SELECT * from user where email=?");
    $checkEmail->execute([$email]);
    if($checkEmail->rowCount()!=1)
        respond(false,"invalid email",null,400);
    $fetchData=$checkEmail->fetch();
    $expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));

$code= random_int(100000, 999999);
$verify= $connect->prepare("INSERT INTO email_verification (user_id, code, expires_at, created_at) VALUES (?, ?, ?, NOW())");
$verify->execute([$fetchData["user_id"], $code, $expires_at]);
if(!($verify->execute()))
      respond(false,"somthing error".implode(", ", $verify->errorInfo()),null,500);
    $msgResponse="email sent successfully";
$msgResponseFaild="failed to send email";
$subject='Verify Your Email';
    $body = '<h1>Password Reset Request</h1>
<p>Hello <b>' . $fetchData['username'] . '</b>,</p>
<p>We received a request to reset your password for your Snapgram account.</p><br>
<p>Your password reset code is:</p>
<h1>' . $code . '</h1>
<p>This code expires at ' . $expires_at . '.</p>
<br>
<p>If you did not request a password reset, please ignore this email.</p>
<br>
<p>Best regards,<br>Snapgram Team</p>';

SendEmail($email, $fetchData['username'] ,$subject,$body,$msgResponse,$msgResponseFaild,204,500);

}elseif($_SERVER["REQUEST_METHOD"]=="POST"){

    $input = file_get_contents("php://input");
$data = json_decode($input, true);

if (empty($data["email"]) || empty($data["code"])) {
    respond(false, "Email and code are required", null, 400);
}

$email = trim($data["email"]);
$code = trim($data["code"]);

$checkUser= $connect->prepare("SELECT user_id, email_verified FROM user WHERE email = ?");
$checkUser->execute([ $email]);

if ($checkUser->rowCount() === 0) {
    $checkUser->close();
    respond(false, "Email is not found", null, 404);
}
$user = $checkUser->fetch();

$user_id = $user['user_id'];


$checkCode= $connect->prepare("SELECT code, expires_at FROM email_verification WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$checkCode->execute( [$user_id]);

if ($checkCode->rowCount() === 0) {
    respond(false, "Verification code is not found. Please request a new one.", null, 404);
}

$verification = $checkCode->fetch();


if ($verification['code'] !== $code) {
    respond(false, "Invalid verification code", null, 400);
}

$current_time= date("Y-m-d H:i:s");
if ($current_time > $verification['expires_at']) {
    respond(false, "Verification code has expired. Please request a new one.", null, 400);
}


$deleteCode= $connect->prepare("DELETE FROM email_verification WHERE user_id = ?");
$deleteCode->execute( [$user_id]);

respond(true, "Email verified successfully", null, 200);

}elseif($_SERVER["REQUEST_METHOD"]=="PATCH"){


    $input = file_get_contents("php://input");
$data = json_decode($input, true);
$password=trim($data["Password"]??"");
$confirmPassword=trim($data["confirmPassword"]??"");
$email=trim($data["email"]??"");
if(!($password ||$email || $confirmPassword)) {
    respond(false, "email, password and confirmPassword are required", null, 400);
}elseif($password!=$confirmPassword){
     respond(false, "password and confirmPassword not match", null, 400);
}
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $updateToken=$connect->prepare("UPDATE user set `password`=? where email=?");
  $updateToken->execute([$hashedPassword,$data["email"]]);
     respond(true, "Your password has been changed successfully", null, 204);

}else
  respond(false, "Method Not Allowed", null, 405);

?>