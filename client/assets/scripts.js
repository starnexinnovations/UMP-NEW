// Handle the Login Button click event to redirect to login page
document.getElementById("login-btn")?.addEventListener("click", function() {
    window.location.href = "login.html"; // Redirect to login page
});

// Simulate user registration (for demo purposes)
document.getElementById("register-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Store the user information in localStorage (for demo purposes)
    localStorage.setItem("user", JSON.stringify({ username, email }));
    
    alert("Account Created Successfully!");
    window.location.href = "login.html"; // Redirect to login page after registration
});

// Handle login form submission
document.getElementById("login-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Mock login check (for demo purposes, using hardcoded credentials)
    if (email === "user@example.com" && password === "password123") {
        alert("Login Successful!");
        
        // Store user email in localStorage (for demo purposes)
        localStorage.setItem("user", JSON.stringify({ email }));
        
        window.location.href = "select-platform.html"; // Redirect to platform selection page
    } else {
        alert("Invalid Credentials");
    }
});

// Handle platform selection and synchronize messages
let selectedPlatforms = [];

// Simulate platform selection (when an icon is clicked)
document.querySelectorAll(".platforms img").forEach(img => {
    img.addEventListener("click", function() {
        const platform = this.alt; // Get the alt text as the platform name
        if (!selectedPlatforms.includes(platform)) {
            selectedPlatforms.push(platform);
        }
        document.getElementById('selected-platforms').innerText = "Selected Platforms: " + selectedPlatforms.join(", ");
    });
});

// Handle the Start Synchronization button click
function startSynchronization() {
    if (selectedPlatforms.length > 0) {
        alert("Synchronizing messages from: " + selectedPlatforms.join(", "));
        window.location.href = "dashboard.html"; // Redirect to dashboard after synchronization
    } else {
        alert("Please select at least one platform to synchronize.");
    }
}

// Display mock messages in the dashboard
document.getElementById("messages-list")?.innerHTML = `
    <p>WhatsApp: New message from John</p>
    <p>Telegram: New message from Alice</p>
    <p>Instagram: New message from Bob</p>
`;

// Save, Share, or Download Messages (demo functionality)
function saveShareDownload() {
    alert("Messages saved, shared, or downloaded!");
}

// Handle the logout functionality
function logout() {
    alert("Logging out...");
    localStorage.removeItem("user");
    window.location.href = "index.html"; // Redirect to login page
}

// Add event listener to logout button (if available)
document.getElementById("logout-btn")?.addEventListener("click", logout);

// Redirect to profile page (for editing user profile)
document.getElementById("login-btn")?.addEventListener("click", function() {
    window.location.href = "profile.html"; // Redirect to the profile page
});
