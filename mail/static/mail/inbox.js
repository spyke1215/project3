document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


// Compose Email
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

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

// Reply email
function reply_email(sender, subject, timestamp, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body}`;

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

// Load mailbox for inbox, sender and archive
function load_mailbox(mailbox) {

  clearBox('mail-view') // Removing id 'mail-view' in HTML

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

  function add_mail(contents){

    const mail = document.createElement('div');
    mail.className = `mail row`;
    mail.innerHTML = 
    `
    <div class="col-3 sender">
      <b>${contents.sender}</b> 
    </div>
    <div class="col-5 subject">
      ${contents.subject} 
    </div>
    <div class="col-4 timestamp">
      ${contents.timestamp}
    </div>
    `;
  
    if (contents.read === true) { // Changing background colors for read and unread
      mail.style.background = 'gray';
    }else{
      mail.style.background = 'white';
    }
    
    mail.addEventListener('click', function() { // Adding event listener for clicking the area

      if (contents.read === false){  // if the mail is not read
        update_read(contents.id) // then update the it to read
      }

      load_mail(contents.id, mailbox) // Load the email 

    });
  
    document.querySelector('#emails-view').append(mail);
  
  };
}

//load mail for certain id mail
function load_mail(num, mailbox){

  clearBox('mail-view') // Removing id 'mail-view' in HTML

  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${num}`)
  .then(response => response.json())
  .then(email => {

    const mail = document.createElement('div');
    mail.className = 'email';
    mail.innerHTML = 
    `
    <b>FROM:</b> ${email.sender}<br>
    <b>TO:</b> ${email.recipients}<br>
    <b>SUBJECT:</b> ${email.subject}<br>
    <b>TIMESTAMP:</b>${email.timestamp}<br>
    <button id="reply" class="btn btn-outline-primary">Reply</button>
    `;

    if (mailbox === 'inbox'){ // If it's inbox, then add a archive button
      mail.innerHTML +=
      `<button id="archive" class="btn btn-outline-primary">Archive</button>`;
    }else if (mailbox === 'archive'){ // Else if it's archive, then add a unarchive button
      mail.innerHTML +=
      `<button id="unarchive" class="btn btn-outline-primary">Unarchive</button>`;
    }

    mail.innerHTML += // Adding <hr> and body of the email
    `<hr>
    ${email.body}
    `;
    
    mail.addEventListener('click', event =>  { // Adding event listener
      
      const element = event.target // This checks what id of the HTML that was clicked

      if (element.id === 'reply'){
        reply_email(email.sender, email.subject, email.timestamp, email.body)
      }

      if (element.id === 'archive'){
        update_archive(email.id, true)
      }

      if (element.id === 'unarchive'){
        update_archive(email.id, false)
      }

    })
    
    document.querySelector('#mail-view').append(mail);

  });

};

// For clearing HTML
function clearBox(elementID){
  document.getElementById(elementID).innerHTML = "";
}

// Updated if the email has been read
function update_read(content) {

  fetch(`/emails/${content}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  console.log("READ = TRUE")
};

// Archive update. Can use true or false as a parameter
function update_archive(content, bool) {

  fetch(`/emails/${content}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: bool
    })
  })
  console.log("ARCHIVE = TRUE")
};
