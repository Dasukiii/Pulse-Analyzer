// Survey Data
export const mockSurveys = [
    {
        id: 1,
        name: "Q4 2025 Employee Engagement Survey",
        date: "2025-12-15",
        department: "All Departments",
        type: "Engagement",
        status: "completed",
        responseCount: 487,
        totalEmployees: 520,
        responseRate: 93.7,
        engagementScore: 78,
        enps: 42
    },
    {
        id: 2,
        name: "Q3 2025 Pulse Check",
        date: "2025-09-20",
        department: "All Departments",
        type: "Pulse",
        status: "completed",
        responseCount: 445,
        totalEmployees: 512,
        responseRate: 86.9,
        engagementScore: 74,
        enps: 38
    },
    {
        id: 3,
        name: "Engineering Team Satisfaction",
        date: "2025-11-01",
        department: "Engineering",
        type: "Satisfaction",
        status: "completed",
        responseCount: 89,
        totalEmployees: 95,
        responseRate: 93.7,
        engagementScore: 82,
        enps: 55
    },
    {
        id: 4,
        name: "Q4 2025 Onboarding Feedback",
        date: "2025-12-01",
        department: "HR",
        type: "Onboarding",
        status: "active",
        responseCount: 23,
        totalEmployees: 45,
        responseRate: 51.1,
        engagementScore: null,
        enps: null
    },
    {
        id: 5,
        name: "Remote Work Experience",
        date: "2025-10-15",
        department: "All Departments",
        type: "Special",
        status: "completed",
        responseCount: 398,
        totalEmployees: 520,
        responseRate: 76.5,
        engagementScore: 71,
        enps: 35
    }
];

// Heatmap Data
export const mockHeatmapData = {
    departments: ["Engineering", "Product", "Design", "Marketing", "Sales", "Customer Success"],
    questions: ["Satisfaction", "Work-Life", "Growth", "Manager", "Team", "Direction", "Comp", "Recognition"],
    values: [
        [85, 78, 72, 88, 82, 79, 68, 75],
        [82, 80, 75, 85, 88, 81, 70, 78],
        [88, 85, 78, 90, 92, 84, 65, 82],
        [75, 72, 68, 78, 76, 73, 62, 70],
        [70, 65, 60, 72, 68, 70, 55, 65],
        [78, 75, 70, 80, 82, 76, 60, 72]
    ]
};

// Theme Analysis Data
export const mockThemes = [
    {
        id: 1,
        name: "Work-Life Balance Concerns",
        frequency: 87,
        sentiment: "negative",
        sentimentScore: 32,
        sampleQuotes: [
            "The workload has been overwhelming lately, hard to disconnect after hours.",
            "Need more flexibility in work schedules.",
            "Feels like we're always in crunch mode."
        ]
    },
    {
        id: 2,
        name: "Leadership Appreciation",
        frequency: 64,
        sentiment: "positive",
        sentimentScore: 85,
        sampleQuotes: [
            "My manager is very supportive and always available.",
            "Leadership is transparent about company goals.",
            "Great mentorship opportunities."
        ]
    },
    {
        id: 3,
        name: "Career Growth Opportunities",
        frequency: 52,
        sentiment: "neutral",
        sentimentScore: 55,
        sampleQuotes: [
            "Would love more clarity on promotion criteria.",
            "Training programs are helpful but could be expanded.",
            "L&D budget is appreciated."
        ]
    },
    {
        id: 4,
        name: "Team Collaboration",
        frequency: 45,
        sentiment: "positive",
        sentimentScore: 78,
        sampleQuotes: [
            "Cross-functional collaboration has improved significantly.",
            "Love the teamwork culture here.",
            "Great colleagues to work with."
        ]
    },
    {
        id: 5,
        name: "Compensation & Benefits",
        frequency: 38,
        sentiment: "negative",
        sentimentScore: 40,
        sampleQuotes: [
            "Salaries feel below market rate.",
            "Benefits package could be more competitive.",
            "Would appreciate more equity options."
        ]
    }
];

// Indicator Tracking Data
export const mockIndicators = [
    {
        id: 1,
        name: "Engagement Score",
        current: 78,
        previous: 74,
        target: 80,
        baseline: 70,
        trend: "up",
        history: [
            { period: "Q1 2025", value: 70 },
            { period: "Q2 2025", value: 72 },
            { period: "Q3 2025", value: 74 },
            { period: "Q4 2025", value: 78 }
        ]
    },
    {
        id: 2,
        name: "eNPS",
        current: 42,
        previous: 38,
        target: 50,
        baseline: 25,
        trend: "up",
        history: [
            { period: "Q1 2025", value: 25 },
            { period: "Q2 2025", value: 32 },
            { period: "Q3 2025", value: 38 },
            { period: "Q4 2025", value: 42 }
        ]
    },
    {
        id: 3,
        name: "Response Rate",
        current: 93.7,
        previous: 86.9,
        target: 90,
        baseline: 75,
        trend: "up",
        history: [
            { period: "Q1 2025", value: 75 },
            { period: "Q2 2025", value: 82 },
            { period: "Q3 2025", value: 86.9 },
            { period: "Q4 2025", value: 93.7 }
        ]
    },
    {
        id: 4,
        name: "Work-Life Balance",
        current: 65,
        previous: 68,
        target: 75,
        baseline: 70,
        trend: "down",
        history: [
            { period: "Q1 2025", value: 70 },
            { period: "Q2 2025", value: 72 },
            { period: "Q3 2025", value: 68 },
            { period: "Q4 2025", value: 65 }
        ]
    }
];

// Narrative Highlights
export const mockNarratives = [
    {
        id: 1,
        type: "summary",
        title: "Q4 2025 Survey Executive Summary",
        priority: "high",
        content: "Overall engagement has improved by 4 points from Q3. Strong sentiment in leadership trust and team collaboration. Key areas requiring attention include work-life balance (down 3 points) and compensation satisfaction.",
        createdAt: "2025-12-16"
    },
    {
        id: 2,
        type: "positive",
        title: "Leadership & Management Strength",
        priority: "medium",
        content: "Manager effectiveness scores have reached an all-time high of 82%. Employees specifically appreciate transparent communication and mentorship opportunities.",
        createdAt: "2025-12-16"
    },
    {
        id: 3,
        type: "concern",
        title: "Work-Life Balance Decline",
        priority: "high",
        content: "Work-life balance scores have declined for the second consecutive quarter, now at 65% (down from 72% in Q2). Open-ended responses cite increased workload and meeting overload.",
        createdAt: "2025-12-16"
    },
    {
        id: 4,
        type: "action",
        title: "Recommended: Meeting-Free Afternoons",
        priority: "high",
        content: "Based on feedback analysis, we recommend implementing designated meeting-free afternoon blocks twice per week to address focus time concerns.",
        createdAt: "2025-12-16"
    }
];
