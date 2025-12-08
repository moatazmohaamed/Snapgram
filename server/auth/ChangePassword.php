<?php
include "../config/cors.php";
include "../config/connection.php";   
include "../helpers/response.php";
include "../helpers/verify.php";
if($_SERVER["REQUEST_METHOD"]=="PATCH"){
$headers=getallheaders();
if(!isset($headers['Content-Type']) || $headers['Content-Type'] !== 'application/json')
    respond(false, "Invalid Header", null, 400);

$token=$headers["Authorization"]??null;
if(!$token)
    response(false, "Authorization token is required", null, 401);
$token=str_replace("Bearer ", "", $token);

    $data=verifyToken($token,true);
    if(!$data)
    respond(false, "Invalid token", null, 401);

$input=json_decode(file_get_contents("php://input"),true);

$password=trim($input["oldPassword"]??"");
$newPassword=trim($input["newPassword"]??"");
$confirmPassword=trim($input["confirmPassword"]??"");
if(!($password || $newPassword || $confirmPassword))
    respond(false, "Invalid Inputes", null, 400);
if($newPassword!=$confirmPassword)
    respond(false, "new password must match confirm password", null, 400);

$user=$connect->prepare("SELECT * from user where user_id=? and email_verified=?");
$user->execute([$data["user_id"],1]);
$fetch=$user->fetch();
if(!password_verify($password,$fetch["password"]))
     respond(false, " old password is wrong", null, 400);
$updateUser=$connect->prepare("UPDATE user set `password`=? where user_id=?");
$updateUserResult=$updateUser->execute([password_hash($newPassword, PASSWORD_BCRYPT),$data["user_id"]]);
if(!$updateUserResult)
    respond(false, "something error ".implode(", ", $updateUserResult->errorInfo()), null, 500);

    respond(false, " success ", null, 204);

}else
    respond(false, "Method Not Allowed", null, 405);

?>