<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/bookna-client.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => true, 'message' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');

$query = [];
if (isset($_GET['destination']) && trim((string) $_GET['destination']) !== '') {
    $query['destination'] = trim((string) $_GET['destination']);
}

$result = bookna_request('GET', 'locations', $query);
http_response_code($result['status']);
echo json_encode($result['body']);
