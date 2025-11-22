import clientPromise from "@/lib/mongodb"

const projectsData = [
  {
    name: "E-commerce Platform",
    company: "TechStartup Inc",
    status: "active",
    startedDate: "2024-01-15",
    pipelineState: "in progress",
    initialPricing: 15000,
    finalPrice: 18500,
    projectType: "Software Factory",
    mmr: 2500,
    paymentStatus: "paid",
    description:
      "Full-featured e-commerce platform with inventory management, payment processing, and customer analytics dashboard.",
    docsLink: "https://docs.example.com/ecommerce-platform",
    milestones: [
      {
        date: "2024-01-15",
        type: "kickoff",
        name: "Project Kickoff",
        description: "Project initialization",
        deliverable: "Project charter",
      },
      {
        date: "2024-02-15",
        type: "design",
        name: "Design Phase Complete",
        description: "UI/UX finalized",
        deliverable: "Design system",
      },
      {
        date: "2024-03-15",
        type: "development",
        name: "Core Development",
        description: "Main features",
        deliverable: "Core implemented",
      },
      {
        date: "2024-04-15",
        type: "testing",
        name: "QA Testing",
        description: "Quality assurance",
        deliverable: "Test reports",
      },
      {
        date: "2024-05-15",
        type: "launch",
        name: "Production Launch",
        description: "Goes live",
        deliverable: "Live platform",
      },
    ],
  },
  {
    name: "Mobile App Development",
    company: "FutureWorks Ltd",
    status: "active",
    startedDate: "2024-02-20",
    pipelineState: "in progress",
    initialPricing: 25000,
    finalPrice: 28000,
    projectType: "Accelleration",
    mmr: 4200,
    paymentStatus: "partial",
    description: "Native iOS and Android mobile application with real-time synchronization and offline capabilities.",
    docsLink: "https://docs.example.com/mobile-app",
    milestones: [
      {
        date: "2024-02-20",
        type: "kickoff",
        name: "Project Start",
        description: "Mobile app initiated",
        deliverable: "Requirements",
      },
      {
        date: "2024-03-20",
        type: "design",
        name: "Mobile Design",
        description: "UI/UX design",
        deliverable: "Mockups",
      },
      {
        date: "2024-04-20",
        type: "development",
        name: "App Development",
        description: "Native development",
        deliverable: "Beta version",
      },
      {
        date: "2024-05-20",
        type: "launch",
        name: "App Store Launch",
        description: "Release",
        deliverable: "Published apps",
      },
    ],
  },
  {
    name: "Business Consulting",
    company: "Enterprise Solutions",
    status: "active",
    startedDate: "2023-11-10",
    pipelineState: "finished",
    initialPricing: 8000,
    finalPrice: 9500,
    projectType: "Consulting",
    mmr: 1500,
    paymentStatus: "paid",
    description: "Strategic business process optimization and digital transformation consulting.",
    docsLink: "https://docs.example.com/business-consulting",
    milestones: [
      {
        date: "2023-11-10",
        type: "kickoff",
        name: "Engagement Start",
        description: "Begins",
        deliverable: "Scope document",
      },
      {
        date: "2023-12-10",
        type: "analysis",
        name: "Analysis Phase",
        description: "Analysis",
        deliverable: "Analysis report",
      },
      {
        date: "2024-01-10",
        type: "implementation",
        name: "Implementation",
        description: "Improvements",
        deliverable: "Plan",
      },
      { date: "2024-02-10", type: "launch", name: "Completion", description: "Finished", deliverable: "Final report" },
    ],
  },
  {
    name: "SaaS Platform",
    company: "CloudVentures",
    status: "active",
    startedDate: "2024-03-05",
    pipelineState: "technical evaluation",
    initialPricing: 50000,
    finalPrice: null,
    projectType: "SaaS",
    mmr: 8000,
    paymentStatus: "pending",
    description: "Cloud-based SaaS platform for team collaboration with advanced reporting.",
    docsLink: "https://docs.example.com/saas-platform",
    milestones: [
      {
        date: "2024-03-05",
        type: "kickoff",
        name: "Project Initiation",
        description: "Starts",
        deliverable: "Project plan",
      },
      {
        date: "2024-04-05",
        type: "development",
        name: "MVP Development",
        description: "MVP dev",
        deliverable: "MVP release",
      },
      {
        date: "2024-05-05",
        type: "testing",
        name: "Beta Testing",
        description: "Beta",
        deliverable: "Feedback report",
      },
    ],
  },
  {
    name: "Data Analytics Tool",
    company: "DataInsights Co",
    status: "active",
    startedDate: "2024-04-01",
    pipelineState: "qualification",
    initialPricing: 12000,
    finalPrice: null,
    projectType: "Software Factory",
    mmr: 2000,
    paymentStatus: "pending",
    description: "Advanced data visualization and analytics tool for business intelligence.",
    docsLink: "https://docs.example.com/analytics-tool",
    milestones: [
      {
        date: "2024-04-01",
        type: "kickoff",
        name: "Project Kickoff",
        description: "Begins",
        deliverable: "Requirements",
      },
      {
        date: "2024-05-01",
        type: "development",
        name: "Feature Development",
        description: "Dev",
        deliverable: "Features",
      },
    ],
  },
  {
    name: "Website Redesign",
    company: "RetailBrand Co",
    status: "active",
    startedDate: "2024-04-15",
    pipelineState: "discovery",
    initialPricing: 5000,
    finalPrice: null,
    projectType: "Consulting",
    mmr: 0,
    paymentStatus: "pending",
    description: "Modern responsive website redesign with improved user experience.",
    docsLink: "https://docs.example.com/website-redesign",
    milestones: [
      {
        date: "2024-04-15",
        type: "kickoff",
        name: "Discovery Meeting",
        description: "Discovery",
        deliverable: "Document",
      },
      { date: "2024-05-15", type: "design", name: "Website Design", description: "Design", deliverable: "Mockups" },
    ],
  },
]

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db("collybrix")
    const collection = db.collection("projects")

    const count = await collection.countDocuments()
    if (count > 0) {
      return Response.json({ message: "Database already seeded", count })
    }

    const result = await collection.insertMany(projectsData)
    return Response.json({
      message: `Successfully seeded ${result.insertedIds.length} projects`,
      insertedIds: result.insertedIds,
    })
  } catch (error) {
    console.error("Failed to seed database:", error)
    return Response.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
