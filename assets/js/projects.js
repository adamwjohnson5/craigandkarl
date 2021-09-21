'use strict';

/* Global vars */

window.projects = [];
window.homeProjects = [];
window.projectID;

/* Projects */

async function home() {
    if (window.getComputedStyle(document.querySelector('#section-home')).display !== 'block') {
        // Only load thumbs once
        if (document.querySelector('#project-thumbs').childElementCount === 0) {
            projectsLoadThumbs();
        }

        showSection();
        resetMeta();
    }
}

async function projectsGetAll(page) {
    const json = await getData('https://craigandkarlcom.cdn.prismic.io/api/v2/documents/search?ref=' + window.prismicMasterRef + '&q=[[at(document.type,"project")]]&pageSize=100&page=' + page);
    const projects = json.results;

    // Loop results and push into global array
    for (let x = 0; x < projects.length; x++) {
        window.projects.push(projects[x]);
    }

    // Next page
    if (projects.length === 100) {
        await projectsGetAll(page + 1);
    }
}

async function projectsGetData(id) {
    var data;

    // Search
    window.projects.filter(function(project) {
        if (project.id === id) {
            data = project;
        }
    });

    return data;
}

async function projectsLoadThumbs() {
    const json = await getData('https://craigandkarlcom.cdn.prismic.io/api/v2/documents/search?ref=' + window.prismicMasterRef + '&q=[[at(document.id,"Xm8MJhQAACMAnn-L")]]');
    window.homeProjects = json.results[0].data.body[0].items;
    var thumbs = '';

    // Loop all home projects
    for (let x = 0; x < window.homeProjects.length; x++) {
        let projectID = window.homeProjects[x].project.id;
        let project = await projectsGetData(projectID);
        let title = project.data.title[0].text;
        var subTitle = project.data.subtitle[0];
        subTitle = subTitle ? subTitle.text : '';
        thumbs += `<div onclick="history.pushState(null, null, '${ project.slugs[0] }?id=${ projectID }');" class="project-thumb" id="project-thumb-${ x + 1 }"><img src="" data-url="${ project.data.hero.url }" alt="${ title }" /><div class="thumb-hover"><div class="thumb-text"><p>${ title }<span>${ subTitle }</span></p></div></div></div>`;
    }

    document.querySelector('#project-thumbs').innerHTML = thumbs; // Add to DOM
    projectsShowThumb(1); // Fade in first thumb
}

function projectsShowThumb(count) {
    const thumb = document.querySelector('#project-thumb-' + count).querySelector('img');

    thumb.addEventListener('load', () => {
        thumb.style.opacity = 1; // Fade in

        // Show next thumb if not last
        if (count !== window.homeProjects.length) {
            setTimeout(() => {
                projectsShowThumb(count + 1);
            }, 100); // Short delay
        }
    });

    const dataURL = thumb.getAttribute('data-url');
    const imageSize = window.innerWidth > 768 ? 960 : 640; // Smaller res for mobile
    thumb.setAttribute('src', `${ dataURL }&w=${ imageSize }&h=${ imageSize }`);
}

/* Project */

async function projectsLoad() {
    if (window.id) {
        // Ignore project slug
        window.pattern = 'home';
        home();

        //document.querySelector('body').style.overflow = 'hidden'; // Disable thumbnail scrolling

        // Show overlay
        if (! window.projectID) {
            setTimeout(() => {
                document.querySelector('#project').style.top = '120px'; // Open
            }, 100); // Wait for display change
        }

        const projectData = await projectsGetData(window.id);
        const project = document.querySelector('#project');
        //project.scrollTo(0, 0);
        project.style.backgroundColor = projectData.data.bgcolor;
        document.querySelector('#clocks').style.visibility = 'hidden';
        document.querySelector('footer').style.display = ''; // Hide

        // Project title
        const title = projectData.data.title[0].text;
        const projectTitle = document.querySelector('header h2');
        projectTitle.querySelector('span').textContent = title;
        projectTitle.style.display = 'table'; // Show
        const projectMobileTitle = project.querySelector('h2');
        projectMobileTitle.textContent = title;
        projectMobileTitle.style.color = projectData.data.textcolor;

        // Meta
        document.querySelector('title').textContent = 'Craig & Karl - ' + title;
        document.querySelector('meta[name="description"]').setAttribute('content', projectData.data.subtitle[0] ? projectData.data.subtitle[0].text : '');

        projectsLoadImages(projectData.data, window.id);
        window.projectID = window.id;
    } else if (window.projectID) {
        // Hide overlay
        document.querySelector('#project').style.top = ''; // Close
        document.querySelector('#clocks').style.visibility = '';
        document.querySelector('header h2').style.display = ''; // Hide

        document.querySelector('body').style.overflow = ''; // Re-enable thumbnail scrolling
        resetMeta();
        window.projectID = 0;
    }
}

