
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Solid North, Inc.</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="icon" href="images/favicon.png" type="image/png">



  <style>
    /* Base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
      color: #333;
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    /* Header & Navigation */
    header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    #wrapper {
    
    /* max-width: 1200px; */
    margin: 0 auto;
    padding: 0px 78px;
}


#container-header {
    display: flex
;
    justify-content: space-between;
    align-items: center;
    padding: 1px 0;
}
    #logo-header-div img {
    max-width: 270px;
      height: auto;
    }
    
    /* Mobile menu toggle */
    .mobile-menu-toggle {
      display: none;
      font-size: 24px;
      cursor: pointer;
      color: #dc000a;
    }
    
    #main-menu {
      transition: max-height 0.3s ease;
    }
    
    #main-menu ul {
      display: flex;
      list-style: none;
    }
    
    #main-menu ul li {
      position: relative;
    }
    
    #main-menu ul li div {
      padding: 10px 15px;
    }
    
    #main-menu ul li a {
      text-decoration: none;
      color: #333;
      font-weight: 600;
      font-size: 14px;
      transition: color 0.3s;
    }
    
    #main-menu ul li a:hover {
      color: #dc000a;
    }
    
    /* Background Slider */
    .background-slider {
      position: relative;
      height: 650px;
      overflow: hidden;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      opacity: 0;
      animation: fade 15s infinite;
    }
    
    @keyframes fade {
      0%, 100% { opacity: 0; }
      20%, 80% { opacity: 1; }
    }
    
    /* Hero & Search Section */
    .hero {
      position: relative;
      max-width: 1000px;
      margin: -50px auto 30px;
      z-index: 10;
     
    }
    
    .trip-search-box {
      background: #fff;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.1);
    }
    
    .trip-type {
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      font-weight: 600;
      font-size: 1rem;
      color: #333;
      flex-wrap: wrap;
    }
    
    .trip-type label {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    
    .trip-type input[type="radio"] {
      margin-right: 8px;
      accent-color: #dc000a;
    }
    
    .trip-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
    }
    
    .input-select,
    .input-date,
    .input-number {
      flex: 1 1 150px;
      min-width: 100px;
      padding: 10px 12px;
      font-size: 1rem;
      border: 1.8px solid #ddd;
      border-radius: 8px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }
    
    .input-select:focus,
    .input-date:focus,
    .input-number:focus {
      border-color: #dc000a;
      outline: none;
      box-shadow: 0 0 6px rgba(220, 0, 10, 0.3);
    }
    

.input-select{

    padding-left: 7%;

}
    .switch-icon {
      font-size: 1.4rem;
      margin: 0 8px;
      color: #555;
      user-select: none;
      flex-shrink: 0;
      align-self: center;
    }
    
    .search-btn {
      background-color: #ec3237;
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
      padding: 12px 0;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      flex: 1 1 100%;
      transition: background-color 0.3s ease;
      box-shadow: 0 4px 8px rgba(220, 0, 10, 0.35);
      margin-top: 10px;
    }
    
    .search-btn:hover {
      background-color:rgb(133, 6, 13);
      box-shadow: 0 6px 12px rgba(176, 0, 8, 0.4);
    }
    
    /* Body content */
    #container-body {
      margin: 30px 0;
    }
    
    .section-title {
      text-align: center;
      margin: 40px 0 30px;
      color: #dc000a;
      font-size: 2rem;
      position: relative;
    }
    
    .section-title::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: #dc000a;
      margin: 10px auto;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }
    
    .feature-card {
      background: white;
      border-radius: 10px;
      padding: 25px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-align: center;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .feature-icon {
      font-size: 3rem;
      color: #dc000a;
      margin-bottom: 15px;
    }
    
    .feature-card h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    .feature-card p {
      color: #666;
    }
    
    .routes-container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      margin-bottom: 40px;
    }
    
    .routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .route-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .route-item:hover {
      background: #e9ecef;
      transform: scale(1.03);
    }
    
    .route-item i {
      color: #dc000a;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }
    
    /* Contact info */
    .contact-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      padding: 15px 0;
      margin: 20px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    
    .contact-phone {
      font-size: 18px;
      font-weight: bold;
      color: #dc000a;
      margin-bottom: 5px;
    }
    
    .social-icons {
      display: flex;
      gap: 15px;
    }
    
    .social-icons a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      color: #dc000a;
      font-size: 20px;
      transition: all 0.3s;
    }
    
    .social-icons a:hover {
      background: #dc000a;
      color: white;
      transform: translateY(-3px);
    }
    
    /* Footer */
    footer {
      background: #c42c33;
      color: white;
      padding: 30px 0;
      margin-top: 40px;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .footer-section h3 {
      font-size: 18px;
      margin-bottom: 15px;
      position: relative;
      padding-bottom: 10px;
    }
    
    .footer-section h3:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 2px;
      background: rgb(226, 218, 219);
    }
    
    .footer-links {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 10px;
    }
    
    .footer-links a {
      color: #ddd;
      text-decoration: none;
      transition: color 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .footer-links a:hover {
      color: white;
    }
    
    .footer-links a i {
      width: 20px;
    }
    
    .copyright {
    text-align: center;
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 14px;
    color: #ffffff;
    }
    
    /* Responsive adjustments */
    @media (max-width: 992px) {
      #container-header {
        padding: 10px 0;
      }
      
      .trip-search-box {
        padding: 20px;
      }
      
      .trip-fields {
        gap: 10px;
      }
      
      .input-select,
      .input-date,
      .input-number {
        flex: 1 1 calc(50% - 10px);
      }
      
      .background-slider {
        height: 400px;
      }
    }
    
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: block;
      }
      
