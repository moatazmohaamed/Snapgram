<?php
require '../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function SendEmail($email,$username,$subject,$body,$msgResponse,$msgResponseFaild,$successCode,$faildCode){
    $mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'farahyasser2904@gmail.com';
    $mail->Password = 'dcpd wsos wivx qrdk';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('farahyasser2904@gmail.com', 'Snapgram Team');
    $mail->addAddress($email, $username);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $body;

    if($mail->send()) {
        respond(true, $msgResponse, null, $successCode);
    } else {
        respond(true, $msgResponseFaild, null, $faildCode);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Email Verification error: " . $verify->error
    ]);
}
}
?>