<?php
if (!isset($currentPage)) {
  $currentPage = 'home';
}
if (!isset($pageTitle)) {
  $pageTitle = 'Genesis Transport Service Inc.';
}
if (!isset($pageDescription)) {
  $pageDescription = 'Genesis Transport Service Inc. - Your trusted bus service connecting Metro Manila to Central and Northern Luzon.';
}

function bookna_nav_active($page, $currentPage) {
  if (is_array($page)) {
    return in_array($currentPage, $page, true) ? ' bookna-nav-link--active' : '';
  }
  return $currentPage === $page ? ' bookna-nav-link--active' : '';
}
?>
<!DOCTYPE html>
<html lang="en" class="page-loading">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="<?php echo htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="keywords" content="Genesis, bus service, Genesis Transport Service Inc, Metro Manila, Central Luzon, Northern Luzon" />
  <meta name="author" content="Genesis Transport Service Inc." />
  <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
  <link rel="icon" href="images/favicon-32.png?v=2" type="image/png" sizes="32x32">
  <link rel="icon" href="images/favicon-64.png?v=2" type="image/png" sizes="64x64">
  <link rel="icon" href="images/favicon.png?v=2" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="images/apple-touch-icon.png?v=2">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link rel="stylesheet" href="css/bookna.css?v=20260902d"/>
  <link rel="stylesheet" href="css/elia-chat.css?v=20260902r"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
</head>
<body>
<?php include __DIR__ . '/page-loader.php'; ?>
<?php include __DIR__ . '/header.php'; ?>
