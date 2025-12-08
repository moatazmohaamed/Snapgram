<?php

function respond($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    header("Content-Type: application/json; charset=UTF-8");
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    if (!is_null($data)) {
        $response['data'] = $data;
    
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

?>