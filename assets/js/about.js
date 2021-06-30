'use strict';

/* About */

function about() {
    window.scrollTo(0, 0); // Scroll page to top

    if (window.getComputedStyle(document.querySelector('#section-about')).display !== 'block') {
        window.scrollTo(0, 0); // Scroll page to top
        // Reset
        const columns = document.querySelectorAll('.about-column');

        for (let x = 0; x < columns.length; x++) {
            columns[x].style.opacity = 0;
        }

        showSection();

        // Fade in
        setTimeout(() => {
            document.querySelector('#about-text').style.opacity = 1;

            setTimeout(() => {
                document.querySelector('#about-image').style.opacity = 1;
            }, 250);
        }, 100); // Wait for display change

        // Update meta
        document.querySelector('title').textContent = 'Craig & Karl - About';
        document.querySelector('meta[name="description"]').setAttribute('content', 'Hi, we\'re Craig & Karl, we live in different parts of the world (New York and London) but collaborate daily to create bold, bright and often humorous work. We work in a variety of mediums from illustration through to installations. We\'ve had work exhibited around the world, most notably at the Musée de la Publicité (Paris), Onassis Cultural Centre (Athens), Museum for Contemporary Art (Mexico) and the Museum of the Moving Image (New York) and we\'ve worked on projects for clients like LVMH, Google, Nike, Apple, Vogue, Vanity Fair, The Washington Post and The New York Times.');
    }
}