"use client";

import { useState, useEffect } from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority?: "high" | "medium";
  completed: boolean;
}

interface Phase {
  id: string;
  title: string;
  timeline: string;
  items: ChecklistItem[];
}

interface TacticCard {
  icon: string;
  title: string;
  metric: string;
  items: string[];
}

export default function WebsiteLaunchPlanPage() {
  const [prelaunchPhases, setPrelaunchPhases] = useState<Phase[]>([
    {
      id: "day1-2",
      title: "Day 1-2: Finalize & Prepare",
      timeline: "Nov 25-26",
      items: [
        {
          id: "complete-website",
          title: "Complete all website sections",
          description:
            "Ensure all core pages are ready: Home, Services, About, Contact, Case Studies/Portfolio. Test on mobile and desktop.",
          priority: "high",
          completed: false,
        },
        {
          id: "analytics",
          title: "Set up analytics & tracking",
          description:
            "Install Google Analytics 4, set up conversion goals (contact form, consultation requests), add Meta Pixel for retargeting.",
          priority: "high",
          completed: false,
        },
        {
          id: "lead-capture",
          title: "Prepare lead capture system",
          description:
            "Test contact forms, set up autoresponders, create lead magnet (e.g., &quot;Startup Tech Stack Guide&quot; or &quot;MVP Development Checklist&quot;).",
          priority: undefined,
          completed: false,
        },
        {
          id: "seo-basics",
          title: "SEO basics",
          description:
            "Optimize meta titles, descriptions, H1 tags. Submit sitemap to Google Search Console. Set up Google Business Profile.",
          priority: undefined,
          completed: false,
        },
      ],
    },
    {
      id: "day3-4",
      title: "Day 3-4: Content & Social Prep",
      timeline: "Nov 27-28",
      items: [
        {
          id: "launch-content",
          title: "Create launch announcement content",
          description:
            "Write LinkedIn post, Twitter/X thread, email announcement. Focus on your unique value: &quot;AI-accelerated development + human expertise&quot;.",
          priority: "high",
          completed: false,
        },
        {
          id: "social-content",
          title: "Prepare 2 weeks of social content",
          description:
            "Create 10-14 posts showcasing: founder expertise, startup tips, client success stories, behind-the-scenes, problem/solution posts.",
          priority: undefined,
          completed: false,
        },
        {
          id: "email-list",
          title: "Build launch day email list",
          description:
            "Compile list of: past clients, network contacts, accelerator connections (Wayra!), startup communities, tech communities in Spain.",
          priority: undefined,
          completed: false,
        },
        {
          id: "press-outreach",
          title: "Prepare press/blog outreach list",
          description:
            "Identify 20-30 startup blogs, tech publications, Spanish startup media, and accelerator newsletters to contact.",
          priority: undefined,
          completed: false,
        },
      ],
    },
    {
      id: "day5-6",
      title: "Day 5-6: Strategic Prep",
      timeline: "Nov 29-30",
      items: [
        {
          id: "ads-campaigns",
          title: "Set up ads campaigns (optional but recommended)",
          description:
            "Create LinkedIn Ads targeting startup founders, Google Ads for &quot;technical cofounder&quot; searches. Budget: €300-500 for first month.",
          priority: "medium",
          completed: false,
        },
        {
          id: "partnership-outreach",
          title: "Prepare partnership outreach",
          description:
            "Draft personalized messages for Wayra, other accelerators, startup communities, coworking spaces in Madrid/Barcelona.",
          priority: undefined,
          completed: false,
        },
        {
          id: "case-study",
          title: "Create case study/success story",
          description:
            "Document one strong example: problem → Collybrix solution → results. Use this across all marketing.",
          priority: undefined,
          completed: false,
        },
        {
          id: "schedule-content",
          title: "Schedule launch week content",
          description:
            "Use Buffer/Hootsuite to schedule posts for Monday-Friday. Plan 2-3 posts per day across platforms.",
          priority: undefined,
          completed: false,
        },
      ],
    },
    {
      id: "day7",
      title: "Day 7: Final Checks",
      timeline: "Dec 1 (Sunday)",
      items: [
        {
          id: "qa-test",
          title: "Full website QA test",
          description:
            "Test all links, forms, mobile responsiveness, page load speeds. Have 2-3 people review for typos/bugs.",
          priority: undefined,
          completed: false,
        },
        {
          id: "queue-announcements",
          title: "Queue launch announcements",
          description:
            "Schedule social posts for 9am Monday. Prepare email for 10am send. Have launch day content ready to go.",
          priority: undefined,
          completed: false,
        },
        {
          id: "monitoring",
          title: "Prepare for launch day monitoring",
          description:
            "Set up dashboards to watch: website traffic, form submissions, social engagement, email open rates.",
          priority: undefined,
          completed: false,
        },
      ],
    },
  ]);

  const [launchPhases, setLaunchPhases] = useState<Phase[]>([
    {
      id: "monday-morning",
      title: "Monday Morning: The Big Push",
      timeline: "9am-12pm",
      items: [
        {
          id: "social-blitz",
          title: "Social media blitz",
          description:
            "Post launch announcement on LinkedIn (personal + company), Twitter/X, relevant startup Facebook groups, ProductHunt (if ready).",
          priority: "high",
          completed: false,
        },
        {
          id: "email-network",
          title: "Email your network",
          description:
            "Send personalized launch email to your compiled list. Include clear CTA: &quot;Book a free consultation&quot; or &quot;Get your startup assessment&quot;.",
          priority: "high",
          completed: false,
        },
        {
          id: "engage-actively",
          title: "Engage actively",
          description:
            "Spend 2 hours responding to comments, DMs, emails. Every interaction builds momentum and trust.",
          priority: undefined,
          completed: false,
        },
      ],
    },
    {
      id: "monday-afternoon",
      title: "Monday Afternoon: Amplify",
      timeline: "2pm-6pm",
      items: [
        {
          id: "community-outreach",
          title: "Community outreach",
          description:
            "Post in relevant Reddit (r/startups, r/entrepreneur), Indie Hackers, startup Slack/Discord communities. Be helpful, not salesy.",
          priority: undefined,
          completed: false,
        },
        {
          id: "direct-outreach",
          title: "Direct outreach to warm leads",
          description:
            "Send personalized DMs to 20-30 potential clients you&apos;ve identified. Mention specific pain points you can solve.",
          priority: undefined,
          completed: false,
        },
        {
          id: "monitor-respond",
          title: "Monitor and respond",
          description:
            "Keep tabs on analytics. Respond to all inquiries within 1 hour. Speed = trust for new launches.",
          priority: undefined,
          completed: false,
        },
      ],
    },
    {
      id: "tuesday-wednesday",
      title: "Tuesday-Wednesday: Sustain Momentum",
      timeline: "Day 2-3",
      items: [
        {
          id: "share-wins",
          title: "Share early wins",
          description:
            "Post updates: &quot;First X sign-ups!&quot;, &quot;Amazing conversations with founders today!&quot;. Social proof drives more interest.",
          priority: undefined,
          completed: false,
        },
        {
          id: "continue-posting",
          title: "Continue daily posting",
          description:
            "Share valuable content daily: startup tips, tech insights, founder stories. Position Collybrix as thought leaders.",
          priority: undefined,
          completed: false,
        },
        {
          id: "follow-up-leads",
          title: "Follow up with leads",
          description:
            "Reach out to everyone who engaged. Offer free value: consultation, advice, resources. Build relationships first.",
          priority: undefined,
          completed: false,
        },
      ],
    },
  ]);

  const [prelaunchProgress, setPrelaunchProgress] = useState(0);
  const [launchProgress, setLaunchProgress] = useState(0);

  const tactics: TacticCard[] = [
    {
      icon: "📝",
      title: "Content Marketing",
      metric: "Goal: 2-3 posts/week",
      items: [
        "LinkedIn thought leadership: Share CTO insights, technical decision frameworks, startup scaling stories",
        "Blog posts: &quot;5 Technical Mistakes That Kill Startups&quot;, &quot;How to Choose Your Tech Stack&quot;, &quot;MVP vs Full Product: A CTO&apos;s Guide&quot;",
        "Case studies: Document client journeys (with permission) showing before/after transformations",
        "Video content: Short tips, behind-the-scenes of working with startups, tech explainers",
      ],
    },
    {
      icon: "🤝",
      title: "Partnership Strategy",
      metric: "Goal: 5-10 partnerships",
      items: [
        "Accelerator partnerships: Wayra, Lanzadera, Startup Valencia, Ship2B—become their technical partner",
        "Coworking spaces: WeWork, Utopicus, Impact Hub—offer workshops or office hours",
        "Business schools: IE, ESADE—guest lecture, mentor MBA students&apos; projects",
        "Startup events: Sponsor or speak at Startup Grind Madrid, TechCrunch Barcelona, 4YFN",
      ],
    },
    {
      icon: "🎯",
      title: "Paid Advertising",
      metric: "Budget: €500-1000/month",
      items: [
        "LinkedIn Ads: Target startup founders, entrepreneurs in Spain/LATAM. Use lead gen forms for consultation bookings",
        "Google Ads: Bid on &quot;technical cofounder&quot;, &quot;CTO for startup&quot;, &quot;MVP development Spain&quot;",
        "Retargeting: Show testimonials and case studies to website visitors who didn&apos;t convert",
        "Test & optimize: Start small, measure ROI, double down on what works",
      ],
    },
    {
      icon: "🗣️",
      title: "Thought Leadership",
      metric: "Goal: 1-2 speaking gigs/month",
      items: [
        "Podcast guesting: Reach out to Spanish startup podcasts, tech entrepreneurship shows",
        "Webinars: Host free webinars on &quot;Technical Strategy for Non-Technical Founders&quot;",
        "Guest articles: Write for TechCrunch ES, Startupeable, Novobrief",
        "LinkedIn Live: Weekly or biweekly live Q&As about startup tech challenges",
      ],
    },
    {
      icon: "💌",
      title: "Email Nurture Campaign",
      metric: "Goal: Build to 500+ subscribers",
      items: [
        "Lead magnet: &quot;The Startup Tech Stack Playbook&quot; or &quot;100K Users: A Technical Roadmap&quot;",
        "Weekly newsletter: Share startup tech tips, industry insights, Collybrix updates",
        "Automated sequences: Welcome series → educational content → consultation offer",
        "Segmentation: Different tracks for early-stage vs scaling startups",
      ],
    },
    {
      icon: "🎁",
      title: "Free Value Strategy",
      metric: "Goal: Build trust & authority",
      items: [
        "Free tech audits: Offer 15-minute &quot;Technical Health Check&quot; for startups",
        "Open-source contributions: Create helpful tools/templates for founders",
        "AMA sessions: Reddit, Twitter Spaces, LinkedIn—answer founder questions",
        "Referral program: Incentivize happy clients to introduce you to other founders",
      ],
    },
  ];

  useEffect(() => {
    calculateProgress();
  }, [prelaunchPhases, launchPhases]);

  const calculateProgress = () => {
    const prelaunchTotal = prelaunchPhases.reduce(
      (acc, phase) => acc + phase.items.length,
      0
    );
    const prelaunchCompleted = prelaunchPhases.reduce(
      (acc, phase) => acc + phase.items.filter((item) => item.completed).length,
      0
    );
    setPrelaunchProgress(
      prelaunchTotal > 0
        ? Math.round((prelaunchCompleted / prelaunchTotal) * 100)
        : 0
    );

    const launchTotal = launchPhases.reduce(
      (acc, phase) => acc + phase.items.length,
      0
    );
    const launchCompleted = launchPhases.reduce(
      (acc, phase) => acc + phase.items.filter((item) => item.completed).length,
      0
    );
    setLaunchProgress(
      launchTotal > 0 ? Math.round((launchCompleted / launchTotal) * 100) : 0
    );
  };

  const togglePrelaunchItem = (phaseId: string, itemId: string) => {
    setPrelaunchPhases((phases) =>
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : phase
      )
    );
  };

  const toggleLaunchItem = (phaseId: string, itemId: string) => {
    setLaunchPhases((phases) =>
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : phase
      )
    );
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden shadow-2xl ">
            <div className="px-10 py-12 text-center">
              <h1 className="mb-3 text-4xl font-bold">
                🚀 Collybrix Website Launch Plan
              </h1>
              <p className="mb-4 text-xl opacity-90">
                Your Temporary Technical Co-Founders
              </p>
              <div className="inline-block rounded-full bg-background px-6 py-3 text-lg font-semibold backdrop-blur-sm">
                Launch Date: Monday, December 2, 2024
              </div>
            </div>

            <Tabs defaultValue="prelaunch" className="p-0">
              <div className="border-b">
                <TabsList className="mx-6 mt-6 w-auto bg-background">
                  <TabsTrigger
                    value="prelaunch"
                    className="flex-1 text-foreground bg-transparent border-none"
                  >
                    Pre-Launch Week
                  </TabsTrigger>
                  <TabsTrigger value="launch" className="flex-1">
                    Launch Day
                  </TabsTrigger>
                  <TabsTrigger value="campaign" className="flex-1">
                    Marketing Campaign
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="flex-1">
                    Metrics & Goals
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-10">
                {/* Pre-Launch Tab */}
                <TabsContent value="prelaunch" className="space-y-6">
                  <div className="rounded-lg border-l-4 border-yellow-500 bg-secondary/50 p-5">
                    <strong className="block text-primary">
                      ⏰ Critical Timeline
                    </strong>
                    <p className="text-muted-foreground">
                      You have 7 days until launch. Focus on high-impact
                      activities that drive immediate traction.
                    </p>
                  </div>

                  {prelaunchPhases.map((phase) => (
                    <div
                      key={phase.id}
                      className="rounded-xl border-l-4 border-primary bg-background p-6"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold">
                          📋 {phase.title}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="bg-background text-foreground"
                        >
                          {phase.timeline}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {phase.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              togglePrelaunchItem(phase.id, item.id)
                            }
                            className={cn(
                              "cursor-pointer rounded-lg border-2 border-transparent bg-background p-4 transition-all hover:translate-x-1 hover:border-primary text-foreground",
                              item.completed &&
                                "bg-primary/10 opacity-60 text-primary"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-primary transition-all",
                                  item.completed && "bg-primary/10"
                                )}
                              >
                                {item.completed && (
                                  <span className="text-sm font-bold text-primary">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <strong className="text-primary">
                                    {item.title}
                                  </strong>
                                  {item.priority && (
                                    <Badge
                                      variant={
                                        item.priority === "high"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className={cn(
                                        item.priority === "high" &&
                                          "bg-background text-primary",
                                        item.priority === "medium" &&
                                          "bg-background text-primary"
                                      )}
                                    >
                                      {item.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                                <p
                                  className="text-sm text-muted-foreground"
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="mt-8">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                        style={{ width: `${prelaunchProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-center font-semibold text-primary">
                      {prelaunchProgress}% Complete
                    </div>
                  </div>
                </TabsContent>

                {/* Launch Day Tab */}
                <TabsContent value="launch" className="space-y-6">
                  <div className="rounded-lg border-l-4 text-primary border-primary bg-background p-5">
                    <strong className="block">💡 Launch Day Success Tip</strong>
                    <p className="text-muted-foreground">
                      Launch day isn&apos;t just one day—it&apos;s a 3-day push.
                      Front-load your efforts Monday-Wednesday for maximum
                      impact.
                    </p>
                  </div>

                  {launchPhases.map((phase) => (
                    <div
                      key={phase.id}
                      className="rounded-xl border-l-4 border-primary bg-background p-6"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-primary">
                          🎉 {phase.title}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="bg-background text-primary"
                        >
                          {phase.timeline}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {phase.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleLaunchItem(phase.id, item.id)}
                            className={cn(
                              "cursor-pointer rounded-lg border-2 border-transparent bg-background p-4 transition-all hover:translate-x-1 hover:border-primary text-foreground",
                              item.completed &&
                                "bg-primary/10 opacity-60 text-primary"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-primary transition-all",
                                  item.completed && "bg-primary/10"
                                )}
                              >
                                {item.completed && (
                                  <span className="text-sm font-bold text-primary">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <strong className="text-primary">
                                    {item.title}
                                  </strong>
                                  {item.priority && (
                                    <Badge
                                      variant={
                                        item.priority === "high"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className={cn(
                                        item.priority === "high" &&
                                          "bg-background text-primary",
                                        item.priority === "medium" &&
                                          "bg-background text-primary"
                                      )}
                                    >
                                      {item.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                                <p
                                  className="text-sm text-muted-foreground"
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="mt-8">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                        style={{ width: `${launchProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-center font-semibold text-primary">
                      {launchProgress}% Complete
                    </div>
                  </div>
                </TabsContent>

                {/* Marketing Campaign Tab */}
                <TabsContent value="campaign" className="space-y-6">
                  <h2 className="mb-6 text-3xl font-semibold text-primary">
                    🎯 Ongoing Marketing Tactics (Week 2+)
                  </h2>

                  {tactics.map((tactic, index) => (
                    <div
                      key={index}
                      className="rounded-xl border-2 border-primary bg-background p-6 transition-all hover:border-primary hover:shadow-lg"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-2xl">
                          {tactic.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-primary">
                            {tactic.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-1 bg-background text-primary"
                          >
                            {tactic.metric}
                          </Badge>
                        </div>
                      </div>
                      <ul className="ml-5 space-y-2">
                        {tactic.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: item }}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="rounded-lg border-l-4 border-primary bg-background p-5">
                    <strong className="block text-primary">
                      🎯 Focus Areas for Months 1-3
                    </strong>
                    <p className="text-muted-foreground">
                      Don&apos;t spread too thin! Prioritize: (1) LinkedIn
                      content + engagement, (2) Partnership with 2-3
                      accelerators, (3) Weekly valuable content, (4) Direct
                      outreach to warm leads. Perfect these before scaling to
                      other channels.
                    </p>
                  </div>
                </TabsContent>

                {/* Metrics & Goals Tab */}
                <TabsContent value="metrics" className="space-y-6">
                  <h2 className="mb-6 text-3xl font-semibold text-primary">
                    📊 Success Metrics & Goals
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-primary">
                          Week 1 Goals (Launch Week)
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-primary">
                            Website Metrics
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              ✅ <strong>500-1,000 unique visitors</strong> in
                              first week
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>2-3 minute average session</strong>{" "}
                              duration
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>10-15 consultation requests</strong> or
                              contact form fills
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>2-5 qualified leads</strong> (startups
                              actively seeking help)
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-primary">
                            Social Engagement
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              ✅{" "}
                              <strong>50-100 LinkedIn post engagements</strong>{" "}
                              (likes, comments, shares)
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>200-500 profile views</strong> on
                              LinkedIn
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>10-20 meaningful conversations</strong>{" "}
                              with potential clients
                            </li>
                            <li className="text-muted-foreground">
                              ✅ <strong>20-30 new followers</strong> across
                              platforms
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-primary">
                          Month 1 Goals (December)
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-primary">
                            Lead Generation
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              🎯 <strong>50-100 total leads</strong> (email
                              signups, consultations, inquiries)
                            </li>
                            <li className="text-muted-foreground">
                              🎯{" "}
                              <strong>10-20 qualified discovery calls</strong>
                            </li>
                            <li className="text-muted-foreground">
                              🎯 <strong>3-5 proposals sent</strong> to
                              potential clients
                            </li>
                            <li className="text-muted-foreground">
                              🎯 <strong>1-2 new client contracts</strong>{" "}
                              signed
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-primary">
                            Content & Authority
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              🎯 <strong>12-15 LinkedIn posts</strong> published
                            </li>
                            <li className="text-muted-foreground">
                              🎯 <strong>2-3 blog articles</strong> on website
                            </li>
                            <li className="text-muted-foreground">
                              🎯 <strong>1-2 case studies</strong> documented
                            </li>
                            <li className="text-muted-foreground">
                              🎯 <strong>1 partnership</strong> established
                              (accelerator/coworking)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-primary">
                          Quarter 1 Goals (Dec-Feb)
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-gray-900">
                            Business Growth
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              🚀 <strong>5-8 active client projects</strong>
                            </li>
                            <li className="text-muted-foreground">
                              🚀 <strong>€30-50K revenue</strong> generated
                            </li>
                            <li className="text-muted-foreground">
                              🚀 <strong>3-5 strategic partnerships</strong>{" "}
                              (accelerators, communities)
                            </li>
                            <li className="text-muted-foreground">
                              🚀 <strong>300-500 email subscribers</strong>
                            </li>
                          </ul>
                        </div>

                        <div className="rounded-xl border-2 border-primary bg-background p-6">
                          <h3 className="mb-3 text-lg font-semibold text-gray-900">
                            Brand Presence
                          </h3>
                          <ul className="space-y-2">
                            <li className="text-muted-foreground">
                              🚀 <strong>1,000+ LinkedIn followers</strong>
                            </li>
                            <li className="text-muted-foreground">
                              🚀 <strong>2-3 speaking engagements</strong> or
                              podcast appearances
                            </li>
                            <li className="text-muted-foreground">
                              🚀 <strong>5+ client testimonials</strong> and
                              case studies
                            </li>
                            <li className="text-muted-foreground">
                              🚀 Known as &quot;go-to technical partner&quot; in
                              2-3 accelerators
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border-l-4 border-primary bg-background p-5">
                    <strong className="block text-primary">
                      📈 Track Weekly
                    </strong>
                    <p className="text-muted-foreground">
                      Every Monday, review: website traffic, new leads,
                      conversion rate, social engagement, content performance.
                      Adjust tactics based on what&apos;s working. Use Google
                      Analytics + a simple spreadsheet to stay organized.
                    </p>
                  </div>

                  <div className="rounded-lg border-l-4 border-primary bg-background p-5">
                    <strong className="block text-primary">
                      💡 What &quot;Good&quot; Looks Like
                    </strong>
                    <p className="text-muted-foreground">
                      For a B2B service business like Collybrix, expect 2-5%
                      website-to-lead conversion, 20-30% lead-to-discovery call
                      conversion, 20-40% proposal-to-client conversion. Focus on
                      quality over quantity—10 perfect-fit leads beat 100
                      tire-kickers.
                    </p>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}
