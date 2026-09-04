<?php

declare(strict_types=1);

require_once __DIR__ . '/bookna-client.php';
require_once __DIR__ . '/bookna-url.php';

/**
 * @return array{ok: bool, status: int, body: mixed}
 */
function bookna_serverpod_call(string $method, array $params = []): array
{
    $url = rtrim(BOOKNA_SERVERPOD_API, '/') . '/' . ltrim($method, '/');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($params === [] ? new stdClass() : $params),
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'ok' => false,
            'status' => 502,
            'body' => ['error' => true, 'message' => 'Request Error: ' . $error],
        ];
    }

    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $decoded = json_decode($response !== false ? $response : '', true);
    if ($decoded === null && ($response === '[]' || $response === '')) {
        $decoded = [];
    }

    if ($decoded === null) {
        return [
            'ok' => false,
            'status' => $status ?: 500,
            'body' => ['error' => true, 'message' => 'Invalid JSON response from schedule API'],
        ];
    }

    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status ?: 500,
        'body' => $decoded,
    ];
}

/**
 * @return array<int, array<string, mixed>>
 */
function bookna_get_route_ids(string $origin, string $destination, bool $preferCompany = true): array
{
    $result = bookna_serverpod_call('getRoutes');
    if (!$result['ok'] || !is_array($result['body'])) {
        return [];
    }

    $originKey = strtoupper(trim($origin));
    $destinationKey = strtoupper(trim($destination));
    $routeIds = [];

    foreach ($result['body'] as $route) {
        if (!is_array($route) || !isset($route['id'])) {
            continue;
        }

        $routeOrigin = strtoupper(trim((string) ($route['origin'] ?? '')));
        $routeDestination = strtoupper(trim((string) ($route['destination'] ?? '')));

        if ($routeOrigin !== $originKey || $routeDestination !== $destinationKey) {
            continue;
        }

        if (!empty($route['cancelled'])) {
            continue;
        }

        if (
            $preferCompany
            && defined('BOOKNA_COMPANY_ID')
            && isset($route['company'])
            && (int) $route['company'] !== BOOKNA_COMPANY_ID
        ) {
            continue;
        }

        $routeIds[] = (int) $route['id'];
    }

    return array_values(array_unique($routeIds));
}

function bookna_format_trip_time(string $isoSchedule): string
{
    try {
        $date = new DateTimeImmutable($isoSchedule);
        $date = $date->setTimezone(new DateTimeZone('Asia/Manila'));
        return $date->format('g:i A');
    } catch (Exception $exception) {
        return '';
    }
}

/**
 * @param array<int, array<string, mixed>> $trips
 * @return array<int, array<string, mixed>>
 */
function bookna_normalize_serverpod_trips(array $trips, string $origin, string $destination): array
{
    $normalized = [];
    $seenTimes = [];

    foreach ($trips as $trip) {
        if (!is_array($trip) || empty($trip['id'])) {
            continue;
        }

        $isoSchedule = (string) ($trip['schedule'] ?? '');
        $time = bookna_format_trip_time($isoSchedule);
        if ($time === '') {
            continue;
        }

        $dedupeKey = $time . '|' . (string) ($trip['bus_type'] ?? '');
        if (isset($seenTimes[$dedupeKey])) {
            continue;
        }
        $seenTimes[$dedupeKey] = true;

        $busType = strtoupper(trim((string) ($trip['bus_type'] ?? '')));
        $labelParts = array_filter([
            $time,
            $origin . ' → ' . $destination,
            $busType !== '' ? $busType : null,
        ]);

        $normalized[] = [
            'id' => (string) $trip['id'],
            'time' => $time,
            'origin' => $origin,
            'destination' => $destination,
            'fare' => null,
            'label' => implode(' · ', $labelParts),
            'available_seats' => null,
            'service_type' => $busType,
            'route_id' => $trip['route_id'] ?? null,
            'departure_at' => $isoSchedule,
        ];
    }

    usort($normalized, static function (array $a, array $b): int {
        return strcmp((string) ($a['departure_at'] ?? ''), (string) ($b['departure_at'] ?? ''));
    });

    return $normalized;
}

/**
 * @return array<int, array<string, mixed>>
 */
