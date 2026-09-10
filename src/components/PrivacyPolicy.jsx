export function PrivacyPolicy() {
  return (
    <section className="privacy-policy" id="privacy">
      <div className="privacy-heading"><span className="eyebrow">Site information</span><h2>Privacy &amp; Cookie Policy</h2><p>How this portfolio uses browser storage, optional presence data, and third-party services.</p></div>
      <div className="privacy-copy">
        <p><strong>Last updated: September 11, 2026.</strong></p>
        <p>This portfolio does not require an account and does not sell personal information.</p>
        <h3>Necessary browser storage</h3>
        <p>Local storage remembers your theme, consent choice, dismissed tips, typing-test settings, and Buddy usage limit. These values remain in your browser and are necessary for the related preferences to work.</p>
        <h3>Optional presence tracking</h3>
        <p>If you accept optional storage, the site creates a random visitor ID and sends it with a last-seen timestamp to Supabase. This is used only to estimate the number of active visitors. Presence remains disabled when you reject optional storage.</p>
        <h3>Contact and Buddy</h3>
        <p>The contact form does not submit information to this website. It opens your email application with a draft addressed to the site owner. If you ask Pixel Buddy a custom question, the prompt is sent to a Netlify server function and then to Google’s Gemini service. Preset Buddy questions run locally.</p>
        <h3>Other third parties</h3>
        <p>Google Fonts may receive ordinary technical request data when fonts load. Supabase, Netlify, and Google may process technical request data according to their own policies when their respective features are used.</p>
        <h3>Your choices</h3>
        <p>Use the Privacy settings button to accept, reject, or revisit optional presence tracking. You may also clear this site’s storage in your browser. Contact the site owner if you have a privacy question.</p>
      </div>
    </section>
  );
}
