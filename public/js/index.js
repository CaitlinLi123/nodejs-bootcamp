import { login } from "./login";
import { displayMap } from "./mapbox";
import "@babel/polyfill";

//DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form");

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById("map").dataset.locations
  );
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    e.preventDefault();
    login(email, password);
  });
}
