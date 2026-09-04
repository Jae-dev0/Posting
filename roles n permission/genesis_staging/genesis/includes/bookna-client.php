<?php

declare(strict_types=1);

require_once __DIR__ . '/bookna-config.php';

function bookna_request(string $method, string $path, ?array $query = null, ?array $body = null): array
{
    $url = rtrim(BOOKNA_API_BASE, '/') . '/' . ltrim($path, '/');

    if ($query !== null && $query !== []) {
        $url .= '?' . http_build_query($query);
    }

    $ch = curl_init($url);
    $headers = [
        'Authorization: Bearer ' . BOOKNA_API_KEY,
        'Accept: application/json',
    ];

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HTTPHEADER => $headers,
    ];

    $method = strtoupper($method);
    if ($method === 'POST') {
        $options[CURLOPT_POST] = true;
        $payload = json_encode($body ?? []);
        $headers[] = 'Content-Type: application/json';
        $options[CURLOPT_HTTPHEADER] = $headers;
        $options[CURLOPT_POSTFIELDS] = $payload;
    }

    curl_setopt_array($ch, $options);
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'ok' => false,
            'status' => 502,
            'body' => [
                'error' => true,
                'message' => 'Request Error: ' . $error,
            ],
        ];
    }

    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $raw = $response !== false ? $response : '';
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        if ($raw === '') {
            $decoded = [
                'error' => true,
                'message' => $status === 404 ? 'Endpoint not found' : 'Empty response from booking API',
            ];
        } else {
            $decoded = [
                'error' => true,
                'message' => 'Invalid JSON response from booking API',
            ];
        }
    }

    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status ?: 500,
        'body' => $decoded,
    ];
}
