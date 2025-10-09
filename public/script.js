// Notifications
function showNotification(msg, type="success"){
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.innerText = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Clear forms
window.addEventListener("DOMContentLoaded", ()=>{
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  if(loginForm) loginForm.reset();
  if(registerForm) registerForm.reset();
});

const registerForm = document.getElementById("register-form");
if(registerForm){
  registerForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const phoneNumber = document.getElementById("phone-number")?.value || null;

    if(password !== confirmPassword){
      showNotification("Passwords do not match","error");
      return;
    }

    try{
      const res = await fetch("http://localhost:5000/api/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,email,password,phoneNumber})
      });
      const data = await res.json();

      if(data.message === "Registration successful"){
        showNotification("Registration successful! Please verify your email.","success");
        registerForm.reset();
        setTimeout(()=>window.location.href="login.html",1500);
      } else {
        showNotification(data.error || "Registration failed","error");
      }
    }catch(err){
      showNotification("Server error","error");
    }
  });
}

// Login
const loginForm = document.getElementById("login-form");
if(loginForm){
  loginForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try{
      const res = await fetch("http://localhost:5000/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });

      const data = await res.json();

      showNotification(data.message, data.message==="Login Successful"?"success":"error");
      if(data.message==="Login Successful"){
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        loginForm.reset();
        setTimeout(()=>window.location.href="dashboard.html",1500);
      }
    }catch(err){
      console.error('Login error:', err);
      showNotification("Server error","error");
    }
  });
}


const forgetLink = document.getElementById("forget-password");
if(forgetLink){
  forgetLink.addEventListener("click", e=>{
    e.preventDefault();
    window.location.href = "forget-password.html";
  });
}


