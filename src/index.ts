const theMainContentTile = document.querySelector(".page-header__content")!;
const sideNavButtons = document.querySelectorAll<HTMLButtonElement>(
  "button[data-screen]"
);
const mainSection = document.querySelectorAll<HTMLDListElement>(
  "section[data-screen]"
);

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

type eventType = {
  id: number;
  title: string;
  image: string;
  description: string;
  seats: number;
  price: number;
  variants: [
    {
      id: number;
      name: string;
      qty: number;
      value: number;
      type: "fixed" | "percentage";
    }
  ];
};

type screenContentType = keyof typeof eventTiles;

// retrieving the content displayed keyword from local storage of setting it to be equal to stats by default
let screenContent: screenContentType =
  (localStorage.getItem("screenContent") as screenContentType) || "stats";

// calling function that initialize the ui based on the value of local storage or stats by default
updateUiPlacement(screenContent);

// looping through botton lists and having click eventlistnner for each one of them to select the active button
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

//fetching data from local api
fetchData("http://localhost:8080/posts");

// async function that fetches data from local json-server
async function fetchData(url: string, options = undefined) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw Error("response is not okay");
    const data = await response.json();
    calculateStats(data);
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
  }
}

// function that gets data and calculate the total seats, price, and events
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
}

//function that renders the calculated stats to the DOM
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
  totalPrice.textContent = priceNumber.toString();
}
