'use strict';

/* Global vars */

window.touchScreen = false;
window.craigClock;
window.karlClock;
window.prismicMasterRef;

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
    window.touchScreen = matchMedia('(hover: none)').matches; // Detect mobile
    setEventsGlobal(); // Mouse and keyboard

    // Scroll
    window.addEventListener('scroll', () => {
        //window.pageYOffset;
    });

    // Resize
    window.addEventListener('resize', () => {

    });

    document.querySelector('html').style.visibility = 'visible'; // Hack to avoid FOUC
    start();
});

/* Mouse and keyboard events */

function setEventsGlobal() {
    // Header
    document.querySelector('h1').addEventListener('click', () => {
        history.pushState(null, null, '.');
    });

    document.querySelector('#burger').addEventListener('click', () => {
        toggleNav();
    });
}

/* Start */

async function start() {
    // Clocks
    setInterval(() => {
        setClock('craig', 'America/New_York');
        setClock('karl', 'Europe/London');
    }, 1000); // Update every 1 sec

    setClock('craig', 'America/New_York');
    setClock('karl', 'Europe/London');

    // Prismic
    const json = await getData('https://craigandkarlcom.cdn.prismic.io/api/v2'); // Get master ref
    window.prismicMasterRef = json.refs[0].ref;
    await projectsGetAll(1);

    // Pattern
    let patrn = new Pattern();
    patrn.init();
}

/* Global */

function navClick(section) {
    history.pushState(null, null, section);

    if (window.innerWidth <= 768) {
        toggleNav();
    }
}

async function getData(path) {
    const data = await fetch(path, {
        method: 'get'
    })
    .then((response) => {
        return response.json();
    }).catch((error) => {
        console.log(error);
    });

    return data;
}

function resetMeta() {
    document.querySelector('title').textContent = 'Craig & Karl'; // Set page title
    document.querySelector('meta[name="description"]').setAttribute('content', 'Hi, we\'re Craig & Karl, we live in different parts of the world (New York and London) but collaborate daily to create bold, bright and often humorous work.');
}

function patternChange() {
    projectsLoad();
}

/* Header */

function toggleNav() {
    const nav = document.querySelector('nav');

    if (! nav.style.bottom) {
        nav.style.bottom = 0;
        nav.style.opacity = 1;
    } else {
        nav.style.bottom = '';
        nav.style.opacity = '';
    }
}

function setClock(person, timezone) {
    const now = moment.tz(timezone);
    const hour = parseFloat(now.format('HH'));
    const clock = document.querySelector('#clock-' + person);
    clock.querySelector('span.clock-day').textContent = now.format('dddd'); // Day
    clock.querySelector('span.clock-date').textContent = now.format('D MMM YYYY'); // Date
    clock.querySelector('span.clock-status').style.backgroundColor = hour > 8 && hour < 17 ? '#246318' : ''; // Is online (9 - 5)

    // Clockface
    clock.querySelector('.clockface').style.backgroundImage = hour < 6 || hour >= 18 ? 'url(assets/img/face_night.png)' : ''; // Is night (6 - 6)
    const rotationSecs = now.seconds() * 6;
    const rotationMins = now.minutes() * 6 + rotationSecs / 60;
    const rotationHours = ((now.hours() % 12) / 12) * 360 + 90 + rotationMins / 12;
    clock.querySelector('.clockface-hour').style.transform = `rotate(${ rotationHours }deg)`;
    clock.querySelector('.clockface-minute').style.transform = `rotate(${ rotationMins }deg)`;
    clock.querySelector('.clockface-second').style.transform = `rotate(${ rotationSecs }deg)`;

    // Image
    var rand = Math.floor(Math.random() * 3) + 1; // 1 - 3
    const initial = person.toUpperCase().charAt(0);
    const day = now.format('dddd');
    const personHour = window[person + 'Clock'];

    if (day === 'Saturday' || day === 'Sunday') {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/weekend-${ initial }.gif`);
    } else if (hour === 8 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/08-${ rand }.gif`);
    } else if (hour === 9 && personHour !== hour) {
        rand = (Math.floor(Math.random() * 2) + 1); // 1 - 2
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/09-${ rand }-${ initial }.gif`);
    } else if (hour === 10 || hour === 16 || hour === 19) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/${ hour }-${ initial }.gif`);
    } else if (hour === 11 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/11-${ rand }-${ initial }.gif`);
    } else if (hour === 12) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/12.gif');
    } else if (hour >= 13 && hour < 16 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/13-15-${ rand }-${ initial }.gif`);
    } else if (hour >= 17 && hour < 19 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/17-18-${ rand }-${ initial }.gif`);
    } else if (hour >= 20 && hour < 22 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/20-21-${ rand }.gif`);
    } else if (hour >= 22 && hour < 24 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/22-23-${ rand }-${ initial }.gif`);
    } else if (personHour !== hour) {
        clock.querySelector('img').setAttribute('src', `assets/img/clocks/24-07-${ rand }.gif`);
    }

    window[person + 'Clock'] = hour; // Prevent image changing every second
}

/* Sections */

function showSection() {
    setTimeout(() => {
        window.scrollTo(0, 0); // Scroll page to top
    }, 100); // Wait for display change

    const sections = document.querySelectorAll('.section');

    // Loop all sections and reset
    for (let x = 0; x < sections.length; x++) {
        sections[x].style.display = '';
    }

    document.querySelector('#section-' + window.pattern).style.display = 'block'; // Show section
    setNav();
}

function setNav() {
    const nav = document.querySelector('nav');
    const navItems = nav.querySelectorAll('a');

    // Loop all nav items and reset
    for (let x = 0; x < navItems.length; x++) {
        navItems[x].style.color = '';
    }

    nav.querySelector('a#nav-' + window.pattern).style.color = '#FFCD00'; // Set colour of selected nav item
}