#main-menu {
        max-height: 0;
        overflow: hidden;
        width: 100%;
        position: absolute;
        top: 69px;
        left: 0;
        background: #dedede;
        box-shadow: 0 10px 10px rgb(18 16 16 / 10%);
    }
      #main-menu.active {
        max-height: 500px;
      }
      
      #main-menu ul {
        flex-direction: column;
      }
      
      #main-menu ul li {
        border-bottom: 1px solid #eee;
        width: 100%;
      }
      
      #main-menu ul li:last-child {
        border-bottom: none;
      }
      
      .hero {
        margin-top: 0;
      }
      
      .trip-type {
        gap: 15px;
        font-size: 0.9rem;
      }
      
      .switch-icon {
        display: none;
      }
      
      .input-select,
      .input-date,
      .input-number {
        flex: 1 1 100%;
      }
      
      .contact-info {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .social-icons {
        margin-top: 15px;
      }
      
      .background-slider {
        height: 350px;
      }
    }
    
    @media (max-width: 576px) {

       #wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
  
}


      #logo-header-div img {
        max-width: 160px;
      }
      
      .trip-search-box {
        padding: 15px;
      }
      
      .background-slider {
        height: 300px;
      }
    }
    
    /* Animations */
    .animate__animated {
      animation-duration: 1s;
    }
    
    .fade {
      transition: opacity 0.3s;
    }
    
    .fade:hover {
      opacity: 0.8;
    }

    .bus-image-container {
      position: absolute;
      top: 50%;
      right: 5%;
      transform: translateY(-50%);
      z-index: 999;
      width: 25vw;
      max-width: 300px;
    }

    .bus-image-container img {
      width: 100%;
      height: auto;
      display: block;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Responsive adjustments for tablets and phones */
    @media (max-width: 992px) {
      .bus-image-container {
        top: 50%;
        right: 2%;
        width: 30vw;
      }
    }

    @media (max-width: 768px) {
      .bus-image-container {
        display: none;
      }
    }

    /* Loading spinner */
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }




      .content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 60px 20px;
      background: rgba(255, 255, 255, 0.4);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    h1 {
      font-size: 48px;
    }

    .highlight {
      color: #ffc93c;
    }

    .countdown {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 40px;
    }

    .time-box {
      background: rgba(0, 0, 50, 0.6);
      padding: 20px;
      border-radius: 12px;
      min-width: 80px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .time-box span {
      display: block;
    }

    .number {
      font-size: 36px;
      color: #ffc93c;
      font-weight: bold;
    }

    .label {
      font-size: 14px;
      margin-top: 5px;
      color: #ccc;
    }
  .hero {
            width: 100%;
            max-width: 1000px;
            background: var(--card-bg);
            border-radius: 15px;
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 30px;
                background: #ffffff;
    color: #000000;
    padding: 1%;
        }
        
        .trip-search-box {
            padding: 30px;
        }
        
        .trip-type {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            justify-content: center;
        }
        
        .trip-type label {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 25px;
            background: var(--light);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e9ecef;
            font-weight: 500;
        }
        
        .trip-type label:hover {
            border-color: var(--primary);
        }
        
        .trip-type input[type="radio"] {
            display: none;
        }
        
        .trip-type input[type="radio"]:checked + label {
            background: var(--primary);
            color: #e41f1f;
            border-color: var(--primary);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
        }
        
        .trip-fields {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 20px;
            margin-bottom: 20px;
            align-items: end;
        }
        
        .input-group {
            position: relative;
        }
        
        .input-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--primary);
            font-size: 1.1rem;
        }
        
        .input-select, .input-date, .input-number {
            width: 100%;
            padding: 15px 15px 15px 45px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            font-size: 1rem;
            transition: all 0.3s ease;
            height: 55px;
        }
        
        .input-select:focus, .input-date:focus, .input-number:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
            outline: none;
        }
        
        .switch-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: var(--primary);
            color: #d31616;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1.4rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            margin-bottom: 8px;
        }
        
        .switch-icon:hover {
            background: var(--secondary);
            transform: rotate(180deg);
        }
        
        .date-passenger-group {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .search-btn {
               background: #eb0a0a;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 17px 25px;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.4);
    cursor: pointer;
    display: flex
;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
 
        .search-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.6);
        }
        
        .search-btn:active {
            transform: translateY(0);
        }
        
        .featured-routes {
            padding: 25px 30px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        
        .featured-routes h3 {
            color: var(--primary);
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }
        
        .routes-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
        }
        
        .route-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e9ecef;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 180px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .route-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.2);
        }
        
        .route-card i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 15px;
        }
        
        .route-info {
            text-align: center;
        }
        
        .route-info .city {
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .route-info .duration {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .route-info .price {
            font-weight: 700;
            color: var(--primary);
            margin-top: 10px;
            font-size: 1.2rem;
        }
        
        .benefits {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 30px;
            margin: 40px 0;
            width: 100%;
            max-width: 1000px;
        }
        
        .benefit-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 200px;
            text-align: center;
        }
        
        .benefit-card i {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 15px;
        }
        
        .benefit-card h4 {
            margin-bottom: 10px;
            color: var(--secondary);
        }



.bus-image-container {
    position: absolute;
    top: 27%;
    left: 42%;
    z-index: 99999;
    width: 64vw;
    max-width: 300px;
}

.bus-image-container img {
    width: 100%;
    height: auto;
    display: block;
}

/* Tablets and below */
@media (max-width: 1024px) {
    .bus-image-container {
        top: 12%;
        left: 50%;
        transform: translateX(-50%);
        width: 50vw;
    }
}

/* Phones */
@media (max-width: 480px) {
      .bus-image-container {
        top: 14%;
        left: 67%;
        transform: translateX(-50%);
        width: 70vw;
    }
    .bus-image-container img {
    width: 180px;
    height: auto;
    display: block;
}

}

.trip-fields {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0;
}

/* Style for each input group */
.trip-fields .input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-select {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

.switch-icon {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;

  
}

/* Responsive styles */
@media (max-width: 768px) {
  .trip-fields {
    flex-direction: column;
    align-items: stretch;
  }
.input-select {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    padding-left: 31px;
}
  .switch-icon {
    align-self: center;

    
  }

    .switch-icon {
        display:none;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        background: var(--primary);
        color: #d31616;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.4rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        margin-bottom: 8px;
        margin-left: 0%;
    }
}

        .input-select {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    padding-left: 8%;
}
        .hero {
            width: 100%;
            max-width: 1000px;
            background: var(--card-bg);
            border-radius: 15px;
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 30px;
                background: #ffffff;
    color: #000000;
    padding: 1%;
        }
        
        .trip-search-box {
            padding: 30px;
        }
        
        .trip-type {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            justify-content: center;
        }
        
        .trip-type label {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 25px;
            background: var(--light);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e9ecef;
            font-weight: 500;
        }
        
        .trip-type label:hover {
            border-color: var(--primary);
        }
        
        .trip-type input[type="radio"] {
            display: none;
        }
        
        .trip-type input[type="radio"]:checked + label {
            background: var(--primary);
            color: #e41f1f;
            border-color: var(--primary);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
        }
        
        .trip-fields {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 20px;
            margin-bottom: 20px;
            align-items: end;
        }
        
        .input-group {
            position: relative;
        }
        
        .input-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--primary);
            font-size: 1.1rem;
        }
        
        .input-select, .input-date, .input-number {
            width: 100%;
            padding: 15px 15px 15px 45px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            font-size: 1rem;
            transition: all 0.3s ease;
            height: 55px;
        }
        
        .input-select:focus, .input-date:focus, .input-number:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
            outline: none;
        }
        
        .switch-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: var(--primary);
            color: #d31616;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1.4rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            margin-bottom: 8px;
        }
        
        .switch-icon:hover {
            background: var(--secondary);
            transform: rotate(180deg);
        }
        
        .date-passenger-group {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 20px;
            margin-bottom: 20px;
        }
        
  .search-btn {
    background: #eb0a0a;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 17px 25px;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.4);
    cursor: pointer;
    display: flex
;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
 
        .search-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.6);
        }
        
        .search-btn:active {
            transform: translateY(0);
        }
        
        .featured-routes {
            padding: 25px 30px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        
        .featured-routes h3 {
            color: var(--primary);
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }
        
        .routes-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
        }
        
        .route-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e9ecef;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 180px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .route-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.2);
        }
        
        .route-card i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 15px;
        }
        
        .route-info {
            text-align: center;
        }
        
        .route-info .city {
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .route-info .duration {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .route-info .price {
            font-weight: 700;
            color: var(--primary);
            margin-top: 10px;
            font-size: 1.2rem;
        }
        
        .benefits {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 30px;
            margin: 40px 0;
            width: 100%;
            max-width: 1000px;
        }
        
        .benefit-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 200px;
            text-align: center;
        }
        
        .benefit-card i {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 15px;
        }
        
        .benefit-card h4 {
            margin-bottom: 10px;
            color: var(--secondary);
        }

.date-passenger-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.input-group {
  flex: 1 1 100%; /* Full width on mobile */
  display: flex;
  align-items: center;
}

.input-group i {
  margin-right: 0.5rem;
}

/* Responsive: side-by-side on wider screens */
@media (min-width: 600px) {
  .input-group {
    flex: 1 1 30%; /* Each input group gets ~1/3 of the row */
  }
}


.bus-image-container {
    position: absolute;
    top: 31%;
    left: 42%;
    z-index: 99999;
    width: 64vw;
    max-width: 300px;
}

.bus-image-container1 {
    position: absolute;
    top: 27%;
    left: 42%;
    z-index: 99999;
    width: 64vw;
    max-width: 300px;
}

.bus-image-container1 img {
    width: 100%;
    height: auto;
    display: block;
}
.bus-image-container img {
    width: 100%;
    height: auto;
    display: block;
}

/* Tablets and below */
@media (max-width: 1024px) {
    .bus-image-container {
       top: 25%;
        left: 50%;
        transform: translateX(-50%);
        width: 50vw;
    }

   .bus-image-container1 {
        top: 12%;
        left: 50%;
        transform: translateX(-50%);
        width: 50vw;
    }


    
}
@media (max-width: 690px) {
    .bus-image-container {
       top: 26% !important;
        left: 55% !important;
        transform: translate(-50%, -50%);
        width: 40vw;
    }
}
/* Phones */
@media (max-width: 550px) {
      .bus-image-container {
       top: 20% !important;
        left: 67%;
        transform: translateX(-50%);
        width: 70vw;
    }
@media (max-width: 480px) {
    .bus-image-container {
        top: 14% !important;
        left: 67% !important;
        transform: translateX(-50%);
        width: 70vw;
    }
}
      .bus-image-container1 {
        top: 14%;
        left: 67%;
        transform: translateX(-50%);
        width: 70vw;
    }
    .bus-image-container1 img {
    width: 180px;
    height: auto;
    display: block;
}
    .bus-image-container img {
    width: 180px;
    height: auto;
    display: block;
}
}

.trip-fields {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0;
}

/* Style for each input group */
.trip-fields .input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-select {
  flex: 1;
  padding: 0rem;
  font-size: 1rem;
  width: 100%;

  padding-left: 35px;
}

.switch-icon {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;

  
}
.address{
margin-top: 0%;

}
/* Responsive styles */
@media (max-width: 768px) {
.address{
margin-top: -5%;

}

  .trip-fields {
    flex-direction: column;
    align-items: stretch;
  }
.input-select {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    padding-left: 31px;
}
  .switch-icon {
    align-self: center;
    
  }

.switch-icon {
    display: none
;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    background: var(--primary);
    color: #d31616;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.4rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    margin-bottom: 8px;
}

}


 .background-slider {
      position: relative;
      height: 700px;
      overflow: hidden;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      opacity: 0;
      animation: fade 15s infinite;
    }
    
    .video-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      animation: fade 15s infinite;
    }
    
    @keyframes fade {
      0%, 100% { opacity: 0; }
      20%, 80% { opacity: 1; }
    }
    
    .slider-controls {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    }
    
    .slider-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .slider-btn.active {
      background: #fff;
      transform: scale(1.2);
    }
 @media (max-width: 576px) {
      #logo-header-div img {
        max-width: 160px;
      }
      
      .trip-search-box {
        padding: 15px;
      }
      
      .background-slider
 {
        height: 349px !important;
        width: 96% !important;
        max-width: 100%;
        margin: 0 0 1px 7px;
        box-sizing: border-box;
    }
      .bus-image-container {
        top: 14%;
        left: 67%;
        transform: translateX(-50%);
        width: 70vw;
      }
      
      .bus-image-container img {
        width: 180px;
      }
    }
    
    /* Animations */
    .animate__animated {
      animation-duration: 1s;
    }
    
    .fade {
      transition: opacity 0.3s;
    }
    
    .fade:hover {
      opacity: 0.8;
    }
    
    /* Loading spinner */
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
.background-slider {
    position: relative;
    width: 100%;
    height: 67vh;
    overflow: hidden;
}


