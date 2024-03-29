import React, { useState } from 'react'
import './contact.css'
function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('')
    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission, e.g., send data to a server or display it
        console.log({ name, email, message });
    };
  return (
    <div className="contact">
           <div class="wrapper">
        <div className="grid1">
            <h2 className='bento-text'>
                CONTACT
            </h2 >
            </div>
            <div className="grid2">
               *
            </div>
            <div class="grid10">
            <form onSubmit={handleSubmit} className='form'>
                <label htmlFor="name">Name</label>
                <div>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <label htmlFor="email">Email</label>
                <div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <label>Message</label>
                <div className='message'>
                    <input
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            <button type="submit">Send</button>
        </form>

            </div>
    </div>
    </div>
  )
}

export default Contact