<?php
declare(strict_types=1);

// -------------------------------------------------------
// Sem napiš svůj firemní e-mail na Endoře
// -------------------------------------------------------
const RECIPIENT = 'info@pagecraft.cz';
const SUBJECT   = '🟥🟥🟥Nová zpráva z webu PageCraft.cz🟥🟥🟥';
// -------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// Pouze POST požadavky
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Nepodporovaná metoda.']);
    exit;
}

// Načteme a sanitizujeme vstup
$jmeno   = trim(strip_tags($_POST['jmeno']   ?? ''));
$prijmeni = trim(strip_tags($_POST['prijmeni'] ?? ''));
$email   = trim($_POST['email']   ?? '');
$zprava  = trim(strip_tags($_POST['zprava']  ?? ''));

// Validace
if ($jmeno === '' || $prijmeni === '' || $email === '' || $zprava === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Vyplňte prosím všechna pole.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Neplatná e-mailová adresa.']);
    exit;
}

// Ochrana proti header injection
$jmeno    = preg_replace('/[\r\n]/', '', $jmeno);
$prijmeni = preg_replace('/[\r\n]/', '', $prijmeni);
$email    = preg_replace('/[\r\n]/', '', $email);
$jmeno_full = $jmeno . ' ' . $prijmeni;

// Sestavení e-mailu
$body = "Nová zpráva z kontaktního formuláře:\n\n"
      . "Jméno:   {$jmeno_full}\n"
      . "E-mail:  {$email}\n"
      . "Zpráva:\n{$zprava}\n";

$headers  = "From: noreply@pagecraft.cz\r\n";
$headers .= "Reply-To: {$jmeno_full} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

$sent = mail(RECIPIENT, SUBJECT, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true, 'message' => '✓ Zpráva odeslána! Ozveme se vám do 24 hodin.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.']);
}
