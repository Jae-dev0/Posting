<?php
function bookna_terminal_embed(array $terminal): string {
  $query = $terminal['map_query'] ?? ($terminal['address'] . ', Philippines');
  $zoom = $terminal['map_zoom'] ?? 15;

  return 'https://maps.google.com/maps?q=' . rawurlencode($query) . '&z=' . $zoom . '&output=embed';
}

function bookna_terminal_directions(array $terminal): string {
  $destination = $terminal['map_query'] ?? ($terminal['address'] . ', Philippines');
  return 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode($destination);
}

function bookna_metro_manila_terminal_ids(): array {
  return ['cubao', 'avenida', 'pasay'];
}

function bookna_is_metro_manila_terminal(string $id): bool {
  return in_array($id, bookna_metro_manila_terminal_ids(), true);
}

function bookna_metro_manila_terminals(array $terminals): array {
  return array_values(array_filter($terminals, function ($terminal) {
    return bookna_is_metro_manila_terminal($terminal['id']);
  }));
}

$terminals = [
  [
    'id' => 'cubao',
    'name' => 'Genesis Transport — Cubao',
    'address' => '704 Edsa Corner New York St., Cubao, Quezon City',
    'map_query' => 'Genesis Transport Building, 704 EDSA Corner New York Ave, Cubao, Quezon City, Philippines',
    'badge' => 'Main Terminal',
    'lat' => 14.6191,
    'lng' => 121.0567,
  ],
  [
    'id' => 'avenida',
    'name' => 'Genesis Transport — Avenida',
    'address' => 'Avenida Rizal, Manila near Lawton area',
    'map_query' => 'Genesis Transport Avenida Terminal, Avenida Rizal, Manila, Philippines',
    'badge' => 'Metro Manila',
    'lat' => 14.5920,
    'lng' => 120.9810,
  ],
  [
    'id' => 'pasay',
    'name' => 'Genesis Transport — Pasay',
    'address' => 'EDSA corner Taft Avenue, Pasay City',
    'map_query' => 'Genesis Transport Pasay Terminal, EDSA corner Taft Avenue, Pasay City, Philippines',
    'badge' => 'Metro Manila',
    'lat' => 14.5378,
    'lng' => 121.0010,
  ],
  [
    'id' => 'baguio',
    'name' => 'Genesis Transport — Baguio',
    'address' => 'Baguio City terminal area, Benguet',
    'badge' => 'Northern Luzon',
    'lat' => 16.4023,
    'lng' => 120.5960,
  ],
  [
    'id' => 'clark',
    'name' => 'Genesis Transport — Clark',
    'address' => 'Clark Freeport Zone, Pampanga',
    'badge' => 'Pampanga',
    'lat' => 15.1860,
    'lng' => 120.5594,
  ],
  [
    'id' => 'san-fernando',
    'name' => 'Genesis Transport — San Fernando',
    'address' => 'San Fernando, Pampanga',
    'badge' => 'Pampanga',
    'lat' => 15.0319,
    'lng' => 120.6897,
  ],
  [
    'id' => 'baler',
    'name' => 'Genesis Transport — Baler',
    'address' => 'Baler, Aurora',
    'badge' => 'Aurora',
    'lat' => 15.7589,
    'lng' => 121.5627,
  ],
  [
    'id' => 'balanga',
    'name' => 'Genesis Transport — Balanga',
    'address' => 'Balanga, Bataan',
    'badge' => 'Bataan',
    'lat' => 14.6760,
    'lng' => 120.5369,
  ],
  [
    'id' => 'mariveles',
    'name' => 'Genesis Transport — Mariveles',
    'address' => 'Mariveles, Bataan',
    'badge' => 'Bataan',
    'lat' => 14.4332,
    'lng' => 120.4927,
  ],
  [
    'id' => 'olongapo',
    'name' => 'Saulog Transit — Olongapo',
    'address' => 'Olongapo City, Zambales',
    'badge' => 'Saulog Transit',
    'lat' => 14.8292,
    'lng' => 120.2828,
  ],
  [
    'id' => 'cabanatuan',
    'name' => 'Genesis Transport — Cabanatuan',
    'address' => 'Cabanatuan, Nueva Ecija',
    'badge' => 'Nueva Ecija',
    'lat' => 15.4860,
    'lng' => 120.9679,
  ],
  [
    'id' => 'naic',
    'name' => 'Saulog Transit — NAIC',
    'address' => 'NAIC, Cavite',
    'badge' => 'Saulog Transit',
    'lat' => 14.3206,
    'lng' => 120.7668,
  ],
  [
    'id' => 'ternate',
    'name' => 'Saulog Transit — Ternate',
    'address' => 'Ternate, Cavite',
    'badge' => 'Saulog Transit',
    'lat' => 14.2864,
    'lng' => 120.7156,
  ],
];

$routes = [
  'Avenida' => [
    'Avenida - Baguio City',
    'Avenida - Balanga, Bataan',
  ],
  'Baguio' => [
    'Baguio City - Avenida',
    'Baguio City - Baler, Aurora',
    'Baguio City - Clark, Pampanga',
    'Baguio City - Cubao',
    'Baguio City - Mariveles, Bataan',
    'Baguio City - NAIA 1, 2, 3',
    'Baguio City - Pasay',
    'Baguio City - San Fernando, Pampanga',
  ],
  'Baler' => [
    'Baler, Aurora - Baguio City',
    'Baler, Aurora - Cabanatuan, Nueva Ecija',
    'Baler, Aurora - Cubao',
    'Baler, Aurora - SM Pampanga',
  ],
  'Bataan (Balanga)' => [
    'Balanga, Bataan - Avenida',
    'Balanga, Bataan - Baguio City',
    'Balanga, Bataan - Pasay',
    'Balanga, Bataan - Clark Airport (P2P)',
    'Balanga, Bataan - PITX',
  ],
  'Bataan (Mariveles)' => [
    'Mariveles, Bataan - Baguio City',
    'Mariveles, Bataan - Cubao',
    'Mariveles, Bataan - Pasay',
  ],
  'Cubao' => [
    'Cubao - Baguio City',
    'Cubao - Baler, Aurora',
    'Cubao - Mariveles, Bataan',
    'Cubao - Olongapo',
  ],
  'Pasay' => [
    'Pasay - Baguio City',
    'Pasay - Balanga, Bataan',
    'Pasay - Mariveles, Bataan',
    'Pasay - Olongapo (Saulog Transit)',
  ],
  'Pampanga (Clark)' => [
    'Clark - Baguio City',
    'Clark - PITX (P2P)',
    'Clark - NAIA 1, 2, 3 (P2P)',
    'Clark - TriNoma (P2P)',
    'Clark - Balanga, Bataan (P2P)',
  ],
  'Pampanga (San Fernando)' => [
    'San Fernando, Pampanga - Baguio City',
    'San Fernando, Pampanga - Cabanatuan, Nueva Ecija',
    'SM Pampanga - Baler, Aurora',
  ],
  'Saulog Transit' => [
    'NAIC, Cavite - PITX',
    'Ternate - PITX',
    'Olongapo - Avenida',
    'Olongapo - Cubao',
    'Olongapo - Pasay',
  ],
];
