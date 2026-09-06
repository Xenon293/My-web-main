import { Reveal } from './Reveal';

const EMAIL = 'hanielvantecil@gmail.com';

export function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `Portfolio message from ${form.get('name')}`;
    const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="contact-band" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <div className="contact-left">
          <Reveal><span className="eyebrow">05 / Contact</span><h2 id="contact-title">Let&apos;s keep<br /><em>in touch.</em></h2></Reveal>
          <Reveal className="contact-details" delay={100}>
            <p className="contact-lead">Have a project in mind, feedback on my work, or want to collaborate? Feel free to send a message or reach out directly.</p>
            <div className="contact-direct"><span className="detail-label">Direct Email</span><a className="light-link" href={`mailto:${EMAIL}`} aria-label={`Send email to ${EMAIL}`}>{EMAIL} ↗</a></div>
            <div className="contact-location"><span className="detail-label">Location</span><span className="location-text">Cebu, Philippines · UTC+8</span></div>
            <div className="social-links"><a href="https://github.com/Xenon293" target="_blank" rel="noreferrer" className="social-btn">GitHub ↗</a><span className="social-sep">·</span><span className="social-tag">LinkedIn coming soon</span></div>
          </Reveal>
        </div>
        <div className="contact-right"><Reveal delay={150}><div className="contact-form-card">
          <p className="form-note">This opens your email app with the message ready to send.</p>
          <form className="accessible-contact-form" onSubmit={handleSubmit}>
            <div className="form-group"><label htmlFor="contact-name">Name <span className="req-asterisk" aria-hidden="true">*</span></label><input id="contact-name" name="name" type="text" required placeholder="Your name" autoComplete="name" /></div>
            <div className="form-group"><label htmlFor="contact-email">Email <span className="req-asterisk" aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></div>
            <div className="form-group"><label htmlFor="contact-message">Message <span className="req-asterisk" aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows="4" required placeholder="Tell me about your idea, project, or question..." /></div>
            <button type="submit" className="contact-submit-btn">Open email draft ↗</button>
          </form>
        </div></Reveal></div>
      </div>
    </section>
  );
}
