<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// API base URL
$baseUrl = "https://web.bookna.com/v1/locations?company_id=3";

// Build URL based on query parameter
if (isset($_GET['destination'])) {
    $destination = urlencode($_GET['destination']);
    $url = "$baseUrl&destination=$destination";
} else {
    $url = $baseUrl;
}

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Set headers
$headers = [
    'Authorization: Bearer d47f31e7a64f49eab229d0e3c9396fe92c1cf10b16798e6c6784cf1684fa2e33',
    'Content-Type: application/json',
    'Accept: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute request
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode([
        'error' => true,
        'message' => 'Request Error: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo $response;
} else {
    echo json_encode([
        'error' => true,
        'status' => $httpCode,
        'message' => 'Failed to fetch data from API'
    ]);
}
