document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  }
}

function load_mailbox(mailbox) {

  if (mailbox === 'inbox' || mailbox === 'sent' || mailbox ===  'archive') { // This is for getting the all mail

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      emails.forEach(add_mail)

    });

  }else{ // This is for ID of the mail
    
    document.querySelector('#mail-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(email => {
      
      const mail = document.createElement('div');
      mail.className = 'email';
      mail.innerHTML = 
      `
      <b>FROM:</b>${email.sender}<br>
      <b>TO:</b>${email.recipients}<br>
      <b>SUBJECT:</b>${email.subject}<br>
      <b>TIMESTAMP:</b>${email.timestamp}<br>
      <button class="btn btn-outline-primary">reply</button>
      <hr>
      ${email.body}
      `;

      document.querySelector('#mail-view').appendChild(mail);

    });
  }
}

function add_mail(contents){

  // Create new mail
  const mail = document.createElement('div');
  mail.className = `mail row`;
  mail.innerHTML = 
  `
  <div class="col-3 sender">
    <b>${contents.sender}</b> 
  </div>
  <div class="col-4 subject">
    ${contents.subject} 
  </div>
  <div class="col-5 timestamp">
    ${contents.timestamp}
  </div>
  `;

  if (contents.read === true) {
    mail.style.background = 'gray';
  }else{
    mail.style.background = 'white';
  }
  
  mail.addEventListener('click', function() {
    boolean = 'true'
    if (contents.read === false){
      update_read(contents.id)
    }
    load_mailbox(contents.id)
  });

  // Add mail to DOM
  document.querySelector('#emails-view').append(mail);
};

function update_read(content) {

  fetch(`/emails/${content}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  console.log("READ = TRUE")
}

function update_archive(content, boolean) {

  fetch(`/emails/${content}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: boolean
    })
  })
  console.log("ARCHIVE = TRUE")
}
