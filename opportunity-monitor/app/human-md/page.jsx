import "./human-md.css";

export const metadata = {
  title: "HUMAN.md — Briana (Mazzio) May",
  description: "A working manifesto. Notes-to-self, mostly.",
};

export default function HumanMd() {
  return (
    <div className="hmd-root">
      <div className="hmd-page">
        {/* ── header ── */}
        <header className="hmd-header">
          <span className="hmd-byline">BRIANA (MAZZIO) MAY · APR 28, 2026</span>
          <div className="hmd-taglines">
            <p><span className="hmd-caret">&gt;</span> a working manifesto. notes-to-self, mostly.</p>
            <p><span className="hmd-caret">&gt;</span> not a thinkpiece. not a thread. not a deck.</p>
            <p><span className="hmd-caret">&gt;</span> last edited at the kitchen table, coffee #2.</p>
          </div>
        </header>

        {/* ── what this file is ── */}
        <section className="hmd-section">
          <h2 className="hmd-h2">## what this file is</h2>
          <p className="hmd-p">
            A reminder, in plain text, of what I think humans actually bring to the table now that
            the machines are very good and getting better every day.
          </p>
          <p className="hmd-p">
            I keep coming back to the word "taste" and I keep finding it too small. Taste is the
            surface. There is a whole engine underneath it, and that engine is the part the model
            can't have. Yet. Maybe ever. I don't know. I'm not in that argument. I'm in this one:
          </p>
        </section>

        {/* ── the actual job ── */}
        <section className="hmd-section">
          <h2 className="hmd-h2">## the actual job</h2>

          {/* 1 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 1. break the rule on purpose</h3>
            <p className="hmd-p">
              Models are trained on the average. The average is the floor, not the ceiling. Our job
              is not to conform a little better than the last person who conformed. Our job is to
              know the rule cold, and then break it on purpose, in public, with a reason.
            </p>
            <p className="hmd-p hmd-examples">
              Symmetry is a rule. Break it.
              <br />
              Three-act structure is a rule. Break it.
              <br />
              "Don't shoot into the sun" is a rule. Break it.
            </p>
            <p className="hmd-p">
              If you can't say why you broke it, you didn't break it, you just missed.
            </p>
          </div>

          {/* 2 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 2. find the thing in the weird place</h3>
            <p className="hmd-p">
              Inspiration does not live in the first ten image-search results. It lives in:
            </p>
            <ul className="hmd-list">
              <li>a misprinted parking ticket</li>
              <li>the way your grandfather folded a napkin</li>
              <li>an obscure Victorian zoetrope of a cat</li>
              <li>the back of a menu in a town you can't pronounce</li>
              <li>the tension in Rene Magritte's "The Son of Man", 1946</li>
            </ul>
            <p className="hmd-p">
              A model averages the internet. A human walks somewhere strange and brings back
              something unexpected.
            </p>
          </div>

          {/* 3 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 3. advocate for the human and humanity</h3>
            <p className="hmd-p">
              Every brief now has an invisible third party at the table. Someone has to keep saying
              "and what does this feel like for the person on the other end of it." Someone has to
              keep saying "how is humanity better through the birthing of this idea?" That's the
              job. Not "is it on-brand." Not "does it convert." What does it feel like? what good
              does it do?
            </p>
            <p className="hmd-p">
              If you aren't there saying it, no one will. The model certainly won't.
            </p>
          </div>

          {/* 4 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 4. design for emotional resonance, not correctness</h3>
            <p className="hmd-p">
              Tension. Surprise. Restraint. The pause before the punchline. The photograph that's
              almost in focus. The sentence that ends one beat earlier than you expected.
            </p>
            <p className="hmd-p">
              These are not bugs. These are the entire reason anyone remembers anything. "Correct"
              is the lowest bar in the building. Step over it and keep walking.
            </p>
          </div>

          {/* 5 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 5. seek delight, not delivery</h3>
            <p className="hmd-p">
              I would rather make one thing that makes someone laugh out loud on a train than ten
              things that "meet the brief." At the very least, it needs to make ME laugh. This is a
              personal bias.
            </p>
            <p className="hmd-p">If it's not at least a little bit fun, why are we here?</p>
          </div>

          {/* 6 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 6. experiment ruthlessly, ship more than you opine</h3>
            <p className="hmd-p hmd-examples">
              A working sketch beats a confident take. Every time.
              <br />
              A bad first draft beats a brilliant unwritten one. Every time.
              <br />
              A weird little prototype beats a slide deck about prototyping.
              <br />
              Every. Time.
            </p>
            <p className="hmd-p">
              Make 50 things. Throw away 47. Talk about the 3.
              <br />
              Do not, under any circumstances, become a person who mostly posts opinions about
              other people's work.
            </p>
          </div>

          {/* 7 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 7. own the output. fully.</h3>
            <p className="hmd-p">
              If the AI output is bad, the AI did not fail you. You failed it. You picked the tool.
              You wrote the prompt. You accepted the result. You shipped it.
            </p>
            <p className="hmd-p">
              The fix is not a better model, or a return to tools of the past. The fix is a sharper
              you. Sharpen yourself. Sharpen your ideas. Sharpen the way you say what you mean,
              because the gap between what you wanted and what came back is almost always a gap in
              you, not in the tool.
            </p>
            <p className="hmd-p">
              Powerful tools reward the people who showed up sharp, iterate, spend extra time on
              the vision. They expose the people who didn't. AI is not the great equalizer, it is
              the great amplifier.
            </p>
          </div>

          {/* 8 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 8. design with it, not next to it</h3>
            <p className="hmd-p hmd-examples">
              Watching the generation happen is not the work.
              <br />
              Prompting once and accepting the result is not the work.
              <br />
              The work is the back-and-forth. The push. The loop. The "again, but tweak it this
              way..." The hundredth iteration where the thing finally clicks.
            </p>
            <p className="hmd-p">
              If you're a spectator to your own output, you are not the author of your own output.
              Get your hands in.
            </p>
          </div>

          {/* 9 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 9. play with purpose. and play for play.</h3>
            <p className="hmd-p hmd-examples">
              Both. At the same time.
              <br />
              Some days the play is in service of a thing.
              <br />
              Some days the play is the thing.
              <br />
              A practice that only ever has goals is a job. A practice that never has goals is a
              hobby. The good work lives in between.
            </p>
            <p className="hmd-p">
              Play doesn't result in burnout. It results in excitement, happiness, experiment, the
              unexpected, and an urge to play more.
            </p>
          </div>

          {/* 10 */}
          <div className="hmd-rule">
            <h3 className="hmd-h3">### 10. be a builder and an ideas person</h3>
            <p className="hmd-p">
              The split is fake. It was always fake. It's especially fake now. The people who can
              think of the thing and make the thing are going to eat. The people who can only do
              one half are going to be very busy explaining why the other half is hard, or blame the
              processes or tools.
            </p>
            <p className="hmd-p">
              Don't be that person. Learn the other half. It's never been cheaper to learn it.
            </p>
          </div>
        </section>

        {/* ── trying to stop ── */}
        <section className="hmd-section">
          <h2 className="hmd-h2">## things I am trying to stop doing</h2>
          <ul className="hmd-list">
            <li>waiting until it's "ready"</li>
            <li>editing in my head instead of on the page</li>
            <li>making but not sharing publicly</li>
            <li>taking briefs that secretly bore me</li>
            <li>pretending taste is an innate quality</li>
            <li>treating "AI" like a noun instead of a verb</li>
          </ul>
        </section>

        {/* ── trying to do more ── */}
        <section className="hmd-section">
          <h2 className="hmd-h2">## things I am trying to do more</h2>
          <ul className="hmd-list">
            <li>finish the bad version first</li>
            <li>show people the in-between, mess, experiments</li>
            <li>write the thing I'd want to read</li>
            <li>dig deeper, get help</li>
            <li>stop pretending I know stuff, ask dumber questions</li>
            <li>say the more specific thing</li>
          </ul>
        </section>

        {/* ── sign-off ── */}
        <footer className="hmd-footer">
          <p className="hmd-p">
            This file will be wrong in six months. That is fine.
            <br />
            I'd rather be specifically wrong than vaguely correct.
          </p>
          <p className="hmd-sig">— b.</p>
          <p className="hmd-timestamp">last touched, kitchen table, late.</p>
        </footer>
      </div>
    </div>
  );
}