function bookna_normalize_schedules(mixed $payload): array
{
    if (!is_array($payload)) {
        return [];
    }

    $candidates = $payload;
    foreach (['schedules', 'trips', 'results', 'data'] as $key) {
        if (isset($payload[$key]) && is_array($payload[$key])) {
            $candidates = $payload[$key];
            break;
        }
    }

    if ($candidates === $payload && isset($payload['success']) && $payload['success'] === false) {
        return [];
    }

    $normalized = [];
    foreach ($candidates as $item) {
        if (!is_array($item)) {
            continue;
        }

        $id = $item['schedule_id']
            ?? $item['id']
            ?? $item['departure_schedule_id']
            ?? null;

        if ($id === null || $id === '') {
            continue;
        }

        $time = trim((string) (
            $item['departure_time']
            ?? $item['time']
            ?? $item['schedule_time']
            ?? ''
        ));

        if ($time === '' && !empty($item['schedule'])) {
            $time = bookna_format_trip_time((string) $item['schedule']);
        }

        $origin = trim((string) ($item['origin'] ?? $item['from'] ?? ''));
        $destination = trim((string) ($item['destination'] ?? $item['to'] ?? ''));
        $fare = $item['fare'] ?? $item['price'] ?? $item['amount'] ?? null;

        $labelParts = array_filter([
            $time !== '' ? $time : null,
            ($origin !== '' && $destination !== '') ? ($origin . ' → ' . $destination) : null,
            $fare !== null ? ('₱' . number_format((float) $fare, 0, '.', ',')) : null,
        ]);

        $label = trim((string) ($item['label'] ?? implode(' · ', $labelParts)));
        if ($label === '') {
            $label = 'Trip #' . $id;
        }

        $normalized[] = [
            'id' => (string) $id,
            'time' => $time,
            'origin' => $origin,
            'destination' => $destination,
            'fare' => $fare,
            'label' => $label,
            'available_seats' => $item['available_seats'] ?? $item['seats_available'] ?? null,
            'service_type' => $item['service_type'] ?? $item['bus_type'] ?? null,
        ];
    }

    return $normalized;
}

/**
 * @param array<string, mixed> $params
 * @return array{ok: bool, schedules: array<int, array<string, mixed>>, message: string}
 */
function bookna_search_schedules(array $params): array
{
    $params = bookna_normalize_trips_params($params);
    $origin = trim((string) ($params['origin'] ?? ''));
    $destination = trim((string) ($params['destination'] ?? ''));
    $departureDate = trim((string) ($params['departure_date'] ?? ''));
    $passengers = max(1, (int) ($params['passengers'] ?? 1));

    if ($origin === '' || $destination === '' || $departureDate === '') {
        return [
            'ok' => false,
            'schedules' => [],
            'message' => 'origin, destination, and departure_date are required.',
        ];
    }

    $routeIds = bookna_get_route_ids($origin, $destination);
    if ($routeIds === []) {
        return [
            'ok' => false,
            'schedules' => [],
            'message' => 'No routes found for this origin and destination.',
        ];
    }

    $tripBodies = [];
    $attemptRouteSets = [$routeIds];

    $allRouteIds = bookna_get_route_ids($origin, $destination, false);
    if ($allRouteIds !== [] && $allRouteIds !== $routeIds) {
        $attemptRouteSets[] = $allRouteIds;
    }

    foreach ($attemptRouteSets as $routeIdSet) {
        $tripResult = bookna_serverpod_call('findTrips', [
            'minDate' => $departureDate,
            'origin' => strtoupper($origin),
            'destination' => strtoupper($destination),
            'quantity' => $passengers,
            'routeIDs' => $routeIdSet,
            'hideWalkIn' => null,
            'hideInsufficientSeats' => null,
        ]);

        if (!$tripResult['ok'] || !is_array($tripResult['body']) || $tripResult['body'] === []) {
            continue;
        }

        $tripBodies = $tripResult['body'];
        break;
    }

    if ($tripBodies === []) {
        return [
            'ok' => true,
            'schedules' => [],
            'message' => 'No available trips found for this route and date.',
        ];
    }

    $schedules = bookna_normalize_serverpod_trips($tripBodies, strtoupper($origin), strtoupper($destination));

    if ($schedules === []) {
        return [
            'ok' => true,
            'schedules' => [],
            'message' => 'No available trips found for this route and date.',
        ];
    }

    return [
        'ok' => true,
        'schedules' => $schedules,
        'message' => 'Schedules loaded.',
    ];
}

/**
 * @param array<string, mixed> $context
 */
