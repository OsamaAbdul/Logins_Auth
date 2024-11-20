document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const form = document.getElementById("signinForm");
    const popupMessage = document.getElementById("popupMessage");
  
    // Simulate preloader fadeout
    setTimeout(() => {
      preloader.style.display = "none";
    }, 1500);
  
    // form.addEventListener("submit", (event) => {
    //   event.preventDefault();
    //   const email = document.getElementById("email").value;
    //   const password = document.getElementById("password").value;
  
    //   // Simulated login check
    //   if (email === "user@example.com" && password === "password123") {
    //     showPopup("Login Successful", "success");
    //   } else {
    //     showPopup("Wrong Email or Password", "error");
    //   }
    // });
  
    function showPopup(message, type) {
      popupMessage.textContent = message;
      popupMessage.className = `popup-message ${type === "error" ? "error" : "success"} show`;
  
      setTimeout(() => {
        popupMessage.classList.remove("show");
      }, 3000);
    }
  });
  