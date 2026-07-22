const html = document.documentElement;
const darkToggleBtn = document.getElementById("darkToggle");

// Load theme when page opens
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "dark"; // dark is default

    html.setAttribute("data-theme-mode", savedTheme);
    
    // Sync the checkbox state with the theme
    if (darkToggleBtn) {
        darkToggleBtn.checked = savedTheme === "dark";
    }
});

// Toggle theme using the 'change' event for a checkbox
if (darkToggleBtn) {
    darkToggleBtn.addEventListener("change", updateTheme);
}

function updateTheme() {
    if (darkToggleBtn.checked) {
        html.setAttribute("data-theme-mode", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        html.setAttribute("data-theme-mode", "light");
        localStorage.setItem("theme", "light");
    }
}