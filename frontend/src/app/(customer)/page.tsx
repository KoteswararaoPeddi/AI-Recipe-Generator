import { About, Contact, Experience, Hero, Projects } from "@features/sections/components"
import {
  getAbout,
  getExperience,
  getHero,
  getProjects,
} from "@features/sections/api/sections.service"
import { EXPERIENCE_HEADING, PROJECTS_HEADING } from "@features/sections/data"

export default async function HomePage() {
  const [hero, about, projects, experience] = await Promise.all([
    getHero(),
    getAbout(),
    getProjects(),
    getExperience(),
  ])

  return (
    <>
      <Hero hero={hero} />
      <About about={about} />
      <Projects heading={PROJECTS_HEADING} projects={projects} />
      <Experience heading={EXPERIENCE_HEADING} experience={experience} />
      <Contact />
    </>
  )
}
