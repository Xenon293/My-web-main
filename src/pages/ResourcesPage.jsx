import { LineIcon } from "../components/LineIcon";
import { Reveal } from "../components/Reveal";
import { resources } from "../data/siteContent";

export default function ResourcesPage() {
  return (
    <main className="content-page" id="top">
      <header className="page-intro">
        <span className="eyebrow">Learning library</span>
        <h1 aria-label="Keep learning.">Keep<br /><em>learning.</em></h1>
        <p>A short list of references, courses, and practice environments I return to while building my foundations.</p>
      </header>
      <section className="resource-index" aria-label="Learning resources">
        {resources.map((group, index) => (
          <Reveal as="article" className="resource-index__group" delay={index * 70} key={group.category}>
            <span className="resource-index__number">0{index + 1}</span>
            <h2>{group.category}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span>{link.name}</span><LineIcon name="arrowUpRight" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </section>
    </main>
  );
}
