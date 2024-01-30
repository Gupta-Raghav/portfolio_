import React, { useState } from 'react'
import './contact.css'
import CardComponent from './Contact_card';
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
    <div className="contact" id="contact">
         <div className='title_container'>
        <div className="title">
            <h3>Contact</h3>
        </div>
        </div>
           <div class="wrapper">
            <div className="contact_card">
            <CardComponent/>
            </div>
            
            <div class="grid3">
            <a href='mailto:connectto.guptaraghav@gmail.com' ><h2>connectto.guptaraghav@gmail.com</h2></a>

            </div>
    </div>
    </div>
  )
}

export default Contact