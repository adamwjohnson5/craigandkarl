"use strict";

/* Global vars */

var projectID;

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
    // Resize
    window.addEventListener('resize', () => {
        if (! window.touchScreen) {
            responsiveProjects();
        }
    });
    
    responsiveProjects();
});

/* Responsive */

function responsiveProjects() {
    const windowWidth = window.innerWidth;
    const thumbs = document.querySelectorAll('.project-thumb');
    
    if (windowWidth < 768) { // Mobile
        for (let x = 0; x < thumbs.length; x++) {
            thumbs[x].style.width = '100%';
        }
        
        document.querySelector('#project h2').style.display = 'block';
    } else { // DT
        var thumbWidth = 50; // 2 columns
        
        if (windowWidth >= 1920) {
            thumbWidth = 20; // 5 columns
        } else if (windowWidth >= 1024) {
            thumbWidth = 25; // 4 columns
        }
        
        for (let x = 0; x < thumbs.length; x++) {
            thumbs[x].style.width = thumbWidth + '%';
        }
        
        document.querySelector('#project h2').style.display = '';
    }
}

/* Projects */

function homeLoad() {
    if (document.querySelector('#section-home').style.display !== 'block') { // Check if already visible
        showSection();
        loadProject(500); // Include delay
        resetMeta();
    } else {
        loadProject(0); // No delay
    }
}

function rewriteLoad() {
    // Ignore project slug
    window.section = 'home';
    homeLoad();
}

async function getProjectData(id) {
    var projectData;
    
    // Search 
    window.allProjects.filter(function(project) {
        if (project.id === id) {
            projectData = project;
        }
    });
    
    return projectData;
}

async function loadProjectThumbs() {
    var thumbs = '';
    
    // Loop all home projects
    for (let x = 0; x < window.homeProjects.length; x++) {
        let projectID = window.homeProjects[x].project.id;
        let project = await getProjectData(projectID);
        var subTitle = project.data.subtitle[0];
        
        if (subTitle) {
            subTitle = subTitle.text;
        } else {
            subTitle = '';
        }
        
        thumbs += '<a href="javascript: projectClick(\'' + project.slugs[0] + '\', \'' + projectID + '\');" class="project-thumb" id="project-thumb-' + (x + 1) + '" data-project-id="' + projectID + '"><img src="" data-url="' + project.data.hero.url + '" /><div class="project-thumb-hover"><div class="project-thumb-text"><p><span class="thumb-text-title">' + project.data.title[0].text + '</span><span class="thumb-text-sub-title">' + subTitle + '</span></p></div></div></a>';
    }
    
    document.querySelector('#project-thumbs').innerHTML = thumbs; // Add to DOM
    responsiveProjects(); // Set thumbs size
    showProjectThumb(1); // Fade in first thumb
}

function projectClick(slug, id) {
    history.pushState(null, null, slug + '?id=' + id);
}

function showProjectThumb(count) {
    const thumb = document.querySelector('a#project-thumb-' + count);
    const thumbImage = thumb.querySelector('img');
    
    thumbImage.addEventListener('load', () => {
        // Fade in
        const rply = new Ripley(thumbImage);
        rply.animate('opacity', '1', {speed: 0.25, ease: 'linear'});
        
        // Show next thumb
        if (count !== window.homeProjects.length) { // If not last project
            setTimeout(() => {
                showProjectThumb(count + 1);
            }, 100); // Short delay
        }
    });
    
    const dataURL = thumbImage.getAttribute('data-url');
    var imageSize = '960'; // Uploaded size
    
    if (window.innerWidth < 768) {
        imageSize = '640';
    }
    
    thumbImage.setAttribute('src', dataURL + '&w=' + imageSize + '&h=' + imageSize);
}

async function loadProject(delay) {
    if (window.location.href.indexOf('?id=') !== -1) { // Check for id URL param
        const project = document.querySelector('#project');
        const header = document.querySelector('header');
        const projectHeading = header.querySelector('h2');
        const projectMobileHeading = project.querySelector('h2');
        const projectID = window.id;
        const projectData = await getProjectData(projectID);
        var contentDelay = delay;

        // Show project overlay if not already visible
        if (! project.style.display) {
            project.style.top = '';
            contentDelay = (contentDelay + 250); // Wait for project overlay animation

            setTimeout(() => {
                if (window.id && window.id === projectID) { // If project overlay open and same project requested
                    project.style.display = 'block';
                    let rply = new Ripley(project);
                    rply.animate('top', '120px', {speed: 0.25, ease: 'ease-out'});
                    document.querySelector('nav').style.display = 'none';
                    header.style.height = '120px';
                    document.querySelector('#header-clocks').style.display = 'none';
                }
            }, delay);
        }

        // Reset
        project.scrollTo(0, 0);
        project.querySelector('#project-wrapper').innerHTML = '';
        projectHeading.style.opacity = '';
        projectMobileHeading.style.opacity = '';
        project.querySelector('#project-footer').style.opacity = '';

        // Add data
        project.style.backgroundColor = projectData.data.bgcolor;
        const title = projectData.data.title[0].text;
        projectHeading.querySelector('span').textContent = title;
        projectMobileHeading.textContent = title;
        projectMobileHeading.style.color = projectData.data.textcolor;

        setTimeout(() => {
            if (window.id && window.id === projectID) { // If project overlay open and same project requested
                // DT
                projectHeading.style.display = 'table';
                let rply = new Ripley(projectHeading);
                rply.animate('opacity', '1', {speed: 0.25, ease: 'linear'});

                // Mobile
                let rply2 = new Ripley(projectMobileHeading);
                rply2.animate('opacity', '1', {speed: 0.25, ease: 'linear'});
            }
        }, contentDelay);

        addProjectImages(projectData.data, contentDelay, projectID);
        document.querySelector('title').textContent = 'Craig & Karl - ' + title; // Set page title
        const description = document.querySelector('meta[name="description"]');

        if (projectData.data.subtitle[0]) {
            description.setAttribute('content', projectData.data.subtitle[0].text);
        }
    } else if (window.id) {
        hideProject();
    }
}

