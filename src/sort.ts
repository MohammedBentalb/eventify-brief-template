import { type eventType } from "./index";

// SortEvents is a function that has a bubble sort implemented inside of it to sort events based of the condition it recieve from the sort input
export function sortEvents(events: eventType[], condition: string) {
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