"use strict";

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
    // Resize
    window.addEventListener('resize', () => {
        if (! window.touchScreen) {
            responsiveAbout();
        }
    });

    responsiveAbout();
});

/* Responsive */

function responsiveAbout() {
    if (window.innerWidth < 768) { // Mobile
        var columns = document.querySelectorAll('.about-column');

        for (let x = 0; x < columns.length; x++) {
            columns[x].style.width = 'calc(100% - 64px)';
        }
    } else { // DT
        var columns = document.querySelectorAll('.about-column');

        for (let x = 0; x < columns.length; x++) {
            columns[x].style.width = '';
        }
    }
}

/* About */

function aboutLoad() {
    showSection();

    if (window.id) {
        hideProject();
    }

    // Fade in
    const rply = new Ripley(document.querySelector('#about-text'));
    rply.animate('opacity', '1', {speed: 0.5, ease: 'linear'});
    const rply2 = new Ripley(document.querySelector('#about-image'));
    rply2.animate('opacity', '1', {speed: 0.5, ease: 'linear', delay: 0.5});

    document.querySelector('title').textContent = 'Craig & Karl - About'; // Set page title
    const description = document.querySelector('meta[name="description"]');
    description.setAttribute('content', 'Hi, we\'re Craig & Karl, we live in different parts of the world (New York and London) but collaborate daily to create bold, bright and often humorous work. We work in a variety of mediums from illustration through to installations. We\'ve had work exhibited around the world, most notably at the Musée de la Publicité (Paris), Onassis Cultural Centre (Athens), Museum for Contemporary Art (Mexico) and the Museum of the Moving Image (New York) and we\'ve worked on projects for clients like LVMH, Google, Nike, Apple, Vogue, Vanity Fair, The Washington Post and The New York Times.');
}