.slider-content,
.video-slide,
.image-slider,
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slider-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3;
  text-align: center;
}

.video-slide {
  object-fit: cover;
  z-index: 1;
  display: none;
}

.video-overlay {
 
  z-index: 2;
  display: none;
}

.image-slider {
  z-index: 1;
  display: none;
}

.image-slider img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-text {
  position: absolute;
  bottom: 50px;
  left: 50px;
  color: white;
  text-shadow: 1px 1px 4px #000;
  z-index: 3;
}

.slider-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  text-align: center;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;

  /* ✅ Add background image here */
  background-image: url("images/slide/bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Optional: semi-transparent dark overlay on top of the background */
  background-color: rgba(0, 0, 0, 0.5);
  background-blend-mode: overlay;
}
footer > .company-address {
    width: 1100px;
    margin: 0 auto;
    font-family: core-sans-light;
    font-size: .875rem;
    line-height: 1.618;
    color: #fff;
    text-align: center;
    margin: 16px auto;
    font-weight: 400;
}
footer > .social-media-panel > .social-media-list {
        width: 1100px;
        margin: 0 auto;
        padding: 56px 0 0;
        text-align: center;
         margin-top: -3%;
    }

        footer > .social-media-panel > .social-media-list > li {
            display: inline-block
        }

            footer > .social-media-panel > .social-media-list > li > a {
                position: relative;
                top: 0;
                transition: all .3s ease-in-out
            }

                footer > .social-media-panel > .social-media-list > li > a:hover {
                    top: -8px
                }

            footer > .social-media-panel > .social-media-list > li > .social-fb {
                background: #fff;
                height: 50px;
                width: 50px;
                border-radius: 25px;
                position: relative;
                font-size: 1.5rem;
                display: block
            }

                footer > .social-media-panel > .social-media-list > li > .social-fb > i {
                    color: #0a3d52;
                    position: absolute;
                    left: calc(50% - 6px);
                    top: calc(50% - 12px)
                }

    footer .social-media-panel > .social-media-list > li > .social-tweet {
        background: #fff;
        height: 50px;
        width: 50px;
        border-radius: 25px;
        position: relative;
        margin: 0 16px;
        font-size: 1.5rem;
        display: block
    }

    footer > .social-media-panel > .social-media-list > li > .social-tweet > i {
        color: #0a3d52;
        position: absolute;
        left: calc(50% - 10px);
        top: calc(50% - 12px)
    }

    footer > .social-media-panel > .social-media-list > li > .social-ig {
        background: #fff;
        height: 50px;
        width: 50px;
        border-radius: 25px;
        position: relative;
        font-size: 1.5rem;
        display: block
    }

        footer > .social-media-panel > .social-media-list > li > .social-ig > i {
            color: #0a3d52;
            position: absolute;
            left: calc(50% - 11px);
            top: calc(50% - 12px)
        }