function projectsLoadImages(data, project) {
    const wrapper = document.querySelector('#project-wrapper');
    wrapper.innerHTML = ''; // Clear
    const images = data.body[0].items;
    var projectImages = '';

    // Loop project images
    for (let x = 0; x < images.length; x++) {
        let image = images[x];
        let caption = image.image_captions[0] ? `<p style="color: ${ data.textcolor }">${ image.image_captions[0].text }</p>` : '';
        let alt = image.gallery_image.alt;

        if (alt && alt.indexOf('vimeo.com') !== -1) {
            // Video
            projectImages += `<div class="project-image" id="project-image-${ x + 1 }"><div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/${ alt.split('/').pop() }?title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>${ caption }</div>`; // Embed Vimeo
        } else {
            // Image
            projectImages += `<div class="project-image" id="project-image-${ x + 1 }"><img src="" data-url="${ image.gallery_image.url }" alt="${ alt }" />${ caption }</div>`;
        }
    }

    wrapper.innerHTML = projectImages // Add to DOM
    projectsShowImage(1, project); // Show first image
}

function projectsShowImage(count, project) {
    if (document.querySelector('#project-image-' + count)) {
        const projectImage = document.querySelector('#project-image-' + count)
        const projectImageFile = projectImage.querySelector('img');

        // If project hasn't changed
        if (projectImageFile && window.id && window.id === project) {
            // Image
            projectImageFile.addEventListener('load', () => {
                // If project hasn't changed
                if (window.id && window.id === project) {
                    projectImageFile.style.opacity = 1; // Fade in

                    if (projectImage.querySelector('p')) {
                        // Show caption if exists
                        projectImage.querySelector('p').style.visibility = 'visible';
                    }

                    projectsShowImage(count + 1, project); // Show next image
                }
            });

            const dataURL = projectImageFile.getAttribute('data-url');
            const imageSize = window.innerWidth > 768 ? 1920 : 960; // Smaller res for mobile
            projectImageFile.setAttribute('src', dataURL + '&w=' + imageSize);
        } else {
            // Video
            if (projectImage.querySelector('p')) {
                // Show caption if exists
                projectImage.querySelector('p').style.visibility = 'visible';
            }

            projectsShowImage(count + 1, project); // Show next image
        }
    } else {
        // All images shown
        projectsShowFooter();
    }
}

async function projectsShowFooter() {
    const projectPosition = window.homeProjects.findIndex(obj => obj.project.id === window.id);

    // Prev project
    const prevProjectLink = document.querySelector('#footer-link-prev');
    const prevProjectPosition = projectPosition === 0 ? window.homeProjects.length - 1 : projectPosition - 1;
    const prevProjectID = window.homeProjects[prevProjectPosition].project.id;
    const prevProjectData = await projectsGetData(prevProjectID);
    prevProjectLink.querySelector('span').textContent = prevProjectData.data.title[0].text; // Add title
    prevProjectLink.setAttribute('onclick', `history.pushState(null, null, '${ prevProjectData.slugs[0] }?id=${ prevProjectID }');`); // Set link

    // Next Project
    const nextProjectLink = document.querySelector('#footer-link-next');
    const nextProjectPosition = projectPosition === window.homeProjects.length - 1 ? 0 : projectPosition + 1;
    const nextProjectID = window.homeProjects[nextProjectPosition].project.id;
    const nextProjectData = await projectsGetData(nextProjectID);
    nextProjectLink.querySelector('span').textContent = nextProjectData.data.title[0].text; // Add title
    nextProjectLink.setAttribute('onclick', `history.pushState(null, null, '${ nextProjectData.slugs[0] }?id=${ nextProjectID }');`); // Set link

    document.querySelector('footer').style.display = 'block'; // Show
}