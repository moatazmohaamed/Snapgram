<?php
include "../config/cors.php";
include "../config/connection.php";   
include "../helpers/response.php";
include "../helpers/verify.php";

if($_SERVER["REQUEST_METHOD"]=="POST"){
    $data=json_decode(file_get_contents("php://input"),true);
    $email=trim($data["email"]??'');
    $password=trim($data["password"]??'');
    
    if(!($email || $password)){
        respond(false, "invalid input", null, 400);
    }
    
    $checkEmail=$connect->prepare("SELECT * from user where email=?");
    $checkEmail->execute([$email]);
    
    if ($checkEmail->rowCount() !== 1) {
        respond(false, "invalid email or password", null, 400);
    }

    $fetch = $checkEmail->fetch(PDO::FETCH_ASSOC);
    
    if(!password_verify($password,$fetch["password"]))
         respond(false, "invalid email or password", null, 400);
         
    $updateToken=$connect->prepare("UPDATE user set refresh_token=? where user_id=?");
    $refreshToken=generate_jwt_refresh_token($fetch["user_id"],$fetch["role_id"]);
    $updateToken->execute([$refreshToken,$fetch["user_id"]]);
  
    if($updateToken->errorCode() !== '00000') {
         respond(false, "Failed to update token: ".implode(", ", $updateToken->errorInfo()), null, 500);
    }
         
    $token=generate_jwt($fetch["user_id"],$fetch["role_id"]);
    $data=["name"=>$fetch["username"],"role"=>$fetch["role_id"],"token"=>$token,"refreshToken"=>$refreshToken];
    respond(true, "success", $data, 200);

}else{
    respond(false, "Method Not Allowed", null, 405);
}
?>