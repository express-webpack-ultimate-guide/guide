require('./style.scss');

function toggleClass(el, className) {
    if (el.classList) {
        el.classList.toggle(className);
    } else {
        var classes = el.className.split(' ');
        var existingIndex = classes.indexOf(className);

        if (existingIndex >= 0)
            classes.splice(existingIndex, 1);
        else
            classes.push(className);

        el.className = classes.join(' ');
    }
}
function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
ready(function() {
    var btnMenu = document.querySelector("button.hamburger");
    var mainMenu = document.querySelector("nav.main-menu");
    if (btnMenu) {
        btnMenu
            .addEventListener("click", function() {
                toggleClass(mainMenu, "__visible");
                toggleClass(btnMenu, "is-active");
                toggleClass(document.body, "__menu-visible");
            });
    }
});
