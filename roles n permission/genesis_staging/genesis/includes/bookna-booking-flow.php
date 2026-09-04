<?php

declare(strict_types=1);

require_once __DIR__ . '/bookna-client.php';
require_once __DIR__ . '/bookna-schedules.php';

/**
 * @return array<string, mixed>
 */
function bookna_booking_default_context(): array
{
    return [
        'origin' => '',
        'destination' => '',
        'departure_date' => '',
        'return_date' => '',
        'passengers' => 1,
        'departure_schedule_id' => '',
        'departure_schedule_label' => '',
        'return_schedule_id' => '',
        'return_schedule_label' => '',
        'departure_seats' => [],
        'return_seats' => [],
        'trip_type' => '',
        'email' => '',
        'contact_number' => '',
        'passenger_list' => [],
        'booking_step' => 'idle',
        'schedule_mode' => 'departure',
        'seat_mode' => 'departure',
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array<string, mixed>
 */
function bookna_booking_normalize_context(array $context): array
{
    $defaults = bookna_booking_default_context();
    $merged = array_merge($defaults, $context);
    $merged['passengers'] = max(1, min(10, (int) ($merged['passengers'] ?? 1)));
    $merged['passenger_list'] = is_array($merged['passenger_list']) ? $merged['passenger_list'] : [];
    $merged['departure_seats'] = bookna_booking_normalize_seat_list($merged['departure_seats'] ?? []);
    $merged['return_seats'] = bookna_booking_normalize_seat_list($merged['return_seats'] ?? []);
    $merged['booking_step'] = trim((string) ($merged['booking_step'] ?? 'idle'));
    $merged['seat_mode'] = trim((string) ($merged['seat_mode'] ?? 'departure'));
    if ($merged['booking_step'] === '') {
        $merged['booking_step'] = 'idle';
    }
    if ($merged['seat_mode'] === '') {
        $merged['seat_mode'] = 'departure';
    }

    return $merged;
}

/**
 * @param mixed $seats
 * @return array<int, int>
 */
function bookna_booking_normalize_seat_list($seats): array
{
    if (!is_array($seats)) {
        return [];
    }

    $normalized = [];
    foreach ($seats as $seat) {
        $value = (int) $seat;
        if ($value > 0) {
            $normalized[] = $value;
        }
    }

    return array_values(array_unique($normalized));
}

function bookna_booking_is_active(array $context): bool
{
    $step = trim((string) ($context['booking_step'] ?? 'idle'));
    return $step !== '' && $step !== 'idle' && $step !== 'done';
}

function bookna_booking_has_route_ready(array $context): bool
{
    return trim((string) ($context['origin'] ?? '')) !== ''
        && trim((string) ($context['destination'] ?? '')) !== ''
        && trim((string) ($context['departure_date'] ?? '')) !== '';
}

function bookna_booking_needs_trip_type(array $context): bool
{
    return bookna_booking_has_route_ready($context)
        && trim((string) ($context['trip_type'] ?? '')) === ''
        && trim((string) ($context['departure_schedule_id'] ?? '')) === '';
}

/**
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_round_trip_prompt(array $context): array
{
    return [
        'reply' => 'Sige po, ka-G! May trips tayo from **'
            . ($context['origin'] ?? '')
            . '** to **'
            . ($context['destination'] ?? '')
            . '** on **'
            . ($context['departure_date'] ?? '')
            . "**.\n\nGusto niyo ba ng **round-trip** (may balik) o **one-way** lang?",
        'quick_actions' => [],
    ];
}

/**
 * @param array<string, mixed> $context
 * @param array<int, array<string, mixed>> $schedules
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_departure_schedule_prompt(array $context, array $schedules): array
{
    if ($schedules === []) {
        return [
            'reply' => 'Sorry, ka-G — wala akong nahanap na trips for '
                . ($context['origin'] ?? '')
                . ' → '
                . ($context['destination'] ?? '')
                . ' on '
                . ($context['departure_date'] ?? '')
                . ".\nPaki-try ang ibang date.",
            'quick_actions' => [],
        ];
    }

    return [
        'reply' => 'Ito ang mga available **departure trips**, ka-G. I-click ang [mga schedule](schedule:list) para pumili ng alis.',
        'quick_actions' => [],
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array{ok: bool, schedules: array<int, array<string, mixed>>}
 */
function bookna_booking_search_departure_schedules(array $context): array
{
    $search = bookna_search_schedules([
        'origin' => $context['origin'],
        'destination' => $context['destination'],
        'departure_date' => $context['departure_date'],
        'passengers' => $context['passengers'],
    ]);

    return [
        'ok' => $search['ok'],
        'schedules' => $search['schedules'],
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array{ok: bool, schedules: array<int, array<string, mixed>>}
 */
function bookna_booking_search_return_schedules(array $context): array
{
    $search = bookna_search_schedules([
        'origin' => $context['destination'],
        'destination' => $context['origin'],
        'departure_date' => $context['return_date'],
        'passengers' => $context['passengers'],
    ]);

    return [
        'ok' => $search['ok'],
        'schedules' => $search['schedules'],
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array{handled: bool, reply: string, context: array<string, mixed>, schedules: array<int, array<string, mixed>>, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_show_departure_schedules(array $context): array
{
    $context['booking_step'] = 'departure_schedule';
    $context['schedule_mode'] = 'departure';
    $search = bookna_booking_search_departure_schedules($context);
    $prompt = bookna_booking_departure_schedule_prompt($context, $search['schedules']);

    return [
        'handled' => true,
        'reply' => $prompt['reply'],
        'context' => $context,
        'schedules' => $search['schedules'],
        'quick_actions' => $prompt['quick_actions'],
    ];
}

/**
 * @return array{schedule_id: string, label: string}|null
 */
function bookna_booking_parse_schedule_selection(string $message): ?array
{
    if (preg_match('/\(schedule\s+(\d+)\)/i', $message, $matches)) {
        $label = trim(preg_replace('/\s*\(schedule\s+\d+\)\s*/i', '', $message));
        $label = preg_replace('/^book this trip:\s*/i', '', $label) ?? $label;

        return [
            'schedule_id' => $matches[1],
            'label' => trim($label) !== '' ? trim($label) : 'Selected trip',
        ];
    }

    if (preg_match('/\[([^\]]+)\]\(schedule:(\d+)\)/', $message, $matches)) {
        return [
            'schedule_id' => $matches[2],
            'label' => trim($matches[1]),
        ];
    }

    return null;
}

function bookna_booking_parse_yes_no(string $message): ?bool
{
    $normalized = strtolower(trim($message));
    if (preg_match('/\b(yes|oo|opo|round[\s-]?trip|pabalik|balikan|may balik|with return)\b/u', $normalized)) {
        return true;
    }
    if (preg_match('/\b(no|hindi|one[\s-]?way|oneway|isa lang|walang balik|one way lang)\b/u', $normalized)) {
        return false;
    }

    return null;
}

function bookna_booking_parse_date(string $message, ?string $referenceDate = null): string
{
    $message = trim($message);
    if ($message === '') {
        return '';
    }

    $timezone = new DateTimeZone('Asia/Manila');
    $reference = $referenceDate !== null && $referenceDate !== ''
        ? new DateTimeImmutable($referenceDate, $timezone)
        : new DateTimeImmutable('today', $timezone);

    if (preg_match('/\b(20\d{2}-\d{2}-\d{2})\b/', $message, $matches)) {
        return $matches[1];
    }

    if (preg_match('/\b(bukas|tomorrow)\b/i', $message)) {
        return (new DateTimeImmutable('tomorrow', $timezone))->format('Y-m-d');
    }

    if (preg_match('/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:,?\s+(20\d{2}))?\b/i', $message, $matches)) {
        $year = $matches[3] ?? $reference->format('Y');
        $parsed = DateTimeImmutable::createFromFormat('F j Y', $matches[1] . ' ' . $matches[2] . ' ' . $year, $timezone);
        if ($parsed instanceof DateTimeImmutable) {
            return $parsed->format('Y-m-d');
        }
    }

    if (preg_match('/(?:sa\s+)?(?:date|petsa)\s+ng\s+(\d{1,2})\b|\b(?:sa|on)\s+(\d{1,2})(?:th|st|nd|rd)?\b|\b(\d{1,2})\s+(?:na\s+)?(?:araw|date)\b/i', $message, $matches)) {
        $day = (int) ($matches[1] ?: ($matches[2] ?: $matches[3]));
        if ($day >= 1 && $day <= 31) {
            $candidate = DateTimeImmutable::createFromFormat(
                'Y-n-j',
                $reference->format('Y') . '-' . $reference->format('n') . '-' . $day,
                $timezone
            );
            if ($candidate instanceof DateTimeImmutable && $candidate < $reference) {
                $candidate = $candidate->modify('+1 month');
            }
            if ($candidate instanceof DateTimeImmutable) {
                return $candidate->format('Y-m-d');
            }
        }
    }

    return '';
}

/**
 * @param array<string, mixed> $context
 * @return array{
 *   context: array<string, mixed>,
 *   schedule_fetch: string|null,
 *   append_booking_form: bool
 * }
 */
function bookna_booking_sync_context(string $message, array $context): array
{
    $context = bookna_booking_normalize_context($context);
    $scheduleFetch = null;
    $appendBookingForm = false;
    $appendSeatMap = false;

    $selection = bookna_booking_parse_schedule_selection($message);
    if ($selection !== null) {
        if (($context['booking_step'] ?? 'idle') === 'return_schedule') {
            $context['return_schedule_id'] = $selection['schedule_id'];
            $context['return_schedule_label'] = $selection['label'];
            $context['booking_step'] = 'return_seats';
            $context['seat_mode'] = 'return';
            $context['schedule_mode'] = 'return';
            $appendSeatMap = true;
        } elseif (
            ($context['booking_step'] ?? 'idle') === 'departure_schedule'
            || (
                trim((string) ($context['trip_type'] ?? '')) !== ''
                && trim((string) ($context['departure_schedule_id'] ?? '')) === ''
            )
        ) {
            $context['departure_schedule_id'] = $selection['schedule_id'];
            $context['departure_schedule_label'] = $selection['label'];
            $context['booking_step'] = 'departure_seats';
            $context['seat_mode'] = 'departure';
            $context['schedule_mode'] = 'departure';
            $appendSeatMap = true;
        }
    }

    if (bookna_booking_needs_trip_type($context) && ($context['booking_step'] ?? 'idle') === 'idle') {
        $context['booking_step'] = 'round_trip';
    }

    $step = (string) ($context['booking_step'] ?? 'idle');

    if ($step === 'round_trip') {
        $choice = bookna_booking_parse_yes_no($message);
        if ($choice === true) {
            $context['trip_type'] = 'roundtrip';
            $context['booking_step'] = 'return_date';
        } elseif ($choice === false) {
            $context['trip_type'] = 'oneway';
            $context['booking_step'] = 'departure_schedule';
            $context['schedule_mode'] = 'departure';
            $scheduleFetch = 'departure';
        }
    }

    if ($step === 'return_date') {
        $parsedDate = bookna_booking_parse_date($message, (string) ($context['departure_date'] ?? ''));
        if ($parsedDate !== '') {
            $context['return_date'] = $parsedDate;
            $context['booking_step'] = 'departure_schedule';
            $context['schedule_mode'] = 'departure';
            $scheduleFetch = 'departure';
        }
    }

    if ($step === 'return_schedule' && bookna_booking_parse_yes_no($message) === false) {
        $context['trip_type'] = 'oneway';
        $context['return_schedule_id'] = '';
        $context['return_schedule_label'] = '';
        $context['return_seats'] = [];
        $context['booking_step'] = 'departure_seats';
        $context['seat_mode'] = 'departure';
        $appendSeatMap = true;
    }

    if ($message === '__submit_seats__') {
        $seatMode = (string) ($context['seat_mode'] ?? 'departure');
        $needed = max(1, (int) ($context['passengers'] ?? 1));
        $selected = $seatMode === 'return'
            ? bookna_booking_normalize_seat_list($context['return_seats'] ?? [])
            : bookna_booking_normalize_seat_list($context['departure_seats'] ?? []);

        if (count($selected) >= $needed) {
            if ($seatMode === 'return') {
                $context['return_seats'] = array_slice($selected, 0, $needed);
                $context['booking_step'] = 'contact';
                $appendBookingForm = true;
            } else {
                $context['departure_seats'] = array_slice($selected, 0, $needed);
                if (($context['trip_type'] ?? '') === 'roundtrip' && trim((string) ($context['return_schedule_id'] ?? '')) === '') {
                    $context['booking_step'] = 'return_schedule';
                    $context['schedule_mode'] = 'return';
                    $scheduleFetch = 'return';
                } elseif (($context['trip_type'] ?? '') === 'roundtrip') {
                    $context['booking_step'] = 'return_seats';
                    $context['seat_mode'] = 'return';
                    $appendSeatMap = true;
                } else {
                    $context['booking_step'] = 'contact';
                    $appendBookingForm = true;
                }
            }
        } else {
            $appendSeatMap = true;
            $context['booking_step'] = $seatMode === 'return' ? 'return_seats' : 'departure_seats';
        }
    }

    if ($message === '__submit_booking_details__' && bookna_booking_details_complete($context)) {
        $context['passenger_list'] = bookna_booking_normalize_passenger_list($context);
        $context['booking_step'] = 'confirm';
    } elseif ($message === '__submit_booking_details__') {
        $context['booking_step'] = 'contact';
        $appendBookingForm = true;
    }

    if (
        $scheduleFetch === null
        && bookna_booking_should_fetch_schedules_for_message($context, $message)
    ) {
        $scheduleFetch = bookna_booking_ensure_departure_schedule_search($context);
    }

    return [
        'context' => $context,
        'schedule_fetch' => $scheduleFetch,
        'append_booking_form' => $appendBookingForm,
        'append_seat_map' => $appendSeatMap,
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array<int, array<string, mixed>>
 */
function bookna_booking_fetch_schedules(?string $mode, array $context): array
{
    if ($mode === 'departure') {
        return bookna_booking_search_departure_schedules($context)['schedules'];
    }
    if ($mode === 'return') {
        return bookna_booking_search_return_schedules($context)['schedules'];
    }

    return [];
}

function bookna_booking_should_fetch_schedules_for_message(array $context, string $message): bool
{
    if (!bookna_booking_has_route_ready($context)) {
        return false;
    }

    if (trim((string) ($context['departure_schedule_id'] ?? '')) !== '') {
        return false;
    }

    return bookna_user_wants_schedule_list($message)
        || bookna_user_asks_about_departure_time($message);
}

/**
 * @param array<string, mixed> $context
 */
function bookna_booking_ensure_departure_schedule_search(array &$context): string
{
    if (trim((string) ($context['trip_type'] ?? '')) === '') {
        $context['trip_type'] = 'oneway';
    }

    $context['booking_step'] = 'departure_schedule';
    $context['schedule_mode'] = 'departure';

    return 'departure';
}

function bookna_booking_state_summary(array $context): string
{
    $parts = [];

    if (trim((string) ($context['origin'] ?? '')) !== '' && trim((string) ($context['destination'] ?? '')) !== '') {
        $parts[] = 'Route: ' . $context['origin'] . ' → ' . $context['destination'];
    }
    if (trim((string) ($context['departure_date'] ?? '')) !== '') {
        $parts[] = 'Departure date: ' . $context['departure_date'];
    }
    if (trim((string) ($context['return_date'] ?? '')) !== '') {
        $parts[] = 'Return date: ' . $context['return_date'];
    }
    if (trim((string) ($context['trip_type'] ?? '')) !== '') {
        $parts[] = 'Trip type: ' . $context['trip_type'];
    }
    if ((int) ($context['passengers'] ?? 1) > 1) {
        $parts[] = 'Passengers: ' . (int) $context['passengers'];
    }

    $step = (string) ($context['booking_step'] ?? 'idle');
    $stepHints = [
        'round_trip' => 'Ask naturally if they want round-trip or one-way. Do not show schedules yet.',
        'return_date' => 'Ask for the return date. Accept Tagalog dates like "bukas" or "sa date ng 4".',
        'departure_schedule' => 'Departure schedules open in the schedule modal. Direct the user to click the schedule link — do not list trip times inline or give generic morning/afternoon advice.',
        'return_schedule' => 'Return schedules open in the schedule modal. Direct the user to click the schedule link.',
        'departure_seats' => 'Departure seats are ready in the seat map modal. Direct the user to click the seat map link. Do not invent seat numbers.',
        'return_seats' => 'Return seats are ready in the seat map modal. Direct the user to click the seat map link. Do not invent seat numbers.',
        'contact' => 'Direct the user to click the booking form link to open the passenger details modal.',
        'passengers' => 'Direct the user to click the booking form link to open the passenger details modal.',
        'confirm' => 'Passenger details were submitted via the booking form. Show the booking summary with email, contact, seats, and passenger names already provided. Include the Confirm and Cancel action links only — do not ask the user to type confirm or cancel. Do not ask for contact information again.',
    ];
    if (isset($stepHints[$step])) {
        $parts[] = $stepHints[$step];
    }

    if (bookna_booking_normalize_seat_list($context['departure_seats'] ?? []) !== []) {
        $parts[] = 'Selected departure seats: ' . implode(', ', $context['departure_seats']);
    }
    if (bookna_booking_normalize_seat_list($context['return_seats'] ?? []) !== []) {
        $parts[] = 'Selected return seats: ' . implode(', ', $context['return_seats']);
    }

    if (($context['booking_step'] ?? '') === 'confirm' && bookna_booking_details_complete($context)) {
        $parts[] = 'Booker email: ' . ($context['email'] ?? '');
        $parts[] = 'Booker phone: ' . ($context['contact_number'] ?? '');
        foreach (array_values($context['passenger_list'] ?? []) as $index => $passenger) {
            if (!is_array($passenger)) {
                continue;
            }
            $parts[] = 'Passenger ' . ($index + 1) . ': '
                . trim((string) ($passenger['fname'] ?? '') . ' ' . (string) ($passenger['lname'] ?? ''));
        }
        if (trim((string) ($context['departure_schedule_label'] ?? '')) !== '') {
            $parts[] = 'Selected departure: ' . $context['departure_schedule_label'];
        }
    }

    if (
        bookna_booking_has_route_ready($context)
        && trim((string) ($context['departure_schedule_id'] ?? '')) === ''
        && !bookna_booking_needs_trip_type($context)
    ) {
        $parts[] = 'When the user asks about times or schedules, use the schedule modal link — never list trips inline or suggest generic time ranges.';
    }

    return implode('. ', $parts);
}

function bookna_booking_append_links(string $reply, array $context, array $schedules, bool $appendBookingForm, bool $appendSeatMap = false): string
{
    $reply = trim($reply);
    if ($schedules !== [] && !str_contains($reply, 'schedule:list')) {
        $reply .= ($reply !== '' ? "\n\n" : '')
            . 'I-click ang [mga schedule](schedule:list) para pumili ng trip.';
    }

    $seatStep = in_array((string) ($context['booking_step'] ?? ''), ['departure_seats', 'return_seats'], true);
    if (($appendSeatMap || $seatStep) && !str_contains($reply, 'seats:select')) {
        $seatLabel = (($context['seat_mode'] ?? 'departure') === 'return') ? 'return seats' : 'seat map';
        $reply .= ($reply !== '' ? "\n\n" : '')
            . 'I-click ang [' . $seatLabel . '](seats:select) para pumili ng upuan.';
    }

    $shouldOfferBookingForm = $appendBookingForm
        && !bookna_booking_details_complete($context)
        && !in_array((string) ($context['booking_step'] ?? ''), ['confirm', 'done', 'departure_seats', 'return_seats'], true);

    if ($shouldOfferBookingForm && !str_contains($reply, 'booking:details')) {
        $reply .= ($reply !== '' ? "\n\n" : '')
            . 'I-click ang [booking form](booking:details) para ilagay ang contact at passenger details.';
    }

    if (
        ($context['booking_step'] ?? '') === 'confirm'
        && bookna_booking_details_complete($context)
    ) {
        $reply = preg_replace(
            '/\n*(?:Please\s+)?(?:type|reply with|send)\s+\*?\*?confirm\*?\*?[^\n]*/iu',
            '',
            $reply
        ) ?? $reply;
        $reply = preg_replace(
            '/\n*Type \*\*confirm\*\* to proceed[^\n]*/iu',
            '',
            $reply
        ) ?? $reply;
        $reply = trim($reply);
        if (!str_contains($reply, 'booking:confirm')) {
            $reply .= ($reply !== '' ? "\n\n" : '')
                . '[Confirm](booking:confirm) [Cancel](booking:cancel)';
        }
    }

    return $reply;
}

/**
 * @param array<string, mixed> $context
 */
function bookna_booking_details_submit_message(array $context): string
{
    $lines = [
        'I submitted my passenger details through the booking form.',
        'Please show my booking summary and include Confirm and Cancel buttons. Do not ask me to type confirm or cancel.',
        'Do not ask for my email, phone, or name again.',
    ];

    if (trim((string) ($context['email'] ?? '')) !== '') {
        $lines[] = 'Email: ' . $context['email'];
    }
    if (trim((string) ($context['contact_number'] ?? '')) !== '') {
        $lines[] = 'Mobile: ' . $context['contact_number'];
    }
    foreach (array_values($context['passenger_list'] ?? []) as $index => $passenger) {
        if (!is_array($passenger)) {
            continue;
        }
        $lines[] = 'Passenger ' . ($index + 1) . ': '
            . trim((string) ($passenger['fname'] ?? '') . ' ' . (string) ($passenger['lname'] ?? ''));
    }
    if (trim((string) ($context['departure_schedule_label'] ?? '')) !== '') {
        $lines[] = 'Departure trip: ' . $context['departure_schedule_label'];
    }

    return implode("\n", $lines);
}

/**
 * @param array<string, mixed> $context
 * @return array{
 *   handled: bool,
 *   reply: string,
 *   context: array<string, mixed>,
 *   schedules: array<int, array<string, mixed>>,
 *   quick_actions: array<int, array<string, string>>,
 *   checkout: array<string, mixed>|null
 * }
 */
function bookna_booking_handle_action(string $message, array $context): array
{
    $context = bookna_booking_normalize_context($context);
    $result = [
        'handled' => false,
        'reply' => '',
        'context' => $context,
        'schedules' => [],
        'quick_actions' => [],
        'checkout' => null,
    ];

    $step = (string) ($context['booking_step'] ?? 'idle');
    if ($step !== 'confirm') {
        return $result;
    }

    $confirm = bookna_booking_parse_confirm($message);
    if ($confirm === false) {
        $context = bookna_booking_normalize_context([]);
        $result['handled'] = true;
        $result['reply'] = 'Okay po, ka-G — na-cancel ang booking. Sabihin niyo lang kung gusto ninyong maghanap ulit ng trip.';
        $result['context'] = $context;

        return $result;
    }

    if ($confirm !== true) {
        return $result;
    }

    $checkout = bookna_booking_create_checkout($context);
    if (!$checkout['ok']) {
        $messageText = (string) ($checkout['body']['message'] ?? 'Checkout failed.');
        $result['handled'] = true;
        $result['reply'] = 'Sorry, ka-G — hindi ma-create ang checkout: ' . $messageText
            . "\nPaki-try ulit or gamitin ang booking form sa page.";
        $result['context'] = $context;

        return $result;
    }

    $body = $checkout['body'];
    $context['booking_step'] = 'done';
    $minutes = max(1, (int) round(((int) ($body['expires_in_seconds'] ?? 1200)) / 60));
    $result['handled'] = true;
    $result['reply'] = 'Done, ka-G! Na-create na ang booking ninyo.'
        . "\n\n**Reference:** " . ($body['transaction_id'] ?? '')
        . "\n**Payment link:** " . ($body['checkout_url'] ?? '')
        . "\n\nMay **{$minutes} minutes** kayo para magbayad bago mag-expire ang link.";
    $result['checkout'] = $body;
    $result['context'] = $context;

    return $result;
}

/**
 * Backward-compatible wrapper used by older call sites.
 *
 * @param array<string, mixed> $context
 */
function bookna_booking_process(string $message, array $context): array
{
    $sync = bookna_booking_sync_context($message, $context);
    $action = bookna_booking_handle_action($message, $sync['context']);
    if ($action['handled']) {
        return $action;
    }

    return [
        'handled' => false,
        'reply' => '',
        'context' => $sync['context'],
        'schedules' => bookna_booking_fetch_schedules($sync['schedule_fetch'], $sync['context']),
        'quick_actions' => [],
        'checkout' => null,
    ];
}

/**
 * @return array{email: string, contact_number: string}
 */
function bookna_booking_parse_contact(string $message): array
{
    $email = '';
    $phone = '';

    if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $message, $matches)) {
        $email = trim($matches[0]);
    }

    if (preg_match('/(?:\+63|0)\s*9\d[\s\d]{7,10}/', $message, $matches)) {
        $phone = preg_replace('/\D+/', '', $matches[0]) ?? '';
        if (str_starts_with($phone, '63')) {
            $phone = '0' . substr($phone, 2);
        }
    }

    return [
        'email' => $email,
        'contact_number' => $phone,
    ];
}

/**
 * @return array<int, array{fname: string, lname: string}>
 */
function bookna_booking_parse_passenger_names(string $message, int $expectedCount): array
{
    $chunks = preg_split('/[\n,;]+/', $message) ?: [];
    $passengers = [];

    foreach ($chunks as $chunk) {
        $chunk = trim(preg_replace('/^\d+[\).\-\s]+/', '', trim($chunk)) ?? '');
        if ($chunk === '') {
            continue;
        }

        $parts = preg_split('/\s+/', $chunk) ?: [];
        if (count($parts) < 2) {
            continue;
        }

        $fname = array_shift($parts);
        $lname = implode(' ', $parts);
        $passengers[] = [
            'fname' => $fname,
            'lname' => $lname,
        ];

        if (count($passengers) >= $expectedCount) {
            break;
        }
    }

    return $passengers;
}

function bookna_booking_parse_confirm(string $message): ?bool
{
    $normalized = strtolower(trim($message));
    if (preg_match('/\b(confirm|confirmed|oo|yes|proceed|go ahead|tuloy|sige)\b/u', $normalized)) {
        return true;
    }
    if (preg_match('/\b(cancel|cancelled|hindi|no|stop|wag)\b/u', $normalized)) {
        return false;
    }

    return null;
}

/**
 * @return array{
 *   ok: bool,
 *   schedule_id: string,
 *   capacity: int,
 *   available_seats: array<int, int>,
 *   reserved_seats: array<int, int>,
 *   priority_seats: array<int, int>,
 *   bus_type: string,
 *   price: int|float|null
 * }
 */
function bookna_booking_fetch_seat_map(string $scheduleId): array
{
    $empty = [
        'ok' => false,
        'schedule_id' => $scheduleId,
        'capacity' => 0,
        'available_seats' => [],
        'reserved_seats' => [],
        'priority_seats' => [],
        'bus_type' => '',
        'price' => null,
    ];

    if (trim($scheduleId) === '') {
        return $empty;
    }

    $result = bookna_request('GET', 'get-schedule', ['schedule_id' => $scheduleId]);
    if (!$result['ok'] || !is_array($result['body'])) {
        return $empty;
    }

    $body = $result['body'];
    $available = bookna_booking_normalize_seat_list($body['available_seats'] ?? []);
    $reserved = bookna_booking_normalize_seat_list($body['reserved_seats'] ?? []);
    $priority = bookna_booking_normalize_seat_list($body['priority_seats'] ?? []);
    $capacity = max(
        (int) ($body['capacity'] ?? 0),
        count($available) + count($reserved),
        max($available ?: [0]),
        max($reserved ?: [0])
    );

    return [
        'ok' => true,
        'schedule_id' => (string) ($body['schedule_id'] ?? $scheduleId),
        'capacity' => $capacity,
        'available_seats' => $available,
        'reserved_seats' => $reserved,
        'priority_seats' => $priority,
        'bus_type' => trim((string) ($body['bus_type'] ?? '')),
        'price' => $body['price'] ?? null,
    ];
}

/**
 * @return array<int, int>
 */
function bookna_booking_get_available_seats(string $scheduleId, int $count): array
{
    $map = bookna_booking_fetch_seat_map($scheduleId);
    if (!$map['ok']) {
        return [];
    }

    return array_slice($map['available_seats'], 0, max(1, $count));
}

/**
 * @param array<string, mixed> $context
 * @return array{ok: bool, body: array<string, mixed>}
 */
function bookna_booking_create_checkout(array $context): array
{
    $passengers = [];
    $needed = max(1, (int) ($context['passengers'] ?? 1));
    $departureSeats = bookna_booking_normalize_seat_list($context['departure_seats'] ?? []);
    if (count($departureSeats) < $needed) {
        $departureSeats = bookna_booking_get_available_seats((string) $context['departure_schedule_id'], $needed);
    }

    $returnSeats = bookna_booking_normalize_seat_list($context['return_seats'] ?? []);
    if (
        ($context['trip_type'] ?? '') === 'roundtrip'
        && trim((string) ($context['return_schedule_id'] ?? '')) !== ''
        && count($returnSeats) < $needed
    ) {
        $returnSeats = bookna_booking_get_available_seats((string) $context['return_schedule_id'], $needed);
    }

    foreach ($context['passenger_list'] as $index => $passenger) {
        if (!is_array($passenger)) {
            continue;
        }

        $entry = [
            'fname' => (string) ($passenger['fname'] ?? ''),
            'lname' => (string) ($passenger['lname'] ?? ''),
            'email' => (string) ($passenger['email'] ?? $context['email']),
            'contact_number' => (string) ($passenger['contact_number'] ?? $context['contact_number']),
            'departure_seat' => (int) ($passenger['departure_seat'] ?? ($departureSeats[$index] ?? 0)),
        ];

        if (($context['trip_type'] ?? '') === 'roundtrip') {
            $entry['return_seat'] = (int) ($passenger['return_seat'] ?? ($returnSeats[$index] ?? 0));
        }

        $passengers[] = $entry;
    }

    $payload = [
        'departure_schedule_id' => (int) $context['departure_schedule_id'],
        'return_schedule_id' => ($context['trip_type'] ?? '') === 'roundtrip' && trim((string) ($context['return_schedule_id'] ?? '')) !== ''
            ? (int) $context['return_schedule_id']
            : null,
        'email' => (string) $context['email'],
        'contact_number' => (string) $context['contact_number'],
        'passengers' => $passengers,
    ];

    $result = bookna_request('POST', 'create-checkout', null, $payload);
    $body = is_array($result['body']) ? bookna_normalize_checkout_body($result['body']) : [];

    return [
        'ok' => $result['ok'] && !empty($body['success']),
        'body' => $body,
    ];
}

function bookna_booking_details_complete(array $context): bool
{
    $expected = max(1, (int) ($context['passengers'] ?? 1));
    $list = $context['passenger_list'] ?? [];
    if (trim((string) ($context['email'] ?? '')) === '' || trim((string) ($context['contact_number'] ?? '')) === '') {
        return false;
    }
    if (!is_array($list) || count($list) < $expected) {
        return false;
    }

    foreach (array_slice($list, 0, $expected) as $passenger) {
        if (!is_array($passenger)) {
            return false;
        }
        if (trim((string) ($passenger['fname'] ?? '')) === '' || trim((string) ($passenger['lname'] ?? '')) === '') {
            return false;
        }
    }

    return true;
}

/**
 * @param array<string, mixed> $context
 * @return array<int, array<string, string>>
 */
function bookna_booking_normalize_passenger_list(array $context): array
{
    $expected = max(1, (int) ($context['passengers'] ?? 1));
    $email = (string) ($context['email'] ?? '');
    $phone = (string) ($context['contact_number'] ?? '');
    $departureSeats = bookna_booking_normalize_seat_list($context['departure_seats'] ?? []);
    $returnSeats = bookna_booking_normalize_seat_list($context['return_seats'] ?? []);
    $normalized = [];

    foreach (array_slice($context['passenger_list'] ?? [], 0, $expected) as $index => $passenger) {
        if (!is_array($passenger)) {
            continue;
        }
        $entry = [
            'fname' => trim((string) ($passenger['fname'] ?? '')),
            'lname' => trim((string) ($passenger['lname'] ?? '')),
            'email' => trim((string) ($passenger['email'] ?? $email)),
            'contact_number' => trim((string) ($passenger['contact_number'] ?? $phone)),
            'departure_seat' => (int) ($passenger['departure_seat'] ?? ($departureSeats[$index] ?? 0)),
        ];
        if (($context['trip_type'] ?? '') === 'roundtrip') {
            $entry['return_seat'] = (int) ($passenger['return_seat'] ?? ($returnSeats[$index] ?? 0));
        }
        $normalized[] = $entry;
    }

    return $normalized;
}

/**
 * @param array<string, mixed> $context
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_contact_prompt(array $context): array
{
    $label = trim((string) ($context['departure_schedule_label'] ?? 'selected trip'));

    return [
        'reply' => 'Salamat, ka-G! Napili ninyo ang **' . $label . '**.'
            . "\n\nPara ma-process ang booking, i-click ang [booking form](booking:details) para ilagay ang contact at passenger details.",
        'quick_actions' => [],
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_passenger_prompt(array $context): array
{
    $count = (int) ($context['passengers'] ?? 1);

    return [
        'reply' => 'Salamat! Next, i-click ang [booking form](booking:details) para ilagay ang pangalan ng '
            . ($count === 1 ? 'passenger' : $count . ' passengers') . '.',
        'quick_actions' => [],
    ];
}

/**
 * @param array<string, mixed> $context
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_confirm_prompt(array $context): array
{
    $lines = [
        '**Booking summary**',
        'Departure: ' . ($context['departure_schedule_label'] ?? 'Selected trip'),
    ];

    if (($context['trip_type'] ?? '') === 'roundtrip') {
        $lines[] = 'Return: ' . ($context['return_schedule_label'] ?? 'Selected return trip');
    }

    $lines[] = 'Passengers: ' . (int) ($context['passengers'] ?? 1);
    if (bookna_booking_normalize_seat_list($context['departure_seats'] ?? []) !== []) {
        $lines[] = 'Departure seats: ' . implode(', ', $context['departure_seats']);
    }
    if (
        ($context['trip_type'] ?? '') === 'roundtrip'
        && bookna_booking_normalize_seat_list($context['return_seats'] ?? []) !== []
    ) {
        $lines[] = 'Return seats: ' . implode(', ', $context['return_seats']);
    }
    $lines[] = 'Email: ' . ($context['email'] ?? '');
    $lines[] = 'Contact: ' . ($context['contact_number'] ?? '');

    foreach ($context['passenger_list'] as $index => $passenger) {
        if (!is_array($passenger)) {
            continue;
        }
        $seatBits = [];
        if (!empty($passenger['departure_seat'])) {
            $seatBits[] = 'dep seat ' . $passenger['departure_seat'];
        }
        if (!empty($passenger['return_seat'])) {
            $seatBits[] = 'ret seat ' . $passenger['return_seat'];
        }
        $lines[] = 'P' . ($index + 1) . ': ' . ($passenger['fname'] ?? '') . ' ' . ($passenger['lname'] ?? '')
            . ($seatBits !== [] ? ' (' . implode(', ', $seatBits) . ')' : '');
    }

    $lines[] = '';
    $lines[] = '[Confirm](booking:confirm) [Cancel](booking:cancel)';

    return [
        'reply' => implode("\n", $lines),
        'quick_actions' => [],
    ];
}

/**
 * @param array<string, mixed> $context
 * @param array<int, array<string, mixed>> $schedules
 * @return array{reply: string, quick_actions: array<int, array<string, string>>}
 */
function bookna_booking_return_schedule_prompt(array $context, array $schedules): array
{
    if ($schedules === []) {
        return [
            'reply' => 'Sorry, ka-G — wala akong nahanap na return trips for '
                . ($context['destination'] ?? '') . ' → ' . ($context['origin'] ?? '')
                . ' on ' . ($context['return_date'] ?? '') . '.'
                . "\nPaki-try ang ibang date, or sabihin kung one-way na lang.",
            'quick_actions' => [],
        ];
    }

    return [
        'reply' => 'Ito ang mga available **return trips**, ka-G. I-click ang [mga schedule](schedule:list) para pumili ng balik.',
        'quick_actions' => [],
    ];
}
