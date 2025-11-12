import * as ChartJs from "chart.js";

// @ts-ignore
ChartJs.Chart.register.apply(null,Object.values(ChartJs).filter((chartClass: any) => chartClass.id));
const theMainContentTile = document.querySelector(".page-header__content")!;
const sideNavButtons = document.querySelectorAll<HTMLButtonElement>("button[data-screen]");
const mainSection = document.querySelectorAll<HTMLDListElement>("section[data-screen]");

// form inputs
const eventForm = document.querySelector<HTMLFormElement>("#event-form")!;
const eventName = document.querySelector<HTMLInputElement>("#event-title")!;
const eventImage = document.querySelector<HTMLInputElement>("#event-image")!;
const eventDesc = document.querySelector<HTMLTextAreaElement>("#event-description")!;
const eventSeats = document.querySelector<HTMLInputElement>("#event-seats")!;
const eventPrice = document.querySelector<HTMLInputElement>("#event-price")!;

// variant
const variantName = document.querySelector<HTMLInputElement>(".variant-row__name")!;
const variantQuantity = document.querySelector<HTMLInputElement>(".variant-row__qty")!;
const variantValue = document.querySelector<HTMLInputElement>(".variant-row__value")!;
const variantType = document.querySelector<HTMLInputElement>(".variant-row__type")!;
const addVariantButton = document.querySelector("#add-variant-btn")!;
const variantSection = document.querySelector("#variants-parent")!;

let errorsArray: ErrorType[] = [];
let variantArray: eventType["variants"] | [] = [];

// error form field
const errorSpace = document.querySelector("#form-errors")!;

// show events section
const eventsTable = document.querySelector(".table__body")!;
const sortInput = document.querySelector<HTMLSelectElement>("#sort-events");
const searchInput = document.querySelector<HTMLInputElement>("#search-events");

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
type eventType = {
  id: number;
  title: string;
  image: string;
  description: string;
  seats: number;
  price: number;
  variants:
    | {
        id: number;
        name: string;
        qty: number;
        value: number;
        type: "fixed" | "percentage";
      }[]
    | [];
};
type ErrorType = { name: string; errorText: string };
type screenContentType = keyof typeof eventTiles;

// retrieving the content displayed keyword from local storage of setting it to be equal to stats by default
let screenContent: screenContentType =(localStorage.getItem("screenContent") as screenContentType) || "stats";
let eventCount = Number(localStorage.getItem("eventCount")) || 0;

// calling function that initialize the ui based on the value of local storage or stats by default
updateUiPlacement(screenContent);
// a loop for looping through botton lists and having click eventlistnner for each one of them to select the active button

