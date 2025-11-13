import { fetchData } from "./index.js";
// removeEvent is a function that  removes an event from the event section buy sendnig a post request to the archive api to store it in there and den a delete request to the posts api to remove it from there
export function removeEvent(arr, id) {
    let [foundEvent] = arr.filter((ev) => ev.id === id);
    if (!foundEvent)
        return arr;
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
    fetchData(`http://localhost:8080/posts/${id}`, "http://localhost:8080/archive", option, option2);
    return newArr;
}
