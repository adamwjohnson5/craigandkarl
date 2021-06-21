"use strict";

/* Global vars */

var touchScreen = false;
var resizeTimerGlobal;
var craigClock;
var karlClock;
var prismicMasterRef;
var homeProjects;
var allProjects = [];

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
    // Detect mobile
    window.addEventListener('touchstart', () => {
        document.querySelector('body').classList.remove('no-touch');
        window.touchScreen = true;
    });

    // Mouse and keyboard
    setEventsGlobal();

    // Scroll
    window.addEventListener('scroll', () => {
        //window.pageYOffset;
    });

    // Resize
    window.addEventListener('resize', () => {
        if (! window.touchScreen) {
            responsiveGlobal();
        }
    });

    responsiveGlobal();

    // Start app
    setTimeout(() => {
        start();
    }, 500); // Short delay
});

/* Responsive */

function responsiveGlobal() {
    const windowWidth = window.innerWidth;
    const header = document.querySelector('header');

    if (windowWidth < 768) { // Mobile
        // Header
        document.querySelector('nav').style.display = 'none';
        document.querySelector('#header-clocks').style.display = 'none';
        header.style.height = '120px';
    } else { // DT
        if (windowWidth < 1280) {
            document.querySelector('#header-clocks').style.display = 'none';
        } else if (! window.id) { // Check if project open
            document.querySelector('#header-clocks').style.display = '';
        }

        // Header
        if (! window.id) { // Check if project open
            header.style.height = '';
        }

        resetMobileNav();

        if (window.section) {
            setNav();
        }
    }

    // On resize finish
    clearTimeout(window.resizeTimerGlobal);

    window.resizeTimerGlobal = setTimeout(() => {

    }, 250);
}

/* Mouse and keyboard events */

function setEventsGlobal() {

}

/* Start */

async function start() {
    checkOldSiteURL();

    // Clocks
    setInterval(() => {
        setClock('craig', 'America/New_York');
        setClock('karl', 'Europe/London');
    }, 1000); // Every 1 sec

    setClock('craig', 'America/New_York');
    setClock('karl', 'Europe/London');

    window.prismicMasterRef = await getPrismicData(''); // Get master ref from Prismic
    window.homeProjects = await getPrismicData('/documents/search?ref=' + window.prismicMasterRef + '&q=[[at(document.id,"Xm8MJhQAACMAnn-L")]]');
    await getAllProjects(1);

    // Show header
    const rply = new Ripley(document.querySelector('header'));
    rply.animate('top', '0px', {speed: 0.25, ease: 'ease-out'});

    setTimeout(() => {
        Pattern.init(); // Initialize Pattern
        loadProjectThumbs(); // Start project thumbs
    }, 250);
}

/* Global */

async function getAllProjects(page) {
    const projects = await getPrismicData('/documents/search?ref=' + window.prismicMasterRef + '&q=[[at(document.type,"project")]]&pageSize=100&page=' + page);

    // Loop results and push into array
    for (let x = 0; x < projects.length; x++) {
        window.allProjects.push(projects[x]);
    }

    // Next page
    if (projects.length === 100) {
        await getAllProjects(page + 1);
    }
}

async function getPrismicData(path) {
    const apiData = await fetch('https://craigandkarlcom.cdn.prismic.io/api/v2' + path, {
        method: 'get'
    }).then((response) => {
        return response.json();
    }).then((data) => {
        var json = data;

        if (! path) { // Master ref
            json = json.refs[0].ref;
        } else if (path.indexOf('document.id') !== -1) { // Home projects
            json = json.results[0].data.body[0].items;
        } else { // All projects
            json = json.results;
        }

        return json;
    }).catch((error) => {
        console.log(error);
    });

    return apiData;
}

