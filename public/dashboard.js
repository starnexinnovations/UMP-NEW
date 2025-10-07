const proceedBtn = document.querySelector('.primary-btn');
const checkboxes = document.querySelectorAll('input[name="platforms"]');

// Create unified inbox section dynamically if not exists
let inbox = document.getElementById('unified-inbox');
if(!inbox){
  inbox = document.createElement('section');
  inbox.id = 'unified-inbox';
  inbox.innerHTML = '<h2>Unified Inbox</h2><div id="messages-container"></div>';
  document.body.appendChild(inbox);
}

const messagesContainer = document.getElementById('messages-container');

proceedBtn.addEventListener('click', () => {
  messagesContainer.innerHTML = ''; // Clear previous messages

  checkboxes.forEach(cb => {
    if(cb.checked){
      const div = document.createElement('div');
      div.classList.add('message');

      switch(cb.value){
        case 'whatsapp':
          div.classList.add('whatsapp');
          div.textContent = 'WhatsApp: "Dei thambi, nee inum clg mudichi varalaya?"';
          break;
        case 'telegram':
          div.classList.add('telegram');
          div.textContent = 'Telegram: "Happy Birthday anna!"';
          break;
        case 'instagram':
          div.classList.add('instagram');
          div.textContent = 'Instagram: "Message from Instagram!"';
          break;
        case 'facebook':
          div.classList.add('facebook');
          div.textContent = 'Facebook: "Message from Facebook!"';
          break;
      }

      messagesContainer.appendChild(div);
    }
  });

  if(messagesContainer.innerHTML === ''){
    const div = document.createElement('div');
    div.classList.add('message', 'error');
    div.textContent = 'Please select at least one platform!';
    messagesContainer.appendChild(div);
  }
});
