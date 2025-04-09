"use strict";

function customizedFormValidationMessage() {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const submit = document.getElementById("submit");
    submit.addEventListener("click", function() {
        if (username.validity.valueMissing) {
            username.setCustomValidity("Missing username!!");
        } else {
            username.setCustomValidity("");
        }
        
        if (password.validity.valueMissing) {
            password.setCustomValidity("Password is missing!!");
        } else {
            password.setCustomValidity("");
        }
    });
}

function loadAllStuff() {
    customizedFormValidationMessage();
}

document.addEventListener("DOMContentLoaded", loadAllStuff);