function bookna_user_wants_schedule_list(string $message): bool
{
    $normalized = strtolower(trim($message));
    $signals = [
        'list',
        'lista',
        'bigyan ng list',
        'give me a list',
        'show me all',
        'show all',
        'lahat ng trip',
        'lahat ng schedule',
        'mga schedule',
        'mga trip',
        'available trips',
        'available schedules',
        'show schedules',
        'show trips',
        'check schedules',
        'check trips',
        'anong mga oras',
        'what times',
        'ipakita ang mga trip',
        'ipakita ang schedule',
        '__search_schedules__',
    ];

    foreach ($signals as $signal) {
        if (str_contains($normalized, $signal)) {
            return true;
        }
    }

    return false;
}

function bookna_user_asks_about_departure_time(string $message): bool
{
    $normalized = strtolower(trim($message));

    $patterns = [
        '/\b(magandang|mabuting|best|good)\s+(oras|time)\b/',
        '/\banong oras\b/',
        '/\bwhat time\b/',
        '/\bwala akong maisip\b/',
        '/\bsa tingin mo\b/',
        '/\brecommend\b/',
        '/\bsuggest\b/',
        '/\bano ang (magandang|mabuting)\b/',
        '/\b(pumili|pipili|choose).*(oras|time|trip|schedule)\b/',
        '/\b(oras|time).*(suggest|recommend|maganda|mabuti)\b/',
        '/\bipakita.*(schedule|trip|oras)\b/',
        '/\bshow.*(schedule|trip|time)\b/',
        '/\bhanap.*(trip|schedule|oras)\b/',
        '/\bdi ko alam.*oras\b/',
        '/\bhindi ko alam.*oras\b/',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $normalized)) {
            return true;
        }
    }

    return false;
}

function bookna_ai_gives_generic_time_advice(string $reply): bool
{
    $normalized = strtolower(trim($reply));
    $signals = [
        'early morning (e.g.',
        'early morning (',
        'for a more relaxed trip',
        'recommended for arriving early',
        'avoiding traffic',
        'breakfast on the bus',
        'time ranges',
        'general time',
    ];

    foreach ($signals as $signal) {
        if (str_contains($normalized, $signal)) {
            return true;
        }
    }

    return preg_match('/\b\d{1,2}:\d{2}\s*(am|pm)\s*-\s*\d{1,2}:\d{2}\s*(am|pm)\b/i', $reply) === 1;
}

/**
 * @param array<string, mixed> $context
 */
function bookna_ai_asks_for_departure_time(string $reply): bool
{
    $normalized = strtolower(trim($reply));
    $signals = [
        'anong oras',
        'what time',
        'gustong umalis',
        'gustong alis',
        'departure time',
        'preferred na',
        'preferred departure',
        'maibigay ko ang mga options',
        'specific na departure',
        'target ninyong alis',
        'oras niyo po gustong',
    ];

    foreach ($signals as $signal) {
        if (str_contains($normalized, $signal)) {
            return true;
        }
    }

    return false;
}

function bookna_message_is_passenger_count(string $message): bool
{
    return (bool) preg_match('/^\d{1,2}$/', trim($message));
}

function bookna_message_has_date_and_passengers(string $message): bool
{
    $normalized = strtolower(trim($message));
    return (bool) preg_match('/\b(?:bukas|tomorrow)\s+\d{1,2}\b/', $normalized);
}

/**
 * @param array<string, mixed> $context
 */
function bookna_should_search_schedules(array $context, string $message, string $reply = ''): bool
{
    if (
        trim((string) ($context['origin'] ?? '')) === ''
        || trim((string) ($context['destination'] ?? '')) === ''
        || trim((string) ($context['departure_date'] ?? '')) === ''
    ) {
        return false;
    }

    if ((bool) ($context['search_schedules'] ?? false)) {
        return true;
    }

    if (bookna_user_wants_schedule_list($message)) {
        return true;
    }

    if (bookna_user_asks_about_departure_time($message)) {
        return true;
    }

    if (bookna_message_is_passenger_count($message)) {
        return true;
    }

    if (bookna_message_has_date_and_passengers($message)) {
        return true;
    }

    if (bookna_ai_asks_for_departure_time($reply)) {
        return true;
    }

    if (bookna_ai_gives_generic_time_advice($reply)) {
        return true;
    }

    $normalized = strtolower($message . ' ' . $reply);
    $signals = [
        'search schedules',
        'available trips',
        'available schedules',
        'available slots',
        'may available',
        'mga options',
        'hanapin ang trips',
        'hanapin ang schedule',
        'sandali lang',
        'hahanapin ko',
        'please wait',
        'checking',
        'loading',
    ];

    foreach ($signals as $signal) {
        if (str_contains($normalized, $signal)) {
            return true;
        }
    }

    return false;
}
