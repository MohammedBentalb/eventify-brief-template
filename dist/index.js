"use strict";
const theMainContentTile = document.querySelector(".page-header__content");
const sideNavButtons = document.querySelectorAll("button[data-screen]");
const mainSection = document.querySelectorAll("section[data-screen]");
const eventTiles = {
    stats: {
        title: "Statistics",
        subTile: "Overview of your events",
    },
    add: {
        title: "Add Event",
        subTile: "Add the event needed",
    },
    list: {
        title: "Event List",
        subTile: "View the whole Events",
    },
    archive: {
        title: "Archive",
        subTile: "View the deleted Events",
    },
};
// retrieving the content displayed keyword from local storage of setting it to be equal to stats by default
let screenContent = localStorage.getItem("screenContent") || "stats";
// calling function that initialize the ui based on the value of local storage or stats by default
updateUiPlacement(screenContent);
// looping through botton lists and having click eventlistnner for each one of them to select the active button
sideNavButtons.forEach((element) => {
    element.addEventListener("click", (e) => {
        const target = e.currentTarget;
        screenContent = target.dataset.screen;
        localStorage.setItem("screenContent", screenContent);
        // call the function that updates the ui to match the clicked element
        updateUiPlacement(screenContent);
    });
});
// function that set the avtive button as wel as the visible section, and changing the title and sub title of the heading
function updateUiPlacement(screen) {
    // change the button in the aside
    sideNavButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.screen === screen));
    mainSection.forEach((section) => section.classList.toggle("is-visible", section.dataset.screen === screen));
    // change the heading content (h2 || p)
    theMainContentTile.children[0].textContent = eventTiles[screenContent].title;
    theMainContentTile.children[1].textContent =
        eventTiles[screenContent].subTile;
}
