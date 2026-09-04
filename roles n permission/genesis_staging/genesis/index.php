<?php
$currentPage = 'home';
$pageTitle = 'Genesis Transport Service Inc.';
$pageDescription = 'Book Genesis Transport buses connecting Metro Manila to Central and Northern Luzon.';
include 'includes/layout-start.php';
?>

<div class="bookna-hero-wrap" id="hero" data-section="hero">
  <section class="bookna-hero">
    <video class="bookna-hero__video hero-video" autoplay muted loop playsinline>
      <source src="images/file.mp4" type="video/mp4">
    </video>
    <div class="bookna-hero__overlay"></div>
    <div class="bookna-hero__campaign">
      <h1 class="bookna-hero__hashtag">#LetsG <span>with Genesis</span></h1>
      <p class="bookna-hero__tagline">Safe, efficient travel across Luzon — book your next trip in minutes.</p>
    </div>
  </section>

  <div class="bookna-booking" id="booking">
    <div class="bookna-booking__card">
      <h2 class="bookna-booking__title">Where would you like to go?</h2>

      <div class="bookna-booking__trip-type">
        <label>
          <input type="radio" name="trip_type" id="roundtrip" value="roundtrip" checked>
          Round Trip
        </label>
        <label>
          <input type="radio" name="trip_type" id="oneway" value="oneway">
          One-way
        </label>
      </div>

      <div class="bookna-booking__row bookna-booking__row--locations">
        <div class="bookna-booking__field">
          <i class="fas fa-map-marker-alt"></i>
          <select id="from_dropdown" required>
            <option value="" disabled selected>Select Origin</option>
          </select>
        </div>
        <button type="button" class="bookna-booking__swap" id="switch_btn" aria-label="Swap origin and destination">
          <i class="fas fa-exchange-alt"></i>
        </button>
        <div class="bookna-booking__field">
          <i class="fas fa-map-marker-alt"></i>
          <select id="to_dropdown" required>
            <option value="" disabled selected>Select Destination</option>
          </select>
        </div>
      </div>

      <div class="bookna-booking__row bookna-booking__row--dates" id="date_row">
        <div class="bookna-booking__field">
          <i class="far fa-calendar-alt"></i>
          <input type="date" id="departure_date" required />
        </div>
        <div class="bookna-booking__field" id="return_date_group">
          <i class="far fa-calendar-alt"></i>
          <input type="date" id="return_date" />
        </div>
      </div>

      <div class="bookna-booking__field bookna-booking__field--passengers">
        <i class="fas fa-users"></i>
        <span class="bookna-booking__passenger-label">Passengers</span>
        <div class="bookna-booking__stepper" aria-label="Passenger count">
          <button type="button" class="bookna-booking__stepper-btn" id="passenger_minus" aria-label="Decrease passengers">−</button>
          <span class="bookna-booking__stepper-value" id="passenger_count_display" aria-live="polite">1</span>
          <button type="button" class="bookna-booking__stepper-btn" id="passenger_plus" aria-label="Increase passengers">+</button>
        </div>
        <input type="hidden" id="adult_count" name="adult_count" value="1">
      </div>

      <button type="button" class="bookna-btn bookna-btn--primary" id="search_btn">
        <i class="fas fa-search"></i> Find schedule
      </button>
    </div>
  </div>
</div>

<section class="bookna-trust" aria-label="Genesis milestones">
  <p class="bookna-trust__title">On the road with a network you can trust</p>
  <div class="bookna-trust__stats">
    <article class="bookna-trust__stat">
      <strong>1991</strong>
      <span>Year established</span>
    </article>
    <article class="bookna-trust__stat">
      <strong>2010</strong>
      <span>Saulog Transit acquisition</span>
    </article>
    <article class="bookna-trust__stat">
      <strong>2012</strong>
      <span>JoyBus executive coach</span>
    </article>
    <article class="bookna-trust__stat">
      <strong>Luzon-wide</strong>
      <span>Metro Manila to North &amp; Central Luzon</span>
    </article>
  </div>
</section>

<?php
include 'includes/sections/about.php';
include 'includes/sections/services.php';
include 'includes/sections/terminals.php';
include 'includes/sections/contact.php';
include 'includes/layout-end.php';
?>