function setClock(person, timezone) {
    const now = moment.tz(timezone);
    const clock = document.querySelector('#clocks-' + person);
    const hour = parseFloat(now.format('HH'));

    // Text
    clock.querySelector('span.clocks-day').textContent = now.format('dddd');
    clock.querySelector('span.clocks-date').textContent = now.format('D MMM YYYY');

    // Status
    if (hour > 8 && hour < 17) { // Is online (9 - 5)
        clock.querySelector('.clocks-status').style.backgroundColor = '#246318';
    } else {
        clock.querySelector('.clocks-status').style.backgroundColor = '';
    }

    // Clock face
    if (hour < 6 || hour >= 18) { // Is night (6 - 6)
        clock.querySelector('.clock').style.backgroundImage = 'url(assets/img/face_night.png)';
    } else {
        clock.querySelector('.clock').style.backgroundImage = '';
    }

    // Time
    const rotationSecs = (now.seconds() * 6);
    const rotationMins = (now.minutes() * 6 + rotationSecs / 60);
    const rotationHours = (((now.hours() % 12) / 12) * 360 + 90 + rotationMins / 12);
    clock.querySelector('.hour').style.transform = 'rotate(' + rotationHours + 'deg)';
    clock.querySelector('.minute').style.transform = 'rotate(' + rotationMins + 'deg)';
    clock.querySelector('.second').style.transform = 'rotate(' + rotationSecs + 'deg)';

    // Image
    var rand = (Math.floor(Math.random() * 3) + 1); // 1 - 3
    const initial = person.toUpperCase().charAt(0);
    const day = now.format('dddd');
    const personHour = window[person + 'Clock'];

    if (day === 'Saturday' || day === 'Sunday') {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/weekend-' + initial + '.gif');
    } else if (hour === 8 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/08-' + rand + '.gif');
    } else if (hour === 9 && personHour !== hour) {
        rand = (Math.floor(Math.random() * 2) + 1); // 1 - 2
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/09-' + rand + '-' + initial + '.gif');
    } else if (hour === 10) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/10-' + initial + '.gif');
    } else if (hour === 11 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/11-' + rand + '-' + initial + '.gif');
    } else if (hour === 12) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/12.gif');
    } else if (hour >= 13 && hour < 16 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/13-15-' + rand + '-' + initial + '.gif');
    } else if (hour === 16) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/16-' + initial + '.gif');
    } else if (hour >= 17 && hour < 19 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/17-18-' + rand + '-' + initial + '.gif');
    } else if (hour === 19) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/19-' + initial + '.gif');
    } else if (hour >= 20 && hour < 22 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/20-21-' + rand + '.gif');
    } else if (hour >= 22 && hour < 24 && personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/22-23-' + rand + '-' + initial + '.gif');
    } else if (personHour !== hour) {
        clock.querySelector('img').setAttribute('src', 'assets/img/clocks/24-07-' + rand + '.gif');
    }

    window[person + 'Clock'] = hour; // Prevent image changing every second
}

function showSection() {
    const section = document.querySelector('#section-' + window.section);

    if (section.style.display !== 'block') {
        window.scrollTo(0, 0); // Scroll page to top
    }

    const sections = document.querySelectorAll('section');

    // Loop all sections
    for (let x = 0; x < sections.length; x++) {
        // Reset
        sections[x].style.display = '';
        sections[x].style.opacity = '';
    }

    section.style.display = 'block'; // Show section

    // Nav
    if (window.innerWidth >= 768) { // DT
        setNav();
    } else { // Mobile
        document.querySelector('nav').style.display = 'none';
    }
}

function setNav() {
    const nav = document.querySelector('nav');
    const navItems = nav.querySelectorAll('a');

    // Loop all nav items
    for (let x = 0; x < navItems.length; x++) {
        navItems[x].style.color = '';
    }

    nav.querySelector('a#nav-' + window.section).style.color = '#FFCD00'; // Set color of selected nav item
}

function navClick(section) {
    history.pushState(null, null, section);
}

function showMobileNav() {
    const nav = document.querySelector('nav');

    if (nav.style.display === 'none') { // Show
        nav.style.opacity = 0;
        nav.style.backgroundColor = '#FFCD00';
        nav.style.width = '100%';
        nav.style.height = 'calc(100% - 48px)';
        nav.style.position = 'fixed';
        nav.style.paddingTop = '48px';
        nav.style.top = '0';
        nav.style.display = '';
        const navItems = nav.querySelectorAll('a');

        // Loop all nav items
        for (let x = 0; x < navItems.length; x++) {
            let item = navItems[x];
            item.style.color = '#000';
            item.style.float = 'none';
            item.style.display = 'block';
            item.style.fontSize = '30px';
            item.style.marginBottom = '16px';
            item.style.fontFamily = '\'GothamBook\', sans-serif';
        }

        // Fade in
        const rply = new Ripley(nav);
        rply.animate('opacity', '1', {ease: 'linear'});
    } else { // Hide
        nav.style.display = 'none';
    }
}

function resetMobileNav() {
    const nav = document.querySelector('nav');
    nav.style.backgroundColor = '';
    nav.style.width = '';
    nav.style.height = '';
    nav.style.position = '';
    nav.style.paddingTop = '';
    nav.style.top = '';

    if (! window.id) { // Check if project open
        nav.style.display = '';
    }

    const navItems = nav.querySelectorAll('a');

    // Loop all nav items
    for (let x = 0; x < navItems.length; x++) {
        let item = navItems[x];
        item.style.color = '';
        item.style.float = '';
        item.style.display = '';
        item.style.fontSize = '';
        item.style.marginBottom = '';
        item.style.fontFamily = '';
    }
}

function checkOldSiteURL() {
    const url = window.location.href;

    if (url.indexOf('#/') !== -1 || url.indexOf('#!') !== -1) {
        // Redirect old site URL
        window.location = '/';
    }
}