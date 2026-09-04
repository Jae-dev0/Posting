<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/bookna-booking-flow.php';
require_once __DIR__ . '/includes/bookna-url.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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

$message = isset($input['message']) ? trim((string) $input['message']) : '';
$session = isset($input['session']) ? trim((string) $input['session']) : '';
$bookingContext = isset($input['booking_context']) && is_array($input['booking_context'])
    ? $input['booking_context']
    : [];

if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => true, 'message' => 'Message is required']);
    exit;
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$bookingApiUrl = $scheme . '://' . $host . '/bookna-api.php';

$bookingContext = bookna_booking_normalize_context($bookingContext);
$submittedSeatMode = (string) ($bookingContext['seat_mode'] ?? 'departure');
$sync = bookna_booking_sync_context($message, $bookingContext);
$bookingContext = $sync['context'];
$isDetailsSubmit = ($message === '__submit_booking_details__');
$isSeatsSubmit = ($message === '__submit_seats__');
$detailsSubmitReady = $isDetailsSubmit && ($bookingContext['booking_step'] ?? '') === 'confirm';
$seatsSubmitReady = $isSeatsSubmit && in_array(
    (string) ($bookingContext['booking_step'] ?? ''),
    ['contact', 'return_schedule', 'return_seats'],
    true
);

$action = bookna_booking_handle_action($message, $bookingContext);
if ($action['handled']) {
    $response = [
        'reply' => $action['reply'],
        'schedules' => $action['schedules'],
        'schedule_message' => '',
        'booking_context' => $action['context'],
        'quick_actions' => [],
        'system' => 'genesis',
        'sanitized' => false,
        'booking_api_url' => $bookingApiUrl,
        'booking_trips_url' => bookna_build_trips_url($action['context']),
        'search_params' => bookna_normalize_trips_params($action['context']),
    ];

    if ($session !== '') {
        $response['session'] = $session;
    }

    if ($action['checkout'] !== null) {
        $response['checkout'] = $action['checkout'];
    }

    echo json_encode($response);
    exit;
}

$schedules = bookna_booking_fetch_schedules($sync['schedule_fetch'], $bookingContext);

if ($schedules === [] && $sync['schedule_fetch'] === null) {
    $wantsSchedules = bookna_should_search_schedules($bookingContext, $message, '');

    if ($wantsSchedules && bookna_booking_has_route_ready($bookingContext)) {
        if (trim((string) ($bookingContext['departure_schedule_id'] ?? '')) === '') {
            bookna_booking_ensure_departure_schedule_search($bookingContext);
        }

        $search = bookna_search_schedules([
            'origin' => $bookingContext['origin'] ?? '',
            'destination' => $bookingContext['destination'] ?? '',
            'departure_date' => $bookingContext['departure_date'] ?? '',
            'passengers' => $bookingContext['passengers'] ?? 1,
            'return_date' => $bookingContext['return_date'] ?? '',
            'trip_type' => $bookingContext['trip_type'] ?? '',
        ]);
        $schedules = $search['schedules'];
    }
}

$aiMessage = $message;
if ($detailsSubmitReady) {
    $aiMessage = bookna_booking_details_submit_message($bookingContext);
} elseif ($seatsSubmitReady) {
    $selected = $submittedSeatMode === 'return'
        ? bookna_booking_normalize_seat_list($bookingContext['return_seats'] ?? [])
        : bookna_booking_normalize_seat_list($bookingContext['departure_seats'] ?? []);
    $nextHint = ($sync['append_booking_form'] ?? false)
        ? 'Next step is the booking form for contact and passenger names. Do not ask for passenger count or seats again.'
        : 'Continue the booking. Do not invent seats.';
    $aiMessage = 'I selected my '
        . ($submittedSeatMode === 'return' ? 'return' : 'departure')
        . ' seats through the seat map: '
        . implode(', ', $selected)
        . '. Passenger count is already '
        . max(1, (int) ($bookingContext['passengers'] ?? 1))
        . '. '
        . $nextHint;
}

$payload = [
    'message' => $aiMessage,
    'booking_api_url' => $bookingApiUrl,
    'booking_trips_url' => bookna_build_trips_url($bookingContext),
    'booking_context' => $bookingContext,
    'booking_state' => bookna_booking_state_summary($bookingContext),
];

if ($session !== '') {
    $payload['session'] = $session;
}

$data = [
    'reply' => '',
    'system' => 'genesis',
    'sanitized' => false,
];

