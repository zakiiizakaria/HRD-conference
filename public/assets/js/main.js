/* global $, WOW */

$(function() {
    
    //===== Prealoder
    
    $(window).on('load', function(event) {
        $('.preloader').delay(500).fadeOut(500);
    });
    
    
    //===== Sticky
    
    $(window).on('scroll', function(event) {    
        const scroll = $(window).scrollTop();
        if (scroll < 10) {
            $(".navbar-area").removeClass("sticky");
        } else{
            $(".navbar-area").addClass("sticky");
        }
    });
    
    
    //===== close navbar-collapse when a  clicked
    
    $(".navbar-nav a").on('click', function () {
        $(".navbar-collapse").removeClass("show");
    });
    
    
    //===== Section Menu Active

    const scrollLink = $('.page-scroll');
        // Active link switching
        $(window).scroll(function() {
        const scrollbarLocation = $(this).scrollTop();

        scrollLink.each(function() {
          const $target = $(this.hash);
          
          // Only proceed if the target element exists
          if ($target.length) {
            const sectionOffset = $target.offset().top - 73;

            if ( sectionOffset <= scrollbarLocation ) {
              $(this).parent().addClass('active');
              $(this).parent().siblings().removeClass('active');
            }
          }
        });
    });
    
    
    //===== Mobile Menu
    
    $(".navbar-toggler").on('click', function(){
        $(this).toggleClass("active");
    });
    
    $(".navbar-nav a").on('click', function() {
        $(".navbar-toggler").removeClass('active');
    });
    
    
    //===== Countdown
    
    $('[data-countdown]').each(function() {
        // Calculate end of current month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // JavaScript months are 0-indexed
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextMonthYear = month === 12 ? year + 1 : year;
        const endOfMonth = new Date(nextMonthYear, nextMonth - 1, 0); // Last day of current month
        
        // Format the date as YYYY/MM/DD
        const formattedDate = `${endOfMonth.getFullYear()}/${endOfMonth.getMonth() + 1}/${endOfMonth.getDate()}`;
        
        // Set the countdown date dynamically
        $(this).attr('data-countdown', formattedDate);
        
        const $this = $(this), finalDate = $(this).data('countdown');
        $this.countdown(finalDate, function(event) {
            $this.html(event.strftime('<div class="header-countdown pt-70 d-flex justify-content-center"><div class="single-count-content count-color-1"><span class="count">%D</span><p class="text">Days</p></div><div class="single-count-content count-color-2"><span class="count">%H</span><p class="text">Hours</p></div><div class="single-count-content count-color-3"><span class="count">%M</span><p class="text">Minutes</p></div><div class="single-count-content count-color-4"><span class="count">%S</span><p class="text">Seconds</p></div></div>'));
        });
    });
    
    
    //===== WOW
    
    new WOW().init();
    
    
    
    //===== Counter Up
    
    $('.counter').counterUp({
        delay: 10,
        time: 2000
    });
    
    
    $('.client-active').slick({
        dots: false,
        arrows: false,
        infinite: true,
        autoplay: true,
        speed: 800,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 3,
              }
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 2,
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 2,
              }
            },
            {
              breakpoint: 576,
              settings: {
                slidesToShow: 1,
              }
            }
        ]
        });
    
    
    //===== Back to top
    
    // Show or hide the sticky footer button
    $(window).on('scroll', function(event) {
        if($(this).scrollTop() > 600){
            $('.back-to-top').fadeIn(200)
        } else{
            $('.back-to-top').fadeOut(200)
        }
    });
    
    
    //Animate the scroll to yop
    $('.back-to-top').on('click', function(event) {
        event.preventDefault();
        
        $('html, body').animate({
            scrollTop: 0,
        }, 1500);
    });
});