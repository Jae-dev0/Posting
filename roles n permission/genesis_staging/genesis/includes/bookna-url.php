<?php

declare(strict_types=1);

const BOOKNA_TRIPS_BASE_URL = 'https://staging.bookna.com/genesis/#/trips';
const BOOKNA_PAYMENT_BASE_URL = 'https://staging.bookna.com/genesis/#/payment';

function bookna_extract_transaction_id(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }

    if (preg_match('/traID=([^&\s#]+)/i', $value, $matches)) {
        return urldecode($matches[1]);
    }

    if (preg_match('/^[A-Z0-9]+-[a-f0-9]+$/i', $value)) {
        return $value;
    }

    return '';
}

function bookna_build_payment_url(string $transactionId): string
{
    $transactionId = trim($transactionId);
    if ($transactionId === '') {
        return '';
    }

    return BOOKNA_PAYMENT_BASE_URL . '?traID=' . rawurlencode($transactionId);
}

function bookna_normalize_checkout_url(string $checkoutUrl, ?string $transactionId = null): string
{
    $transactionId = trim((string) ($transactionId ?? ''));
    if ($transactionId === '') {
        $transactionId = bookna_extract_transaction_id($checkoutUrl);
    }

    if ($transactionId === '') {
        return $checkoutUrl;
    }

    return bookna_build_payment_url($transactionId);
}

/**
 * @param array<string, mixed> $body
 * @return array<string, mixed>
 */
function bookna_normalize_checkout_body(array $body): array
{
    $transactionId = trim((string) ($body['transaction_id'] ?? ''));
    if ($transactionId !== '' || trim((string) ($body['checkout_url'] ?? '')) !== '') {
        $body['checkout_url'] = bookna_normalize_checkout_url(
            (string) ($body['checkout_url'] ?? ''),
            $transactionId
        );
    }

    return $body;
}

function bookna_location_to_url_param(string $location): string
{
    $location = trim($location);
    if ($location === '') {
        return '';
    }

    if (preg_match('/^(.+?)\s+\((.+?)\)\s*$/', $location, $matches)) {
        return strtoupper(trim($matches[1]) . '*' . trim($matches[2]));
    }

    return strtoupper(str_replace(' ', '*', $location));
}

function bookna_location_from_url_param(string $location): string
{
    $location = trim($location);
    if ($location === '') {
        return '';
    }

    $location = str_replace('+', ' ', $location);

    if (str_contains($location, '*') && !str_contains($location, '(')) {
        $parts = explode('*', $location, 2);
        if (count($parts) === 2 && trim($parts[1]) !== '') {
            return strtoupper(trim($parts[0]) . ' (' . trim($parts[1]) . ')');
        }
    }

    return strtoupper(str_replace('*', ' ', $location));
}

/**
 * @param array<string, mixed> $params
 * @return array<string, mixed>
 */
function bookna_normalize_trips_params(array $params): array
{
    $origin = trim((string) ($params['origin'] ?? $params['ori'] ?? ''));
    $destination = trim((string) ($params['destination'] ?? $params['des'] ?? ''));
    $departureDate = trim((string) ($params['departure_date'] ?? $params['dep'] ?? ''));
    $returnDate = trim((string) ($params['return_date'] ?? $params['ret'] ?? ''));
    $passengers = max(1, (int) ($params['passengers'] ?? $params['pas'] ?? 1));

    $way = strtolower(trim((string) ($params['way'] ?? $params['trip_type'] ?? '')));
    $tripType = trim((string) ($params['trip_type'] ?? ''));
    if ($tripType === '') {
        if ($way === 'false' || $way === '0' || $way === 'roundtrip' || $way === 'round-trip') {
            $tripType = 'roundtrip';
        } elseif ($way === 'true' || $way === '1' || $way === 'oneway' || $way === 'one-way') {
            $tripType = 'oneway';
        } elseif ($returnDate !== '') {
            $tripType = 'roundtrip';
        } else {
            $tripType = 'oneway';
        }
    }

    return [
        'origin' => bookna_location_from_url_param($origin),
        'destination' => bookna_location_from_url_param($destination),
        'departure_date' => $departureDate,
        'return_date' => $returnDate,
        'passengers' => $passengers,
        'trip_type' => $tripType,
        'ori' => bookna_location_to_url_param(bookna_location_from_url_param($origin)),
        'des' => bookna_location_to_url_param(bookna_location_from_url_param($destination)),
    ];
}

/**
 * @param array<string, mixed> $params
 */
function bookna_build_trips_url(array $params): string
{
    $normalized = bookna_normalize_trips_params($params);
    $query = [
        'way' => ($normalized['trip_type'] ?? '') === 'roundtrip' ? 'false' : 'true',
        'ori' => $normalized['ori'],
        'des' => $normalized['des'],
        'dep' => $normalized['departure_date'],
        'pas' => (string) ($normalized['passengers'] ?? 1),
    ];

    if (($normalized['trip_type'] ?? '') === 'roundtrip' && trim((string) ($normalized['return_date'] ?? '')) !== '') {
        $query['ret'] = $normalized['return_date'];
    }

    return BOOKNA_TRIPS_BASE_URL . '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
}

/**
 * @return array<string, mixed>
 */
function bookna_parse_trips_url(string $url): array
{
    $queryString = parse_url($url, PHP_URL_QUERY);
    if (!is_string($queryString) || $queryString === '') {
        $hash = parse_url($url, PHP_URL_FRAGMENT);
        if (is_string($hash) && str_contains($hash, '?')) {
            $queryString = substr($hash, strpos($hash, '?') + 1);
        }
    }

    $parsed = [];
    if (is_string($queryString) && $queryString !== '') {
        parse_str($queryString, $parsed);
    }

    return bookna_normalize_trips_params($parsed);
}
