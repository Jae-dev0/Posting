<section class="bookna-page-hero">
  <div class="bookna-page-hero__inner">
    <p class="bookna-label"><?php echo htmlspecialchars($pageEyebrow ?? 'Genesis', ENT_QUOTES, 'UTF-8'); ?></p>
    <h1 class="bookna-heading"><?php echo htmlspecialchars($pageHeading ?? $pageTitle, ENT_QUOTES, 'UTF-8'); ?></h1>
    <div class="bookna-divider"></div>
    <?php if (!empty($pageIntro)): ?>
      <p class="bookna-subtext"><?php echo htmlspecialchars($pageIntro, ENT_QUOTES, 'UTF-8'); ?></p>
    <?php endif; ?>
  </div>
</section>
