export function ContactSection() {
  return (
    <div className="contact-section" id="contactSection">
      <h2>get in touch</h2>
      <form action="https://formspree.io/f/mzzgyjzk" method="POST">
        <input type="text" name="name" placeholder="Your name" required />
        <input type="email" name="email" placeholder="Your email" required />
        <textarea name="message" placeholder="Your message..." required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}