function hideProject() {
    window.id = '';
    document.querySelector('#project').style.display = '';
    
    // Reset header
    document.querySelector('header h2').style.display = '';
    responsiveGlobal();
    resetMeta();
}

function resetMeta() {
    document.querySelector('title').textContent = 'Craig & Karl'; // Set page title
    const description = document.querySelector('meta[name="description"]');
    description.setAttribute('content', 'Hi, we\'re Craig & Karl, we live in different parts of the world (New York and London) but collaborate daily to create bold, bright and often humorous work.');
}

function addProjectImages(data, delay, projectID) {
    setTimeout(() => {
        const images = data.body[0].items;
        var projectImages = '';
        
        // Loop project images
        for (let x = 0; x < images.length; x++) {
            var image = images[x];
            var projectImage = '<div class="project-image" id="project-image-' + (x + 1) + '">';
            var videoURL = image.gallery_image.alt;
            
            if (videoURL && videoURL.indexOf('vimeo.com') !== -1) { // Video
                let videoID = videoURL.split('/').pop(); // Get video ID
                projectImage += '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/' + videoID + '?title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>'; // Embed code from Vimeo
            } else { // Image
                projectImage += '<img src="" data-url="' + image.gallery_image.url + '" />';
            }
            
            const caption = image.image_captions[0];
            
            if (caption) {
                projectImage += '<p style="color: ' + data.textcolor + '">' + caption.text + '</p>';
            }
            projectImage += '</div>';
            projectImages += projectImage;
        }
        document.querySelector('#project-wrapper').insertAdjacentHTML('beforeend', projectImages);
        showProjectImage(1, projectID); // Fade in images
    }, delay);
}

function showProjectImage(count, projectID) {
    const projectImage = document.querySelector('#project-image-' + count);
    const projectImageFile = projectImage.querySelector('img');
    
    if (projectImageFile) { // Image
        projectImageFile.addEventListener('load', () => {
            if (window.id && window.id === projectID) { // If project overlay open and same project requested
                // Fade in
                const rply = new Ripley(projectImage);
                rply.animate('opacity', '1', {speed: 0.25, ease: 'linear'});
                nextProjectImage(count, projectID); // Show next image
            }
        });
        
        const dataURL = projectImageFile.getAttribute('data-url');
        var imageSize = '1920'; // Uploaded size
        
        if (window.innerWidth < 768) {
            imageSize = '960';
        }
        
        projectImageFile.setAttribute('src', dataURL + '&w=' + imageSize);
    } else { // Video
        projectImage.style.opacity = '1';
        nextProjectImage(count, projectID); // Show next image
    }
}

function nextProjectImage(count, projectID) {
    const nextImage = (count + 1);
    
    if (document.querySelector('#project-image-' + nextImage)) { // If exists
        showProjectImage(nextImage, projectID);
    } else { // Last image loaded
        showProjectFooter(projectID);
    }
}

async function showProjectFooter(projectID) {
    const nextProjectLink = document.querySelector('a#footer-project-link-next');
    const prevProjectLink = document.querySelector('a#footer-project-link-prev');
    
    // Loop all projects to get row number of project
    var projectRow = 0;
    
    for (let x = 0; x < window.homeProjects.length; x++) {
        var count = x;
        
        if (window.homeProjects[count].project.id === projectID) {
            projectRow = count;
        }
    }
    
    const projectCount = (window.homeProjects.length - 1);
    
    // Next project
    var nextProjectRow = (projectRow + 1);
    
    if (projectRow === projectCount) {
        nextProjectRow = 0;
    }
    
    const nextProjectID = window.homeProjects[nextProjectRow].project.id;
    const nextProjectData = await getProjectData(nextProjectID);
    nextProjectLink.querySelector('span').textContent = nextProjectData.data.title[0].text; // Add title
    nextProjectLink.setAttribute('href', 'javascript: projectClick(\'' + nextProjectData.slugs[0] + '\', \'' + nextProjectID + '\');'); // Set link

    // Prev project
    var prevProjectRow = (projectRow - 1);
    
    if (projectRow === 0) {
        prevProjectRow = projectCount;
    }
    
    const prevProjectID = window.homeProjects[prevProjectRow].project.id;
    const prevProjectData = await getProjectData(prevProjectID);
    
    prevProjectLink.querySelector('span').textContent = prevProjectData.data.title[0].text; // Add title
    prevProjectLink.setAttribute('href', 'javascript: projectClick(\'' + prevProjectData.slugs[0] + '\', \'' + prevProjectID + '\');'); // Set link
    
    // Fade in
    const rply = new Ripley(document.querySelector('#project-footer'));
    rply.animate('opacity', '1', {speed: 0.25, ease: 'linear'});
}