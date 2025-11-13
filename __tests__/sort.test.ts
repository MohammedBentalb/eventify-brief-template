import { type eventType } from "../src/index";
import { sortEvents } from "../src/sort";


let mockEvents: eventType[] = [
  {
    id: 1,
    title: "Tech Innovators Summit 2025",
    image: "https://example.com/images/tech-summit.jpg",
    description:
      "A gathering of top tech minds discussing the future of AI, blockchain, and cloud computing.",
    seats: 120,
    price: 299,
    variants: [
      { id: 1, name: "Early Bird", qty: 30, value: 20, type: "percentage" },
      { id: 2, name: "VIP Access", qty: 10, value: 150, type: "fixed" },
    ],
  },
  {
    id: 2,
    title: "Frontend Masters Workshop",
    image: "https://example.com/images/frontend-workshop.jpg",
    description:
      "Hands-on React, TypeScript, and performance optimization workshop for modern web developers.",
    seats: 60,
    price: 180,
    variants: [
      {
        id: 1,
        name: "Student Discount",
        qty: 15,
        value: 25,
        type: "percentage",
      },
      { id: 2, name: "Team Bundle", qty: 5, value: 100, type: "fixed" },
    ],
  },
  {
    id: 3,
    title: "Cloud Computing Essentials",
    image: "https://example.com/images/cloud-essentials.jpg",
    description:
      "Learn the core concepts of AWS, Azure, and Google Cloud with real-world deployment examples.",
    seats: 80,
    price: 220,
    variants: [
      { id: 1, name: "Online Access", qty: 100, value: 30, type: "fixed" },
      { id: 2, name: "Group Discount", qty: 20, value: 15, type: "percentage" },
    ],
  },
];

const sorrtedByTitleAsc = [...mockEvents].sort((a, b) =>
  a.title.localeCompare(b.title)
);
console.log(sorrtedByTitleAsc);
const sorrtedByTitleDesc = [...mockEvents].sort((a, b) =>
  b.title.localeCompare(a.title)
);

const sorrtedByPriceAsc = [...mockEvents].sort((a, b) => a.price - b.price);
const sorrtedByPriceDesc = [...mockEvents].sort((a, b) => b.price - a.price);
const sorrtedBySeatsAsc = [...mockEvents].sort((a, b) => a.seats - b.seats);

describe("Sorting: ", () => {
  it("it sort them by title (asc) correctly", () => {
    expect(sortEvents(mockEvents, "title-asc")).toEqual(sorrtedByTitleAsc);
  });

  it("it sort them by title (desc) correctly", () => {
    expect(sortEvents(mockEvents, "title-desc")).toEqual(sorrtedByTitleDesc);
  });

  it("it sort them by price (asc) correctly", () => {
    expect(sortEvents(mockEvents, "price-asc")).toEqual(sorrtedByPriceAsc);
  });

  it("it sort them by price (desc) correctly", () => {
    expect(sortEvents(mockEvents, "price-desc")).toEqual(sorrtedByPriceDesc);
  });
});