footer {
 
  padding: 20px;
  text-align: center;
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}



.copyright {
  list-style: none;
  padding: 0;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}
 @media (max-width: 600px) {
    footer .social-media-panel {
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      text-align: center !important;
    }
    footer #logo-header-div {
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
    }
    footer #logo-header-div img {
      max-width: 120px !important;
      margin: 0 auto !important;
      display: block !important;
    }
    footer .social-media-list {
      flex-direction: row !important;
      gap: 10px !important;
      padding: 0 !important;
      margin: 0 !important;
      justify-content: center !important;
      width: 100% !important;
    }
    footer .footer-contact-info,
    footer .company-address {
      font-size: 13px !important;
      padding: 0 8px !important;
      text-align: center !important;
      align-items: center !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    footer .copyright {
      font-size: 12px !important;
      margin-top: 10px !important;
      text-align: center !important;
      width: 100% !important;
      align-items: center !important;
      display: flex !important;
      flex-direction: column !important;
    }
  }
   @media (max-width: 600px) {
    .footer-contact-info .company-address {
      flex-direction: row !important;
      align-items: center !important;
      display: flex !important;
      gap: 8px !important;
      text-align: left !important;
      justify-content: center !important;
      font-size: 13px !important;
      padding: 0 8px !important;
      width: 100% !important;
    }
    .footer-contact-info .company-address i {
      min-width: 18px;
      font-size: 1.1em;
    }
    .footer-contact-info .company-address span {
      display: inline;
    }
  }


  
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div id="wrapper">
      <div id="container-header">
        <div id="logo-header-div">
          <a href="#">
            <img src="images/logo.png" alt="Solid North ,Inc Logo" />
    
          </a>
        </div>
        
        <div class="mobile-menu-toggle">
          <i class="fas fa-bars"></i>
        </div>
        
        <div id="main-menu">
          <ul>
               <li><div><a href="https://solidnorthinc.com/booking/#/ticket-checker"><i class="fas fa-ticket-alt"></i> Check Booking</a></div></li>
         
            <!-- <li><div><a href="#routes"><i class="fas fa-route"></i> Routes</a></div></li>
            <li><div><a href="#"><i class="fas fa-ticket-alt"></i> Book Tickets</a></div></li>
            <li><div><a href="#"><i class="fas fa-info-circle"></i> About Us</a></div></li>
            <li><div><a href="#"><i class="fas fa-phone"></i> Contact</a></div></li> -->
          </ul>
        </div>
      </div>
    </div>
  </header>
 
  </div>
