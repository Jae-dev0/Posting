<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/bookna-client.php';
require_once __DIR__ . '/includes/bookna-schedules.php';
require_once __DIR__ . '/includes/bookna-url.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = isset($_GET['action']) ? trim((string) $_GET['action']) : '';

if ($action === '') {
    http_response_code(400);
    echo json_encode([
        'error' => true,
        'message' => 'Missing action parameter',
        'actions' => [
            'locations',
            'search-schedules',
            'parse-trips-url',
            'get-schedule',
            'create-checkout',
            'get-transaction',
        ],
    ]);
    exit;
}

switch ($action) {
    case 'locations':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $query = [];
        if (isset($_GET['destination']) && trim((string) $_GET['destination']) !== '') {
            $query['destination'] = trim((string) $_GET['destination']);
        }
        $result = bookna_request('GET', 'locations', $query);
        break;

    case 'search-schedules':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $searchInput = $_GET;
        if (isset($_GET['trips_url']) && trim((string) $_GET['trips_url']) !== '') {
            $searchInput = array_merge(bookna_parse_trips_url((string) $_GET['trips_url']), $_GET);
        }

        $normalized = bookna_normalize_trips_params($searchInput);
        if (
            trim((string) ($normalized['origin'] ?? '')) === ''
            || trim((string) ($normalized['destination'] ?? '')) === ''
            || trim((string) ($normalized['departure_date'] ?? '')) === ''
        ) {
            http_response_code(400);
            echo json_encode([
                'error' => true,
                'message' => 'Missing or invalid fields',
                'details' => 'Use origin/destination/departure_date or BookNa params ori/des/dep (e.g. ori=CUBAO&des=BAGUIO&dep=2026-09-03). Locations with parentheses use asterisk in URLs (MANILA*PITX).',
            ]);
            exit;
        }

        $search = bookna_search_schedules($normalized);

        http_response_code($search['ok'] ? 200 : 503);
        echo json_encode([
            'success' => $search['ok'],
            'schedules' => $search['schedules'],
            'message' => $search['message'],
            'trips_url' => bookna_build_trips_url($normalized),
            'search_params' => $normalized,
        ]);
        exit;

    case 'parse-trips-url':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $tripsUrl = isset($_GET['url']) ? trim((string) $_GET['url']) : '';
        if ($tripsUrl === '') {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Missing url parameter']);
            exit;
        }

        $normalized = bookna_parse_trips_url($tripsUrl);
        echo json_encode([
            'success' => true,
            'trips_url' => bookna_build_trips_url($normalized),
            'search_params' => $normalized,
        ]);
        exit;

    case 'get-schedule':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $scheduleId = isset($_GET['schedule_id']) ? trim((string) $_GET['schedule_id']) : '';
        if ($scheduleId === '') {
            http_response_code(400);
            echo json_encode([
                'error' => true,
                'message' => 'Missing or invalid schedule_id',
            ]);
            exit;
        }

        $result = bookna_request('GET', 'get-schedule', ['schedule_id' => $scheduleId]);
        break;

    case 'create-checkout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Invalid JSON body']);
            exit;
        }

        $result = bookna_request('POST', 'create-checkout', null, $input);
        if (is_array($result['body'])) {
            $result['body'] = bookna_normalize_checkout_body($result['body']);
        }
        break;

    case 'get-transaction':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            exit;
        }

        $transactionId = isset($_GET['transaction_id']) ? trim((string) $_GET['transaction_id']) : '';
        if ($transactionId === '') {
            http_response_code(400);
            echo json_encode([
                'error' => true,
                'message' => 'Missing or invalid fields',
                'details' => 'transaction_id is required and must be valid.',
            ]);
            exit;
        }

        $result = bookna_request('GET', 'get-transaction', ['transaction_id' => $transactionId]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Unknown action']);
        exit;
}

http_response_code($result['status']);
echo json_encode($result['body']);
