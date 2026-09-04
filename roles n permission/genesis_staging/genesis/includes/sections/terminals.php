<?php include __DIR__ . '/../routes-data.php'; ?>

<section id="terminals" class="bookna-section bookna-section--gradient bookna-page-section bookna-section--bus" data-section="terminals">
  <div class="bookna-section__inner">
    <p class="bookna-label">Find us</p>
    <h2 class="bookna-heading">Terminals &amp; Routes</h2>
    <div class="bookna-divider"></div>
    <p class="bookna-subtext bookna-subtext--spaced">Browse Genesis Transport and Saulog Transit terminals, then find major corridors across Luzon.</p>

    <h3 class="bookna-heading bookna-heading--sub">Terminals</h3>
    <div class="bookna-divider bookna-divider--sub"></div>
    <p class="bookna-subtext bookna-subtext--spaced">Find our Genesis Transport and Saulog Transit terminals on the map below.</p>
    <div class="bookna-terminals__grid">
      <div class="bookna-terminals__tabs" role="tablist" aria-label="Terminal locations">
        <?php foreach ($terminals as $i => $terminal): ?>
          <button
            type="button"
            class="bookna-terminal-tab<?php echo $i === 0 ? ' bookna-terminal-tab--active' : ''; ?>"
            role="tab"
            aria-selected="<?php echo $i === 0 ? 'true' : 'false'; ?>"
            data-terminal-id="<?php echo htmlspecialchars($terminal['id'], ENT_QUOTES, 'UTF-8'); ?>"
          >
            <h3><?php echo htmlspecialchars($terminal['name'], ENT_QUOTES, 'UTF-8'); ?></h3>
            <p><?php echo htmlspecialchars($terminal['address'], ENT_QUOTES, 'UTF-8'); ?></p>
            <span><?php echo htmlspecialchars($terminal['badge'], ENT_QUOTES, 'UTF-8'); ?></span>
          </button>
        <?php endforeach; ?>
      </div>
      <div class="bookna-terminals__map-wrap">
        <div class="bookna-terminals__map">
          <div id="terminals-map" aria-label="Genesis terminals map"></div>
        </div>
        <a
          id="terminals-directions"
          class="bookna-btn bookna-btn--outline bookna-btn--inline"
          href="<?php echo htmlspecialchars(bookna_terminal_directions($terminals[0]), ENT_QUOTES, 'UTF-8'); ?>"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get directions
        </a>
      </div>
    </div>

    <script type="application/json" id="terminals-map-data"><?php
      echo json_encode($terminals, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    ?></script>

    <div class="bookna-routes__header bookna-routes__header--spaced">
      <div>
        <h3 class="bookna-heading bookna-heading--sub">Routes</h3>
        <div class="bookna-divider bookna-divider--sub"></div>
        <p class="bookna-subtext">Major corridors served by Genesis Transport and Saulog Transit.</p>
      </div>
      <label class="bookna-routes__search">
        <span class="bookna-sr-only">Search routes</span>
        <i class="fas fa-search" aria-hidden="true"></i>
        <input type="search" id="route_search" placeholder="Search hub or destination…" autocomplete="off">
      </label>
    </div>
    <p class="bookna-routes__empty" id="route_empty" hidden>No routes match your search.</p>
    <div class="bookna-routes" id="routes_grid">
      <?php foreach ($routes as $hub => $list): ?>
        <article class="bookna-route-card" data-route-hub="<?php echo htmlspecialchars(strtolower($hub), ENT_QUOTES, 'UTF-8'); ?>">
          <h3><?php echo htmlspecialchars($hub, ENT_QUOTES, 'UTF-8'); ?></h3>
          <ul>
            <?php foreach ($list as $route): ?>
              <li data-route-text="<?php echo htmlspecialchars(strtolower($route), ENT_QUOTES, 'UTF-8'); ?>">
                <?php echo htmlspecialchars($route, ENT_QUOTES, 'UTF-8'); ?>
              </li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
    <div class="bookna-routes__cta">
      <a href="#booking" class="bookna-btn bookna-btn--primary bookna-btn--inline">Book a trip</a>
    </div>
  </div>
</section>