<div class="background-slider" id="slider">
  <!-- Text Slide -->
  <div class="slider-content">
 
  <h1 class="animate__animated animate__fadeInDown">SOLID NA BYAHE PARA SA’YO!</h1>
  
  <p class="animate__animated animate__fadeInUp">
    Travel with confidence and style as Solid North Transit, Inc. takes you safely to destinations close to your heart in North Luzon.
  </p>
</div>

  <!-- Video Slide -->
  <video class="video-slide" muted loop>
    <source src="images/slide/vid.mp4" type="video/mp4">
  </video>

  <div class="video-overlay"></div>

  <!-- Image Slides -->
  <div class="image-slider">
    <img id="image-display" src="images/slide/img1.jpg" alt="Slide">
    <div class="image-text">
      <h2>Explore North Luzon</h2>
      <p>Ride with comfort and confidence.</p>
    </div>
  </div>
</div>



  <div id="booking"  style="    padding: 6px;    margin-top: -7%;">
    <!-- <div class="bus-image-container1">
    <img src="images/slide-bus.png" alt="Bus Image" />
</div> -->
             <section class="hero animate__animated animate__fadeIn">
       
            <div class="trip-type">
                <input type="radio" name="trip_type" id="oneway" value="oneway" checked>
                <label for="oneway"><i class="fas fa-arrow-right"></i> One Way</label>
                
                <input type="radio" name="trip_type" id="roundtrip" value="roundtrip">
                <label for="roundtrip"><i class="fas fa-exchange-alt"></i> Round Trip</label>
            </div>
            
            <div class="trip-fields">
                <div class="input-group">
                    <i class="fas fa-map-marker-alt"></i>
                    <select id="from_dropdown" class="input-select" required>
                        <option value="" disabled selected>Select origin</option>
                      
                    </select>
                </div>
                
                <div class="switch-icon" id="switch_btn"><i class="fas fa-exchange-alt"></i></div>
                
                <div class="input-group">
                    <i class="fas fa-map-marker-alt"></i>
                    <select id="to_dropdown" class="input-select" required>
                        <option value="" disabled selected>Select destination</option>
                    
                    </select>
                </div>
            </div>
            
            <div class="date-passenger-group">
                <div class="input-group">
                    <i class="far fa-calendar-alt"></i>
                    <input type="date" id="departure_date" class="input-date" required />
                </div>
                
                <div class="input-group" id="return_date_group" style="display: none;">
                    <i class="far fa-calendar-alt"></i>
                    <input type="date" id="return_date" class="input-date" />
                </div>
                
                <div class="input-group">
                    <i class="fas fa-users"></i>
                    <input type="number" id="adult_count" name="adult_count" class="input-number" min="1" max="10" value="1" placeholder="Passengers" />
                </div>
            </div>
            
            <button class="search-btn" id="search_btn">
                <i class="fas fa-search"></i> Search Bus Schedule
            </button>
        </div>
        
        
    </section>



  <!-- Features Section -->
  <section id="container-body">
    <h2 class="section-title">Why Choose Solid North</h2>
        <div class="features">
      <div class="feature-card animate__animated animate__fadeInUp">
        <div class="feature-icon">
    <i class="fas fa-couch"></i>
        </div>
        <h3>COMFORT & CONVENIENT</h3>
        <p>Enjoy spacious seating, air-conditioned buses, and a
smooth, hassle-free journey
whether you're traveling solo
or making memories with your
loved ones.</p>
      </div>
      
      <div class="feature-card animate__animated animate__fadeInUp animate__delay-1s">
        <div class="feature-icon">
         <i class="fas fa-shield-alt"></i>
        </div>
        <h3>SAFETY IS OUR PRIORITY </h3>
        <p>Your safety comes first. Our well-maintained buses and highly
