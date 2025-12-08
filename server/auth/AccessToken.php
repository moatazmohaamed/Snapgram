<?php
include "../config/cors.php";
include "../config/connection.php";   
include "../helpers/response.php";
include "../helpers/verify.php";
if($_SERVER["REQUEST_METHOD"]=="GET"){
    $url=$_SERVER["REQUEST_URI"];
    $path=parse_url($url,PHP_URL_PATH);
    $routes=explode("/",trim($path,"/"));
    $token=end($routes)??null;
    if(!$token)
        respond(false, "NOT FOUND", null, 404);
    
    $checkRefreshToken=$connect->prepare("SELECT refresh_token from user where refresh_token=?");
    $checkRefreshToken->execute([$token]);
    if($checkRefreshToken->rowCount()==1) {
  
    $fetch=$checkRefreshToken->fetch();
    $data=verifyToken($fetch["refresh_token"],false);
    if(!$data)
    respond(false, "Invalid token", null, 401);
$newToken=generate_jwt($data["user_id"],$data["role_id"]);
    respond(true, "success", ["accessToken"=>$newToken], 200);

}
}else 
    respond(false, "Method Not Allowed", null, 405);

?>