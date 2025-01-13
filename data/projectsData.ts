interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Unified Key Orchestrator',
    description: `A new, innovative multicloud key management solution offered as a managed service. 
      As a part of IBM Cloud Hyper Protect Crypto Services, Unified Key Orchestrator helps enterprises 
      manage your data encryption keys across multiple key stores across multiple clouds environments, 
      including keys managed on-premises, on IBM Cloud, AWS and Microsoft Azure.`,
    imgSrc: '/static/images/ibm/hpcs_uko.png',
    href: 'https://www.ibm.com/cloud/blog/announcements/unified-key-orchestrator',
  },
]

export default projectsData
