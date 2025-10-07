function showNotification(message, type="success"){
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.innerText = message;
  document.body.appendChild(notif);
  setTimeout(()=>notif.remove(),3000);
}

const forgetForm = document.getElementById("forget-form");
if(forgetForm){
  forgetForm.addEventListener("submit", async e=>{
    e.preventDefault(); // prevent default form submit

    const email = document.getElementById("forget-email").value;
    const newPassword = document.getElementById("forget-new").value;
    const confirmPassword = document.getElementById("forget-confirm").value;

    try{
      const res = await fetch("http://localhost:5000/reset-password", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email,newPassword,confirmPassword})
      });

      const msg = await res.text();
      showNotification(msg, msg==="Password changed successfully"?"success":"error");

      if(msg==="Password changed successfully"){
        forgetForm.reset();
        setTimeout(()=>window.location.href="login.html",1500); // redirect to login
      }

    }catch(err){
      showNotification("Server error","error");
    }
  });
}

// Cancel button
const cancelBtn = document.getElementById("cancel-btn");
if(cancelBtn){
  cancelBtn.addEventListener("click", ()=>{
    window.location.href="login.html"; // redirect immediately
  });
}
