<?php
require "../vendor/autoload.php";
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generate_jwt_refresh_token($user_id, $role_id,$expire_in_second=null){
        $config = require __DIR__ . '/../config/config.php';
    $secret = $config['refreshKey'];
    if(!$expire_in_second)
        $expire_in_second=$config["refresh_token_exp"];
    $issued_at=time();
    $expiration_time=$issued_at+$expire_in_second;
    $payload=[
        "iss"=>"localhost",
        "iat"=>$issued_at,
        "exp"=>$expiration_time,
        "data"=>[
            "user_id"=>$user_id,
            "role_id"=>$role_id
        ]
    ];
    return JWT::encode($payload, $secret, 'HS256');
}
function generate_jwt($user_id, $role_id, $expire_in_second = null){
        $config = require __DIR__ . '/../config/config.php';
    $secret = $config['key'];
        if(!$expire_in_second)
        $expire_in_second=$config["refresh_token_exp"];
    $issued_at=time();
    $expiration_time=$issued_at+$expire_in_second;
    $payload=[
        "iss"=>"localhost",
        "iat"=>$issued_at,
        "exp"=>$expiration_time,
        "data"=>[
            "user_id"=>$user_id,
            "role_id"=>$role_id
        ]
    ];
    return JWT::encode($payload, $secret, 'HS256');
}
function verifyToken($token,bool $isAccess) {
    $config = require __DIR__ . '/../config/config.php';
    if($isAccess){

        $secret = $config['key'];
    }else{
        $secret = $config['refreshKey'];

    }


    try {
        $decoded = JWT::decode($token, new Key($secret, 'HS256'));
        return (array) $decoded->data;
    } catch (Exception $e) {
        return false; // invalid or expired
    }
}
?>