sideNavButtons.forEach((element) => {
  element.addEventListener("click", (e) => {
    const target = e.currentTarget as HTMLButtonElement;
    screenContent = target.dataset.screen as keyof typeof eventTiles;
    localStorage.setItem("screenContent", screenContent);

    // call the function that updates the ui to match the clicked element
    updateUiPlacement(screenContent);
  });
});
// function that set the avtive button as wel as the visible section, and changing the title and sub title of the heading
function updateUiPlacement(screen: screenContentType) {
  // change the button in the aside
  sideNavButtons.forEach((button) =>
    button.classList.toggle("is-active", button.dataset.screen === screen)
  );

  mainSection.forEach((section) =>
    section.classList.toggle("is-visible", section.dataset.screen === screen)
  );

  // change the heading content (h2 || p)
  theMainContentTile.children[0].textContent = eventTiles[screenContent].title;
  theMainContentTile.children[1].textContent =
    eventTiles[screenContent].subTile;
}
// calling fetchData for fetching data from local api
fetchData("http://localhost:8080/posts", "http://localhost:8080/archive");
// fetchData an async function that fetches data from local json-server api
async function fetchData(
  url: string,
  url2: string,
  options: any = undefined,
  options2: any = undefined
) {
  try {
    const response = await fetch(url, options);
    const response2 = await fetch(url2, options2);
    const posts = await response.json();
    const archive = await response2.json();

    console.log(posts);
    if (!response.ok || !response2.ok) throw Error("response is not okay");

    eventCount =
      Number(localStorage.getItem("eventCount")) ||
      posts.length + archive.length + 1;
    console.log(eventCount);

    calculateStats(posts);
    renderEvents(posts);
    listArchive(archive);
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
  }
}
// calculateStats a function that gets data and calculate the total seats, price, and events
function calculateStats(data: eventType[]) {
  let totalTheoryPrice = 0,
    totalNumberOfSeats = 0,
    totalEvents = 0;

  data.map((event) => {
    totalEvents++;
    totalNumberOfSeats += event.seats;
    totalTheoryPrice += event.seats * event.price;
  });
  RenderStats(totalNumberOfSeats, totalEvents, totalTheoryPrice);
  renderGraph(
    data.map((evt) => evt.title),
    data.map((evt) => evt.seats)
  );
}
// renderStats a function that renders the calculated stats to the DOM
function RenderStats(
  seatsNumber: number,
  eventsNumber: number,
  priceNumber: number
) {
  const totalEvents = document.querySelector("#stat-total-events")!;
  const totalSeats = document.querySelector("#stat-total-seats")!;
  const totalPrice = document.querySelector("#stat-total-price")!;

  totalEvents.textContent = eventsNumber.toString();
  totalSeats.textContent = seatsNumber.toString();
  totalPrice.textContent = `${priceNumber.toString()}$`;
}
// function that renders a graph based on the available events
function renderGraph(labels: string[], data: number[]) {
  const ctx = document.getElementById("myChart") as HTMLCanvasElement;

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
  const URLRegex =
    /^(?:(?:https?|ftp):\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?$/i;
  // an event for "adding variant button"
  addVariantButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      variantName &&
      variantName.value.trim() !== "" &&
      variantQuantity &&
      !isNaN(Number(variantQuantity.value)) &&
      Number(variantQuantity.value) > 0 &&
      variantType &&
      !isNaN(Number(variantValue.value)) &&
      Number(variantValue.value) > 0 &&
      (variantType.value === "fixed" || variantType.value === "percentage")
    ) {
      found = variantArray.find((v) => v.name === variantName.value.trim());

      if (found) return;
      variantArray = [
        ...variantArray,
        {
          id: variantArray.length,
          name: variantName.value.trim(),
          qty: Number(variantQuantity.value),
          value: Number(variantValue.value),
          type: (variantType.value.trim() as "fixed") || "percentage",
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
    errorSpace.classList.add("is-hidden");

    if (!eventName || eventName.value.trim() === "")
      errorsArray.push({ name: "title", errorText: "Invalid name" });
    if (
      !eventImage ||
      eventImage.value.trim() === "" ||
      !URLRegex.test(eventImage.value.trim())
    )
      errorsArray.push({ name: "image", errorText: "Invalid image url" });
    if (!eventDesc || eventDesc.value.trim() === "")
      errorsArray.push({ name: "desc", errorText: "Invalid text" });
    if (
      !eventSeats ||
      isNaN(Number(eventSeats.value)) ||
      Number(eventSeats.value) == 0
    )
      errorsArray.push({ name: "seats", errorText: "Invalid seats number" });
    if (
      !eventPrice ||
      isNaN(Number(eventPrice.value)) ||
      Number(eventPrice.value) <= 0
    )
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
      eventCount += 1;
      localStorage.setItem("eventCount", eventCount.toString());

      fetchData(
        "http://localhost:8080/posts",
        "http://localhost:8080/archive",
        option
      );

      // reset inputs
      variantArray = [];

      eventName.value = "";
      eventImage.value = "";
      eventDesc.value = "";
      eventSeats.value = "0";
      eventPrice.value = "0";
    } else {
      errorSpace?.classList.toggle("is-hidden", errorsArray.length === 0);
      errorSpace.scrollIntoView({ behavior: "smooth" });
      console.log("errr iii rr");
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
  if (variantArray.length === 0) return;

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

    variantDiv?.addEventListener("click", (e) => {
      const button = e.target as HTMLButtonElement;
      if (button.id === "remove-variant") {
        const newVarriants = variantArray.filter(
          (item) => item.id !== Number(variantDiv.id.split("-")[2])
        );
        variantArray = [...newVarriants];
        renderVariants();
      }
    });
  });
}
// calling add event to allow form functionalities to work
addEvent();
// renderEvents is a function that renders events and keep track of the sort / search inputs to modify the displayed events and their order
function renderEvents(events: eventType[]) {
  let result: eventType[] = [...events];
  eventsTable.innerHTML = "";
  showEvents(result);

  searchInput?.addEventListener("change", function () {
    if (searchInput.value.trim() !== "") {
      let newVersion = result.filter(
        (r) =>
          r.title.toLowerCase() === searchInput.value.trim().toLocaleLowerCase()
      );
      eventsTable.innerHTML = "";
      showEvents(newVersion);
    } else {
      showEvents(result);
    }
  });

  sortInput?.addEventListener("change", function () {
    result = [...sortEvents(result, sortInput.value.trim())];
    eventsTable.innerHTML = "";
    showEvents(result);
  });
}
// showEvents is a function that accepts an array of events as a param and renders the list of events it recieved 
function showEvents(arr: eventType[]) {
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
// trackShowenEvent is a function that has been caled inside showEvents since it takes id for each event to trak the actions applied to it
function trackShowenEvent(id: number, arr: eventType[]) {
  const element = document.querySelector<HTMLTableRowElement>(
    `tr[data-event-id="${id}"]`
  );
  const modal = document.querySelector("#event-modal")!;

  modal.addEventListener("click", (e) => {
    const button = e.target as HTMLDivElement;
    if (button.dataset.action === "close-modal") {
      showEventDetails(Number(id), false, arr);
    }
    if (button.dataset.action === "edit") {
      editEvent(Number(id), false, arr);
    }
  });

  element?.addEventListener("click", function (e) {
    const target = e.target as HTMLButtonElement;
    console.log(target.dataset.action);
    if (target.dataset.action === "archive") {
      const newArr = removeEvent(arr, id);
      eventsTable.innerHTML = "";
      showEvents(newArr);
    } else if (target.dataset.action === "details") {
      showEventDetails(Number(id), true, arr);
    } else if (target.dataset.action === "edit") {
      editEvent(Number(id), true, arr);
    }
  });
}
// removeEvent is a function that  removes an event from the event section buy sendnig a post request to the archive api to store it in there and den a delete request to the posts api to remove it from there
function removeEvent(arr: eventType[], id: number) {
  let [foundEvent] = arr.filter((ev) => ev.id === id);
  let newArr = arr.filter((ev) => ev.id !== id);
  console.log(foundEvent);

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

  fetchData(
    `http://localhost:8080/posts/${id}`,
    "http://localhost:8080/archive",
    option,
    option2
  );

  return newArr;
}
// SortEvents is a function that has a bubble sort implemented inside of it to sort events based of the condition it recieve from the sort input
function sortEvents(events: eventType[], condition: string) {
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
// showEventDetails is a function that shows a model with all info about an event
function showEventDetails(id: number, show: boolean, arr: eventType[]) {
  const modal = document.querySelector("#event-modal")!;
  const modalBody = document.querySelector("#modal-body")!;
  const editForm = document.querySelector("#edit-form")!;

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
      <p>${v.value}<span style="font-weight: 500;">${
      v.type === "percentage" ? "%" : " fixed"
    } reduction</span></p>
      `;

    li.innerHTML += liContent;
    ul.appendChild(li);
  });

  ul.innerHTML += `<img src="https://picsum.photos/200" alt="" width="200px" style="border-radius: 15px;">`;
  modalBody.appendChild(ul);
  modal.classList.remove("is-hidden");
}
// editEvent is a function that show a pop-up with a form to change the wanted fileds to new values and applying a patch request to modify the event usin the posts api
function editEvent(id: number, show: boolean, arr: eventType[]) {
  const [foundEvent] = arr.filter((e) => Number(e.id) === id);

  const modal = document.querySelector("#event-modal")!;
  const modalBody = document.querySelector("#modal-body")!;
  const editForm = document.querySelector<HTMLInputElement>("#edit-form")!;
  const titleInput = document.querySelector<HTMLInputElement>("#edit-title")!;
  const imageInput = document.querySelector<HTMLInputElement>("#edit-image")!;
  const descInput = document.querySelector<HTMLTextAreaElement>("#edit-desc")!;
  const priceInput = document.querySelector<HTMLInputElement>("#edit-price")!;
  const seatInput = document.querySelector<HTMLInputElement>("#edit-seat")!;

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

    if (
      titleInput.value.trim() !== "" &&
      descInput.value.trim() !== "" &&
      !isNaN(Number(priceInput.value)) &&
      Number(priceInput.value) > 0 &&
      !isNaN(Number(seatInput.value)) &&
      Number(seatInput.value) > 0
    ) {
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      };

      fetchData(
        `http://localhost:8080/posts/${id}`,
        "http://localhost:8080/archive",
        options
      );
    }
  });
  modal.classList.remove("is-hidden");
}
// listArchive is a function that list add the deleted events stored inside the archive api and handle the process of restoring them bach the the main events
function listArchive(arr: eventType[] | []) {
  arr.map((ev) => {
    const tr = document.createElement("tr");
    const table = document.querySelector("#t-archive")!;

    tr.addEventListener("click", (e) => {
      const button = e.target as HTMLButtonElement;
      if (button.dataset.action === "restore") {
        const [selectedEvent] = arr.filter(
          (ev) => Number(ev.id) === Number(button.dataset.event)
        );
        console.log(selectedEvent);

        let options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedEvent),
        };

        let options2 = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };

        fetchData(
          `http://localhost:8080/posts/`,
          `http://localhost:8080/archive/${selectedEvent.id}`,
          options,
          options2
        ).catch((e) => console.log(e));
      }
    });

    tr.setAttribute("data-event-id", ev.id.toString());
    tr.classList.add("table__row");
    let content = `
    <td>${ev.id}</td>
    <td>${ev.title}</td>
    <td>${ev.seats}</td>
    <td>$${ev.price}</td>
      <td>
        <button
          class="btn btn--primary btn--small"
          data-action="restore"
          data-event="${ev.id}"
          >
          restore
          </button>
          </td>
    `;

    tr.innerHTML = content;
    table.appendChild(tr);
    trackShowenEvent(ev.id, arr);
  });
}
