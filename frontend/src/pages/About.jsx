import { useNavigate } from "react-router-dom";

function AboutUsPage () {
  const navigate = useNavigate();
  return(
    <>
    <div className="terms-and-condition-header">
      <div className="terms-brand" onClick={()=>navigate('/')}>
        <i className="fa-solid fa-arrow-left"></i>
      </div>
    </div>

    <main className="about-container">
      <section className="about-card fade-in">
        <h1 className="about-us-text-one">Promoting Fair and Safe Exams at Pampanga State University</h1>
        <p className="about-us-p-one">We are INsys, set to maintain the highest standards of academic integrity throughout our campus. It was created to support the assessment at this institution, ensuring that every examination mirrors the real knowledge and abilities of the students.</p>
      </section>

        <section className="about-grid about-section">
          <div className="about-span-8">
            <div className="about-card fade-in delay-1">
              <h2 className="about-us-text-two">Our Mission</h2>
              <p className="about-us-p-two">In building a more secure and transparent examination milieu where honest students can actually perform their best without fear knowing that the fruits of their nightless studies are protected. Credit the degree earned from our university while upholding its culture of honesty and excellence.</p>
            </div>
          </div>
          <aside className="about-span-4">
            <div className="about-card fade-in delay-2">
              <h2 className="about-us-text-two">What we value</h2>
              <ul>
                <li>Fairness and integrity</li>
                <li>Anti-cheating technology</li>
                <li>Security and privacy</li>
                <li>Reliable online assessments</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="about-section">
          <div className="about-card fade-in delay-3">
            <h2 className="about-us-text-two">What We Do</h2>
            <p>We present the overseeing authority for all round seriously examining security and whole monitoring across our university...</p>
          </div>
        </section>
    </main>

   
    <div className="terms-and-condition-footer">
      <span id="year"></span> Pampanga State University - INsys. All rights reserved.
    </div>
    </>
  )
}

// export const MissionPage = () => {
//   return(
//     <>
//       Mission
//     </>
//   )
// }

export const TermsConditionsPage = () => {
  const navigate = useNavigate();
  return(
    <>
    <div className="terms-and-condition-header">
      <div className="terms-brand"  onClick={()=>navigate('/')}>
        <i className="fa-solid fa-arrow-left"></i>
      </div>
    </div>

    <main className="terms-container">
      <section className="terms-card fade-in">
        <h1 className="terms-and-condition-text-one">Terms and Conditions</h1>
        <p className="terms-and-condition-p-one">Please read these terms and conditions carefully before using our services.</p>
      </section>

      <section className="terms-card fade-in delay-1 terms-section-16">
        <h2 className="terms-and-condition-text-two">Acceptance of Terms</h2>
        <p className="terms-and-condition-p-two">Access to these Facilities of Pampanga State University is an acknowledgment that you have read, understood, and agreed to comply with these Terms and Conditions. There is no gaining entry unless you accept the terms. If you don't accept, you shouldn't use this system.</p>
      </section>

      <section className="terms-card fade-in delay-2 terms-section-12">
        <h2 className="terms-and-condition-text-two">Scope of Services</h2>
        <p className="terms-and-condition-p-three">The terms mentioned here govern the use of our web-based examination monitoring platform for all online assessments, inclusive of midterm examinations, final examinations, quizzes, make-up tests, and any other formal-type assessment administered in this system at Pampanga State University.</p>
      </section>

      <section className="terms-card fade-in delay-3 terms-section-12">
        <h2 className="terms-and-condition-text-two">System Access and Account Security</h2>
        <h3 className="terms-and-condition-text-four">Account Credentials</h3>
        <p className="terms-and-condition-p-four">Students will receive unique login credentials through their official university email. You bear the responsibility for keeping your username and password secure and protected. Sharing account credentials is strictly prohibited and will constitute academic misconduct.</p>
        <h3 className="terms-and-condition-text-four">Access Authorization</h3>
        <p className="terms-and-condition-p-five">Access that has been authorized only to Students of Pampanga State University has permission to use the reason. Unpermissions, attempts to bypass the security measures, and impersonification of another student will definitely impose prompt suspension of access and disciplinary actions.</p>
      </section>

    

      <section className="terms-card fade-in delay-2 terms-section-12">
        <h2 className="terms-and-condition-text-two">Acknowledgment and Consent</h2>
        <ul>
          <li>The reading of the entire Terms and Conditions and the understanding of the same by you</li>
          <li>All monitoring, recording, and data collection as stated</li>
          <li>The compliance with all rules and requirements</li>
          <li>The comprehension of the violation results</li>
          <li>The taking of full responsibility for the technical setup and the examination environment</li>
        </ul>
        <p>InSys Unit needs to be contacted for any questions or issues regarding the exam, a measure that is highly encouraged.</p>
      </section>
    </main>

    <div className="terms-and-condition-footer">
        <span id="year"></span> Pampanga State University - INsys. All rights reserved.
    </div>
    </>
  )
}

export default AboutUsPage;