trained drivers ensure a secure
and worry-free journey every time
you travel with us.</p>
      </div>
      
      <div class="feature-card animate__animated animate__fadeInUp animate__delay-2s">
        <div class="feature-icon">
          <i class="fas fa-wifi"></i>    
        </div>
        <h3>ENJOY FREE WIFI AND CHARGE
FOR FREE</h3>
        <p>We offer free Wi-Fi onboard and
USB charger to keep you
connected and powered up
during the trip. </p>
      </div>
      
    </div>
    
   
    <div class="features">
      <div class="feature-card animate__animated animate__fadeInUp animate__delay-2s">
        <div class="feature-icon">
 
 <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="64pt" height="64pt" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#dc000a" stroke="none">
    <path d="M2070 5110 c-710 -70 -1309 -425 -1695 -1005 -211 -319 -329 -666 -366 -1080 -32 -361 52 -787 225 -1140 321 -651 905 -1092 1631 -1228 161 -30 183 -32 395 -31 198 1 243 4 372 27 321 58 601 170 861 344 612 409 978 1067 1004 1803 13 380 -85 793 -269 1134 -299 551 -829 966 -1428 1115 -214 53 -538 80 -730 61z m-681 -977 c64 -145 47 -133 220 -153 l104 -13 -97 -95 -97 -96 20 -122 c12 -67 21 -127 21 -134 0 -6 -53 16 -117 50 l-118 61 -114 -60 c-63 -33 -116 -59 -118 -57 -2 1 7 61 18 132 l22 130 -98 96 -98 95 136 18 136 18 57 134 c31 74 59 131 62 128 3 -3 31 -62 61 -132z m883 95 c26 -66 90 -212 97 -220 6 -7 92 -21 205 -33 l59 -7 -96 -96 -96 -97 19 -100 c11 -55 19 -114 20 -132 l0 -32 -115 60 -115 61 -116 -61 c-64 -34 -118 -60 -119 -59 -1 2 8 62 21 133 l21 130 -93 94 c-52 52 -93 95 -92 96 2 2 61 11 132 21 l130 19 55 133 c31 72 58 132 61 132 3 0 13 -19 22 -42z m979 -135 c46 -104 32 -96 198 -114 l114 -12 -101 -96 -101 -96 20 -110 c10 -60 21 -120 24 -133 5 -21 -5 -17 -113 39 l-118 63 -118 -62 c-117 -62 -118 -62 -112 -34 3 15 12 75 21 134 l16 106 -91 88 c-49 48 -90 90 -90 94 0 3 42 12 93 18 178 24 164 19 182 65 9 23 35 84 58 136 l41 95 18 -45 c11 -24 37 -85 59 -136z m-882 -1073 c69 -32 115 -75 152 -142 31 -57 34 -70 33 -143 0 -64 -5 -89 -23 -125 -42 -80 -79 -117 -151 -154 l-70 -35 55 -11 c87 -18 192 -76 261 -144 34 -34 66 -69 71 -79 8 -16 15 -14 78 18 39 20 99 42 135 49 49 10 60 16 45 21 -145 55 -211 124 -235 251 -40 206 154 399 357 356 74 -15 151 -67 192 -128 113 -172 42 -395 -149 -465 l-64 -23 66 -11 c244 -40 438 -272 438 -526 l0 -66 -652 -4 c-359 -2 -950 -4 -1313 -4 l-660 0 3 75 c5 162 50 268 157 376 80 81 195 144 277 152 26 2 48 8 48 13 0 5 -7 9 -15 9 -29 0 -110 48 -147 87 -58 60 -83 124 -82 213 0 122 61 222 168 278 44 23 63 27 136 27 73 0 92 -4 136 -27 60 -32 112 -86 144 -153 18 -38 24 -66 24 -124 0 -90 -25 -155 -82 -214 -37 -39 -118 -87 -147 -87 -8 0 -15 -4 -15 -9 0 -5 22 -11 50 -15 27 -4 84 -24 127 -46 l77 -39 36 42 c99 117 203 178 345 202 l39 7 -51 17 c-208 71 -284 290 -163 472 32 49 88 92 149 114 56 21 168 18 220 -5z"/>
  </g>
</svg>
      </div>
        <h3>EXCELLENT CUSTOMER CARE</h3>
        <p>Our friendly staff and crew are
always ready to assist you
throughout your journey. </p>
      </div>
      
      <div class="feature-card animate__animated animate__fadeInUp animate__delay-3s">
        <div class="feature-icon">
      <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" style="width: 1.5em; height: 1.5em; vertical-align: middle; fill: #dc000a; overflow: hidden;" viewBox="0 0 1024 1024" version="1.1">
  <path d="M512 1024C229.233778 1024 0 794.766222 0 512S229.233778 0 512 0s512 229.233778 512 512-229.233778 512-512 512z m190.549333-395.818667c-37.191111-23.893333-102.257778 13.269333-102.257777 13.269334h-92.942223c-1.336889-136.760889-111.544889-235.036444-143.416889-258.090667-6.784-4.906667-15.416889-6.058667-24.746666-5.034667l-3.911111-15.274666c3.171556-1.464889 6.343111-2.958222 9.6-4.408889 37.290667-16.440889 46.933333-54.471111 12.088889-90.552889-20.707556-21.432889-61.795556-13.326222-89.955556 16.113778-28.16 29.44-33.564444 69.973333-12.046222 90.567111 10.766222 10.282667 24.234667 10.24 39.495111 5.632l3.214222 12.515555a283.235556 283.235556 0 0 0-37.319111 24.120889s-2.659556 13.283556 19.911111 49.137778c22.584889 35.84 90.737778 268.316444 114.204445 296.120889 16.824889 19.939556 375.808 0 375.808 0s11.946667-33.194667 11.946666-62.407111-42.496-47.815111-79.672889-71.708445zM640 256c-78.222222 0-142.222222 64-142.222222 142.222222s64 142.222222 142.222222 142.222222 142.222222-64 142.222222-142.222222-64-142.222222-142.222222-142.222222z m62.222222 167.111111H632.888889c-4.451556 0-8.007111-1.777778-10.666667-4.451555a16.398222 16.398222 0 0 1-4.451555-10.666667v-69.333333c0-8.888889 7.111111-15.104 15.118222-15.104 8.888889 0 15.118222 7.111111 15.118222 15.118222v54.215111h54.215111c8.888889 0 15.118222 7.111111 15.118222 15.118222 0 7.992889-6.229333 15.104-15.118222 15.104z"/>
