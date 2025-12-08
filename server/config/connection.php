<?php
date_default_timezone_set("Africa/Cairo");


header("Content-Type: application/json;");

$localhost = "localhost";     
$username  = "root";          
$password  = "";               
$database  = "snapgram";   

try {
    $connect = new PDO("mysql:host=$localhost;dbname=$database;charset=utf8mb4", $username, $password);
    $connect->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

?>
