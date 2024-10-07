import { projects } from "@/data/projectsData"

export default function AgeEstimatorCPUDemo() {
  const project = projects.find(p => p.slug === 'age-estimator-cpu')

  return (
    <div>
      <h1>{project?.title}</h1>
      <p>{project?.description}</p>
      {/* Add your specific Face Embedding API demo components here */}
    </div>
  )
}