</svg>
        </div>
        <h3>RESERVE A SEAT & MAKE CHANGES</h3>
        <p>Reserve your favorite seat when you book a ticket and easily manage your trip details online. </p>
      </div>
      
    
    </div>
    
   
      
     
    </div>
  </section>
    <footer>
  <div class="social-media-panel" style="display: flex; flex-direction: column; align-items: center;">
    <div id="logo-header-div" style="margin-bottom: 16px;">
      <a href="#">
        <img src="images/PSNTINEW overlayed.png" alt="Solid North ,Inc Logo" style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
      </a>
    </div>
    <ul class="social-media-list" style="display: flex; gap: 16px; justify-content: center; padding: 0; margin: 0;">
      <li style="list-style: none;">
        <a href="https://www.facebook.com/share/1F7W42jhaQ/" target="_blank" class="social-fb" rel="nofollow noopener noreferrer" style="display: flex; align-items: center; justify-content: center;">
          <i class="fab fa-facebook-f"></i>
        </a>
      </li>
      <li style="list-style: none;">
        <a href="https://www.tiktok.com/@solidnorthph?_t=ZS-8x1wgTl92EK&_r=1" target="_blank" class="social-tweet" rel="nofollow noopener noreferrer" style="display: flex; align-items: center; justify-content: center;">
          <i class="fab fa-tiktok"></i>
        </a>
      </li>
      <li style="list-style: none;">
        <a href="https://www.instagram.com/solidnorthbus?igsh=enIyYmlnbG11Nm43" target="_blank" class="social-ig" rel="nofollow noopener noreferrer" style="display: flex; align-items: center; justify-content: center;">
          <i class="fab fa-instagram"></i>
        </a>
      </li>
    </ul>
  </div>
  <div class="footer-contact-info" style="display: flex; flex-direction: column; align-items: center; margin-top: 16px;">
    <p class="company-address" style="display: flex; align-items: center; gap: 8px;">
      <i  class="address fas fa-map-marker-alt"></i>
      <span style="text-align:center ">676 Epifanio de los Santos Ave, Cubao, Quezon City,  Metro Manila</span>
    </p>
    <p class="company-address" style="display: flex; align-items: center; gap: 8px;">
      <i class="fas fa-phone"></i>
      <span>+63 917 886 6784</span>
    </p>
    <p class="company-address" style="display: flex; align-items: center; gap: 8px;">
      <i class="fas fa-envelope"></i>
      <span>info@solidnorthinc.com</span>
    </p>
    <p class="company-address" style="display: flex; align-items: center; gap: 8px;">
      <i class="fas fa-clock"></i>
      <span>Customer Service: 24/7</span>
    </p>
  </div>
  <ul class="copyright" style="display: flex; flex-direction: column; align-items: center; margin: 16px 0 0 0; padding: 0;">
    <li style="list-style: none; color:#fff;">&copy; 2025 Solid North, Inc. All rights reserved.</li>
  </ul>
 

  </footer>
  </div>
  <script>
    $(document).ready(function() {
    
      
      // Set min date for date inputs
      const today = new Date().toISOString().split('T')[0];
      $("#departure_date").attr('min', today);
      $("#return_date").attr('min', today);
      
      // Toggle return date input based on trip type
       $('input[name="trip_type"]').change(function() {
    if ($(this).val() === 'roundtrip') {
      $('#return_date_group').show();
    } else {
      $('#return_date_group').hide();
      $('#return_date').val('');
    }
  });
      
      // Search button functionality
    });