$ch = curl_init('https://ai.jaclinerapps.com/genesis/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_INVALID_UTF8_SUBSTITUTE),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer elia_mqG18y4thg4XFRn1LU4NhIncfPcFL0a9pPzUdGVi01o',
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_TIMEOUT => 60,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_errno($ch) ? curl_error($ch) : '';
curl_close($ch);

if ($response !== false && $response !== '') {
    $decoded = json_decode($response, true);
    if (is_array($decoded)) {
        $data = array_merge($data, $decoded);
    }
}

if (trim((string) ($data['reply'] ?? '')) === '') {
    if ($detailsSubmitReady) {
        $data['reply'] = bookna_booking_confirm_prompt($bookingContext)['reply'];
    } elseif ($seatsSubmitReady && ($sync['append_booking_form'] ?? false)) {
        $data['reply'] = 'Salamat, ka-G! Nakuha ko na ang seat selection ninyo.'
            . "\n\nI-click ang [booking form](booking:details) para ilagay ang contact at passenger details.";
    } elseif (($sync['append_seat_map'] ?? false) || in_array(($bookingContext['booking_step'] ?? ''), ['departure_seats', 'return_seats'], true)) {
        $data['reply'] = 'Sige po, ka-G! Pumili na po ng seat sa seat map.';
    } elseif ($schedules !== []) {
        $data['reply'] = 'Ito ang mga available trips, ka-G! Pumili na lang po ng pinaka-swak na oras sa listahan.';
    } elseif ($curlError !== '') {
        $data['reply'] = 'Pasensya na po, ka-G — may issue sa assistant ko ngayon. Paki-try ulit in a moment.';
    } else {
        $data['reply'] = 'Hi ka-G! Paano kita matutulungan sa trip mo ngayon?';
    }
}

if ($detailsSubmitReady) {
    $confirmReply = bookna_booking_confirm_prompt($bookingContext)['reply'];
    $aiReply = trim((string) ($data['reply'] ?? ''));
    if (
        $aiReply === ''
        || preg_match('/contact information|email address|phone number|mobile number|full name|passenger details|one by one/i', $aiReply)
    ) {
        $data['reply'] = 'Salamat, ka-G! Nakuha ko na ang details mo mula sa booking form.' . "\n\n" . $confirmReply;
    }
} elseif ($isDetailsSubmit) {
    $data['reply'] = 'Sorry, ka-G — may kulang pa sa booking form. Paki-check ang email, mobile number, at passenger names, then submit ulit.';
} elseif ($isSeatsSubmit && !$seatsSubmitReady) {
    $data['reply'] = 'Sorry, ka-G — kulang pa ang selected seats. Paki-click ang seat map at pumili ulit.';
} elseif ($seatsSubmitReady && ($sync['append_booking_form'] ?? false)) {
    $aiReply = trim((string) ($data['reply'] ?? ''));
    if (preg_match('/how many passengers|ilang pasahero|passenger count|select.*(seat|upuan)|anong seat/i', $aiReply)) {
        $selected = $submittedSeatMode === 'return'
            ? bookna_booking_normalize_seat_list($bookingContext['return_seats'] ?? [])
            : bookna_booking_normalize_seat_list($bookingContext['departure_seats'] ?? []);
        $data['reply'] = 'Salamat, ka-G! Nakuha ko na ang seat selection ninyo ('
            . implode(', ', $selected)
            . ").\n\nI-click ang [booking form](booking:details) para ilagay ang contact at passenger details.";
    }
} elseif (($sync['append_seat_map'] ?? false) || in_array(($bookingContext['booking_step'] ?? ''), ['departure_seats', 'return_seats'], true)) {
    $tripLabel = (($bookingContext['seat_mode'] ?? 'departure') === 'return')
        ? trim((string) ($bookingContext['return_schedule_label'] ?? 'return trip'))
        : trim((string) ($bookingContext['departure_schedule_label'] ?? 'selected trip'));
    $needed = max(1, (int) ($bookingContext['passengers'] ?? 1));
    $seatLabel = (($bookingContext['seat_mode'] ?? 'departure') === 'return') ? 'return seats' : 'seat map';
    $data['reply'] = 'Noted, ka-G! Napili ninyo ang **' . $tripLabel . '**.'
        . "\n\nPaki-click ang [" . $seatLabel . '](seats:select) para pumili ng **'
        . $needed . ' seat' . ($needed > 1 ? 's' : '')
        . '**.';
}

if ($schedules === [] && bookna_should_search_schedules($bookingContext, $message, (string) ($data['reply'] ?? ''))) {
    if (bookna_booking_has_route_ready($bookingContext) && trim((string) ($bookingContext['departure_schedule_id'] ?? '')) === '') {
        bookna_booking_ensure_departure_schedule_search($bookingContext);
        $search = bookna_search_schedules([
            'origin' => $bookingContext['origin'] ?? '',
            'destination' => $bookingContext['destination'] ?? '',
            'departure_date' => $bookingContext['departure_date'] ?? '',
            'passengers' => $bookingContext['passengers'] ?? 1,
            'return_date' => $bookingContext['return_date'] ?? '',
            'trip_type' => $bookingContext['trip_type'] ?? '',
        ]);
        $schedules = $search['schedules'];
    }
}

$seatMap = null;
$seatScheduleId = '';
if (($bookingContext['seat_mode'] ?? 'departure') === 'return') {
    $seatScheduleId = (string) ($bookingContext['return_schedule_id'] ?? '');
} else {
    $seatScheduleId = (string) ($bookingContext['departure_schedule_id'] ?? '');
}
if (
    (($sync['append_seat_map'] ?? false) || in_array(($bookingContext['booking_step'] ?? ''), ['departure_seats', 'return_seats'], true))
    && $seatScheduleId !== ''
) {
    $seatMap = bookna_booking_fetch_seat_map($seatScheduleId);
}

$data['reply'] = bookna_booking_append_links(
    (string) ($data['reply'] ?? ''),
    $bookingContext,
    $schedules,
    (bool) ($sync['append_booking_form'] ?? false),
    (bool) ($sync['append_seat_map'] ?? false)
);
$data['schedules'] = $schedules;
$data['schedule_message'] = $schedules !== [] ? 'Schedules loaded.' : '';
$data['seat_map'] = $seatMap;
$data['booking_context'] = $bookingContext;
$data['booking_api_url'] = $bookingApiUrl;
$data['booking_trips_url'] = bookna_build_trips_url($bookingContext);
$data['search_params'] = bookna_normalize_trips_params($bookingContext);
$data['quick_actions'] = [];

if ($session !== '' && !isset($data['session'])) {
    $data['session'] = $session;
}

$encoded = json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE);
if ($encoded === false) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Failed to encode chat response']);
    exit;
}

http_response_code(200);
echo $encoded;
