// load-navbar.js
document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load navbar: " + response.status);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;

      // Scroll to top after navbar loads
      window.scrollTo(0, 0);
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
    });
});