$(document).ready(function() {
  // Utility to format date YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default dates
  const today = new Date();
const tomorrow = new Date(today); // clone today's date
tomorrow.setDate(today.getDate() + 1);


  const nextWeek = new Date();
  nextWeek.setDate(today.getDate());

  $('#departure_date').val(formatDate(tomorrow ));
  $('#departure_date').attr('min', formatDate(tomorrow ));
  $('#return_date').val(formatDate(nextWeek));
  $('#return_date').attr('min', formatDate(nextWeek));

  // Initially hide return date if not roundtrip
  if ($('input[name="trip_type"]:checked').val() !== 'roundtrip') {
    $('#return_date').hide();
  }

  // Load origins into from_dropdown on page load
  $.ajax({
    url: 'https://solidnorthinc.com/v1_api.php',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      const fromDropdown = $('#from_dropdown');
      fromDropdown.empty();

      if (!data.locations || !Array.isArray(data.locations)) {
        fromDropdown.append('<option disabled>No locations found</option>');
        fromDropdown.prop('disabled', true);
        return;
      }

      fromDropdown.append('<option disabled selected>Select origin</option>');
      data.locations.forEach(function(location) {
        fromDropdown.append($('<option>', { value: location, text: location }));
      });
      fromDropdown.prop('disabled', false);
    },
    error: function() {
      $('#from_dropdown').empty().append('<option disabled>Failed to load options</option>').prop('disabled', true);
    }
  });

  // Load destinations when origin changes
  $('#from_dropdown').change(function() {
    const selectedOrigin = $(this).val();
    const toDropdown = $('#to_dropdown');

    if (!selectedOrigin) {
      toDropdown.empty().append('<option disabled selected>Select destination</option>').prop('disabled', true);
      return;
    }

    toDropdown.empty().append('<option disabled>Loading destinations...</option>').prop('disabled', true);

    $.ajax({
      url: 'https://solidnorthinc.com/api.php',
      method: 'GET',
      dataType: 'json',
      data: { destination: selectedOrigin },
      success: function(data) {
        toDropdown.empty();

        if (!data.locations || !Array.isArray(data.locations) || data.locations.length === 0) {
          toDropdown.append('<option disabled>No destinations found</option>');
          toDropdown.prop('disabled', true);
          return;
        }

        toDropdown.append('<option disabled selected>Select destination</option>');
        data.locations.forEach(function(location) {
          toDropdown.append($('<option>', { value: location, text: location }));
        });

        toDropdown.prop('disabled', false);
      },
      error: function() {
        toDropdown.empty().append('<option disabled>Failed to load destinations</option>').prop('disabled', true);
      }
    });
  });

  // Toggle return date visibility based on trip type
  $('input[name="trip_type"]').change(function() {
    if ($(this).val() === 'roundtrip') {
      $('#return_date').show();
    } else {
      $('#return_date').hide().val('');
    }
  });

  // Route card click to select from/to
  $('.route-card').click(function() {
    const from = $(this).data('from');
    const to = $(this).data('to');

    $('#from_dropdown').val(from).trigger('change'); // trigger to load destinations
    // Wait a bit before setting to_dropdown value, to ensure options are loaded
    setTimeout(() => {
      $('#to_dropdown').val(to);
    }, 300);

    $('.route-card').css('border-color', '#e9ecef');
    $(this).css('border-color', '#4361ee');
  });

  // Switch from and to dropdowns and update destinations
  $('#switch_btn').click(function() {
    const fromDropdown = $('#from_dropdown');
    const toDropdown = $('#to_dropdown');

    // Swap values
    const temp = fromDropdown.val();
    fromDropdown.val(toDropdown.val());
    toDropdown.val(temp);

    // Trigger change to reload destinations for new origin
    fromDropdown.trigger('change');
      toDropdown.trigger('change');
  });

  // Search button click
  $('#search_btn').on('click', function() {
    const $btn = $(this);
    $btn.prop('disabled', true);

    const type = $('input[name="trip_type"]:checked').val();
    const origin = $('#from_dropdown').val();
    const dest = $('#to_dropdown').val();
    const dep = $('#departure_date').val();
    const ret = $('#return_date').val();
    const pas = $('#adult_count').val();

    if (!origin || !dest || !dep || (type === 'roundtrip' && !ret)) {
      alert('Please fill all required fields.');
      $btn.prop('disabled', false);
      return;
    }

    const url = type === 'roundtrip' ?
      `https://solidnorthinc.com/booking/#/trips?way=false&ori=${encodeURIComponent(origin)}&des=${encodeURIComponent(dest)}&dep=${encodeURIComponent(dep)}&ret=${encodeURIComponent(ret)}&pas=${encodeURIComponent(pas)}` :
      `https://solidnorthinc.com/booking/#/trips?way=true&ori=${encodeURIComponent(origin)}&des=${encodeURIComponent(dest)}&dep=${encodeURIComponent(dep)}&pas=${encodeURIComponent(pas)}`;

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  });
});


  </script>
  
<script>
     document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.getElementById("main-menu");

    toggle.addEventListener("click", function () {
      menu.classList.toggle("active");
    });
  });
  document.addEventListener("DOMContentLoaded", function () {
    const sliderContent = document.querySelector(".slider-content");
    const video = document.querySelector(".video-slide");
    const overlay = document.querySelector(".video-overlay");
    const imageSlider = document.querySelector(".image-slider");
    const imageDisplay = document.getElementById("image-display");

    const imageList = Array.from({ length: 8 }, (_, i) => `images/slide/img${i + 1}.jpg`);
    let currentImageIndex = 0;
    let imageInterval;

    function showTextSlide() {
      sliderContent.style.display = "flex";
      video.style.display = "none";
      overlay.style.display = "none";
      imageSlider.style.display = "none";

      setTimeout(showVideoSlide, 10000); // Show text for 5s
    }

    function showVideoSlide() {
      sliderContent.style.display = "none";
      video.style.display = "block";
      overlay.style.display = "block";
      imageSlider.style.display = "none";

      video.currentTime = 0;
      video.play();

      setTimeout(showImageSlider, 103000); // Play video for 1m 43s
    }

    function showImageSlider() {
      sliderContent.style.display = "none";
      video.style.display = "none";
      overlay.style.display = "none";
      imageSlider.style.display = "block";

      currentImageIndex = 0;
      imageDisplay.src = imageList[currentImageIndex];

      imageInterval = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % imageList.length;
        imageDisplay.src = imageList[currentImageIndex];
      }, 3000); // Change image every 3s

      setTimeout(() => {
        clearInterval(imageInterval);
        showTextSlide(); // Restart loop
      }, imageList.length * 3000); // After all images shown
    }

    // Start cycle
    showTextSlide();
  });
</script>





</body>
</html>