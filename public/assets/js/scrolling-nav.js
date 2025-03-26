
//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {

    $('a.page-scroll[href*="#"]:not([href="#"])').on('click', function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                // Jump directly to the section without animation
                window.scrollTo(0, target.offset().top - 70);
                return false;
            }
        }
    });

});
