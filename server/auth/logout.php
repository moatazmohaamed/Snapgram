<?php 
include "../config/cors.php";
include "../config/connection.php";   
include "../helpers/response.php";
include "../helpers/verify.php"; 
if($_SERVER["REQUEST_METHOD"]=="DELETE"){
    $headers=getallheaders();
    $token=$headers["Authorization"]??null;

if (!$token) {
    respond(false, "Authorization token is required", null, 401);
}
$token=str_replace("Bearer ", "", $token);
$data=verifyToken($token,true);
if(!$data)
    respond(false, "Invalid token", null, 401);

$deleteRefreshToken=$connect->prepare("UPDATE user set refresh_token=? where user_id=?");
 $deleteRefreshToken->execute([null,$data["user_id"]]);
    if($deleteRefreshToken->rowCount()!=1)
     respond(false, "faild update", null, 500);
respond(true, "success", null, 204);
}else
    respond(false, "Method Not Allowed", null, 405);
?>