"use strict";

const button = document.getElementById("greeting-button");
const greeting = document.getElementById("greeting");

button.addEventListener("click", () => {
  greeting.textContent = "你好，世界！欢迎开始你的网页开发之旅。";
});
