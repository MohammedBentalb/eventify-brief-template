import * as ChartJs from "chart.js";
// @ts-ignore
ChartJs.Chart.register.apply(null, Object.values(ChartJs).filter((chartClass) => chartClass.id));
const theMainContentTile = document.querySelector(".page-header__content");
const sideNavButtons = document.querySelectorAll("button[data-screen]");
const mainSection = document.querySelectorAll("section[data-screen]");
// form inputs
const eventForm = document.querySelector("#event-form");
const eventName = document.querySelector("#event-title");
const eventImage = document.querySelector("#event-image");
const eventDesc = document.querySelector("#event-description");
const eventSeats = document.querySelector("#event-seats");
const eventPrice = document.querySelector("#event-price");
// variant
const variantName = document.querySelector(".variant-row__name");
const variantQuantity = document.querySelector(".variant-row__qty");
const variantValue = document.querySelector(".variant-row__value");
const variantType = document.querySelector(".variant-row__type");
const addVariantButton = document.querySelector("#add-variant-btn");
const variantSection = document.querySelector("#variants-parent");
let errorsArray = [];
let variantArray = [];
// error form field
const errorSpace = document.querySelector("#form-errors");
// show events section
const eventsTable = document.querySelector(".table__body");
const sortInput = document.querySelector("#sort-events");
const searchInput = document.querySelector("#search-events");
// eventTiles a variable that contans all titles for each section for quicka access
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
// eventCount a variable that represent the event id added bu form (initialized inside the fetchData function)
let eventCount = 0;
// retrieving the content displayed keyword from local storage of setting it to be equal to stats by default
let screenContent = localStorage.getItem("screenContent") || "stats";
// calling function that initialize the ui based on the value of local storage or stats by default
updateUiPlacement(screenContent);
// a loop for looping through botton lists and having click eventlistnner for each one of them to select the active button
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
// calling fetchData for fetching data from local api
fetchData("http://localhost:8080/posts", "http://localhost:8080/archive");
// fetchData an async function that fetches data from local json-server api
async function fetchData(url, url2, options = undefined, options2 = undefined) {
    try {
        const response = await fetch(url, options);
        const response2 = await fetch(url2, options2);
        const posts = await response.json();
        console.log(posts);
        if (!response.ok || !response2.ok)
            throw Error("response is not okay");
        eventCount = posts.length + 1;
        calculateStats(posts);
        renderEvents(posts);
    }
    catch (e) {
        if (e instanceof Error)
            console.log(e.message);
    }
}
// calculateStats a function that gets data and calculate the total seats, price, and events
function calculateStats(data) {
    let totalTheoryPrice = 0, totalNumberOfSeats = 0, totalEvents = 0;
    data.map((event) => {
        totalEvents++;
        totalNumberOfSeats += event.seats;
        totalTheoryPrice += event.seats * event.price;
    });
    RenderStats(totalNumberOfSeats, totalEvents, totalTheoryPrice);
    renderGraph(data.map((evt) => evt.title), data.map((evt) => evt.seats));
}
// renderStats a function that renders the calculated stats to the DOM
function RenderStats(seatsNumber, eventsNumber, priceNumber) {
    const totalEvents = document.querySelector("#stat-total-events");
    const totalSeats = document.querySelector("#stat-total-seats");
    const totalPrice = document.querySelector("#stat-total-price");
    totalEvents.textContent = eventsNumber.toString();
    totalSeats.textContent = seatsNumber.toString();
    totalPrice.textContent = `${priceNumber.toString()}$`;
}
// function that renders a graph based on the available events
function renderGraph(labels, data) {
    const ctx = document.getElementById("myChart");
    new ChartJs.Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "# of seats",
                    data,
                    borderWidth: 1,
                },
            ],
        },
    });
}
// addEventa a function that handels the entire form manipulation [adding events, adding variants, entire validation]
function addEvent() {
    let found = null;
    const URLRegex = /^(?:(?:https?|ftp):\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?$/i;
    // an event for "adding variant button"
    addVariantButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (variantName &&
            variantName.value.trim() !== "" &&
            variantQuantity &&
            !isNaN(Number(variantQuantity.value)) &&
            Number(variantQuantity.value) > 0 &&
            variantType &&
            !isNaN(Number(variantValue.value)) &&
            Number(variantValue.value) > 0 &&
            (variantType.value === "fixed" || variantType.value === "percentage")) {
            found = variantArray.find((v) => v.name === variantName.value.trim());
            if (found)
                return;
            variantArray = [
                ...variantArray,
                {
                    id: variantArray.length,
                    name: variantName.value.trim(),
                    qty: Number(variantQuantity.value),
                    value: Number(variantValue.value),
                    type: variantType.value.trim() || "percentage",
                },
            ];
            renderVariants();
            removeVariant();
        }
        found = null;
        console.log(variantArray);
    });
    // adding an event to track the form submit  event
    eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        errorsArray = [];
        errorSpace.innerHTML = "";
        if (!eventName || eventName.value.trim() === "")
            errorsArray.push({ name: "title", errorText: "Invalid name" });
        if (!eventImage ||
            eventImage.value.trim() === "" ||
            !URLRegex.test(eventImage.value.trim()))
            errorsArray.push({ name: "image", errorText: "Invalid image url" });
        if (!eventDesc || eventDesc.value.trim() === "")
            errorsArray.push({ name: "desc", errorText: "Invalid text" });
        if (!eventSeats ||
            isNaN(Number(eventSeats.value)) ||
            Number(eventSeats.value) == 0)
            errorsArray.push({ name: "seats", errorText: "Invalid seats number" });
        if (!eventPrice ||
            isNaN(Number(eventPrice.value)) ||
            Number(eventPrice.value) <= 0)
            errorsArray.push({ name: "price", errorText: "Invalid price number" });
        //console.log(errorsArray);
        if (errorsArray.length === 0) {
            let option = {
                method: "POST",
                headers: {
                    "content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: eventCount,
                    title: eventName.value,
                    image: eventImage.value,
                    description: eventDesc.value,
                    seats: parseInt(eventSeats.value),
                    price: Number(eventPrice.value),
                    variants: variantArray,
                }),
            };
            fetchData("http://localhost:8080/posts", "http://localhost:8080/archive", option);
            // reset inputs
            variantArray = [];
            eventName.value = "";
            eventImage.value = "";
            eventDesc.value = "";
            eventSeats.value = "0";
            eventPrice.value = "0";
        }
        else {
            errorSpace === null || errorSpace === void 0 ? void 0 : errorSpace.classList.toggle("is-hidden", errorsArray.length === 0);
            errorsArray.map((err) => {
                let content = `
      <li style="background-color: rgb(255, 255, 255, .5); padding-inline: .5rem; padding-block: .5rem; border-radius: .4rem; display: flex; gap: 1rem; font-weight: 500;"><span style="font-weight: bold; text-transform: capitalize;">* ${err.name}: </span>${err.errorText}</li>
        `;
                errorSpace.innerHTML += content;
            });
        }
        // console.log(errorsArray);
    });
}
// renedrVariants a function that loops through the variant array and render all variants to the DOM
function renderVariants() {
    variantSection.innerHTML = "";
    if (variantArray.length === 0)
        return;
    variantArray.map((vr) => {
        const div = document.createElement("div");
        div.classList.add("variant-list");
        div.id = `variant-n-${vr.id}`;
        let content = `
      <p class="variant-name">${vr.name}</p>
      <p class="variant-quantity">${vr.qty}</p>
      <p class="variant-value">${vr.value}</p>
      <p class="variant-type">${vr.type}</p>
      <button type="button" class="btn btn--danger" style="margin-r:auto; height: 25px;" id="remove-variant">remove</button>
    `;
        div.innerHTML = content;
        variantSection.appendChild(div);
    });
}
// removeVariant a function that loops through the variant array and remove the one whose remove button got clicked
function removeVariant() {
    variantArray.map((vr) => {
        const variantDiv = document.querySelector(`#variant-n-${vr.id}`);
        variantDiv === null || variantDiv === void 0 ? void 0 : variantDiv.addEventListener("click", (e) => {
            const button = e.target;
            if (button.id === "remove-variant") {
                const newVarriants = variantArray.filter((item) => item.id !== Number(variantDiv.id.split("-")[2]));
                variantArray = [...newVarriants];
                renderVariants();
            }
        });
    });
}
// calling add event to allow form functionalities to work
addEvent();
function renderEvents(events) {
    let result = [...events];
    eventsTable.innerHTML = "";
    showEvents(result);
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("change", function () {
        if (searchInput.value.trim() !== "") {
            let newVersion = result.filter((r) => r.title.toLowerCase() === searchInput.value.trim().toLocaleLowerCase());
            eventsTable.innerHTML = "";
            showEvents(newVersion);
        }
        else {
            showEvents(result);
        }
    });
    sortInput === null || sortInput === void 0 ? void 0 : sortInput.addEventListener("change", function () {
        result = [...sortEvents(result, sortInput.value.trim())];
        eventsTable.innerHTML = "";
        showEvents(result);
    });
}
function showEvents(arr) {
    arr.map((ev) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-event-id", ev.id.toString());
        tr.classList.add("table__row");
        let content = `
    <td>${ev.id}</td>
    <td>${ev.title}</td>
    <td>${ev.seats}</td>
    <td>$${ev.price}</td>
      <td><span class="badge">${ev.variants.length}</span></td>
      <td>
        <button
        class="btn btn--small"
        data-action="details"
        data-event-id="1"
        >
          Details
          </button>
          <button
          class="btn btn--small"
          data-action="edit"
          data-event-id="1"
        >
        Edit
        </button>
        <button
          class="btn btn--danger btn--small"
          data-action="archive"
          data-event-id="1"
          >
          Delete
          </button>
          </td>
    `;
        tr.innerHTML = content;
        eventsTable.appendChild(tr);
        trackShowenEvent(ev.id, arr);
    });
    5;
}
function trackShowenEvent(id, arr) {
    const element = document.querySelector(`tr[data-event-id="${id}"]`);
    const modal = document.querySelector("#event-modal");
    modal.addEventListener("click", (e) => {
        const button = e.target;
        if (button.dataset.action === "close-modal") {
            showEventDetails(Number(id), false, arr);
        }
        if (button.dataset.action === "edit") {
            editEvent(Number(id), false, arr);
        }
    });
    element === null || element === void 0 ? void 0 : element.addEventListener("click", function (e) {
        const target = e.target;
        console.log(target.dataset.action);
        if (target.dataset.action === "archive") {
            const newArr = removeEvent(arr, id);
            eventsTable.innerHTML = "";
            showEvents(newArr);
        }
        else if (target.dataset.action === "details") {
            showEventDetails(Number(id), true, arr);
        }
        else if (target.dataset.action === "edit") {
            editEvent(Number(id), true, arr);
        }
    });
}
function removeEvent(arr, id) {
    let [foundEvent] = arr.filter((ev) => ev.id === id);
    let newArr = arr.filter((ev) => ev.id !== id);
    let option = {
        method: "DELETE",
        headers: {
            "content-Type": "application/json",
        },
    };
    let option2 = {
        method: "POST",
        headers: {
            "content-Type": "application/json",
        },
        body: JSON.stringify(foundEvent),
    };
    fetchData(`http://localhost:8080/posts/${id}`, "http://localhost:8080/archive", option, option2);
    return newArr;
}
function sortEvents(events, condition) {
    let sorted = [...events];
    let finalResult;
    for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = 0; j < sorted.length - 1 - i; j++) {
            if (condition === "title-asc")
                finalResult = sorted[j].title.localeCompare(sorted[j + 1].title) > 0;
            if (condition === "title-desc")
                finalResult = sorted[j].title.localeCompare(sorted[j + 1].title) < 0;
            if (condition === "price-asc")
                finalResult = sorted[j].price > sorted[j + 1].price;
            if (condition === "price-desc")
                finalResult = sorted[j].price < sorted[j + 1].price;
            if (condition === "seats-asc")
                finalResult = sorted[j].seats > sorted[j + 1].seats;
            if (finalResult) {
                let tmp = sorted[j];
                sorted[j] = sorted[j + 1];
                sorted[j + 1] = tmp;
            }
        }
    }
    return sorted;
}
function showEventDetails(id, show, arr) {
    const modal = document.querySelector("#event-modal");
    const modalBody = document.querySelector("#modal-body");
    const editForm = document.querySelector("#edit-form");
    editForm.classList.add("is-hidden");
    modalBody.innerHTML = "";
    if (!show) {
        modalBody.classList.add("is-hidden");
        modal.classList.add("is-hidden");
        console.log(modalBody.className);
        return;
    }
    modalBody.classList.remove("is-hidden");
    let [ev] = arr.filter((e) => Number(e.id) === id);
    const ul = document.createElement("ul");
    const h2 = document.createElement("h2");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    ul.style.listStyle = "none";
    ul.style.display = "flex";
    ul.style.flexDirection = "column";
    ul.style.gap = "1rem";
    h2.textContent = ev.title;
    p.textContent = ev.description;
    h3.textContent = "Exclusivity🎉";
    modalBody.appendChild(h2);
    modalBody.appendChild(p);
    modalBody.appendChild(h3);
    ev.variants.map((v) => {
        let li = document.createElement("li");
        li.style = "display: flex; gap: .5rem; align-items: center";
        let liContent = `
      <h4>- ${v.name}:</h4>
      <p>${v.qty}<span style="font-weight: 500;"> People</span></p>
      <p>${v.value}<span style="font-weight: 500;">${v.type === "percentage" ? "%" : " fixed"} reduction</span></p>
      `;
        li.innerHTML += liContent;
        ul.appendChild(li);
    });
    ul.innerHTML += `<img src="https://picsum.photos/200" alt="" width="200px" style="border-radius: 15px;">`;
    modalBody.appendChild(ul);
    modal.classList.remove("is-hidden");
}
function editEvent(id, show, arr) {
    const [foundEvent] = arr.filter((e) => Number(e.id) === id);
    const modal = document.querySelector("#event-modal");
    const modalBody = document.querySelector("#modal-body");
    const editForm = document.querySelector("#edit-form");
    const titleInput = document.querySelector("#edit-title");
    const imageInput = document.querySelector("#edit-image");
    const descInput = document.querySelector("#edit-desc");
    const priceInput = document.querySelector("#edit-price");
    const seatInput = document.querySelector("#edit-seat");
    modal.classList.remove("is-hidden");
    editForm.classList.remove("is-hidden");
    modalBody.classList.add("is-hidden");
    if (!show) {
        modal.classList.add("is-hidden");
        // modalBody.innerHTML = "";
        return;
    }
    console.log(searchInput);
    titleInput.value = foundEvent.title;
    imageInput.value = foundEvent.image;
    descInput.value = foundEvent.description;
    seatInput.value = foundEvent.seats.toString();
    priceInput.value = foundEvent.price.toString();
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (titleInput.value.trim() !== "" &&
            descInput.value.trim() !== "" &&
            !isNaN(Number(priceInput.value)) &&
            Number(priceInput.value) > 0 &&
            !isNaN(Number(seatInput.value)) &&
            Number(seatInput.value) > 0) {
            const event = {
                title: titleInput.value.trim(),
                image: imageInput.value.trim(),
                description: descInput.value.trim(),
                seats: Number(seatInput.value),
                price: Number(priceInput.value),
            };
            let options = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(event)
            };
            fetchData(`http://localhost:8080/posts/${id}`, "http://localhost:8080/archive", options);
            console.log(event);
        }
    });
    modal.classList.remove("is-hidden");
}
