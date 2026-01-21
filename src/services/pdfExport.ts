import jsPDF from 'jspdf'

const COLORS = {
    primary: [59, 130, 246] as [number, number, number],
    slate900: [30, 41, 59] as [number, number, number],
    slate600: [71, 85, 105] as [number, number, number],
    slate500: [100, 116, 139] as [number, number, number],
    slate400: [148, 163, 184] as [number, number, number],
    slate100: [241, 245, 249] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
    orange: [249, 115, 22] as [number, number, number],
    yellow: [234, 179, 8] as [number, number, number],
    blue: [59, 130, 246] as [number, number, number],
}

interface PDFContext {
    pdf: jsPDF
    pageWidth: number
    pageHeight: number
    margin: number
    yPos: number
    contentWidth: number
}

function createPDF(): PDFContext {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    return {
        pdf,
        pageWidth,
        pageHeight,
        margin,
        yPos: 20,
        contentWidth: pageWidth - margin * 2
    }
}

function addHeader(ctx: PDFContext, title: string, subtitle?: string): void {
    ctx.pdf.setFontSize(20)
    ctx.pdf.setFont('helvetica', 'bold')
    ctx.pdf.setTextColor(...COLORS.slate900)
    ctx.pdf.text(title, ctx.margin, ctx.yPos)
    ctx.yPos += 7

    if (subtitle) {
        ctx.pdf.setFontSize(10)
        ctx.pdf.setFont('helvetica', 'normal')
        ctx.pdf.setTextColor(...COLORS.slate500)
        ctx.pdf.text(subtitle, ctx.margin, ctx.yPos)
        ctx.yPos += 5
    }

    ctx.pdf.setFontSize(9)
    ctx.pdf.setFont('helvetica', 'normal')
    ctx.pdf.setTextColor(...COLORS.slate400)
    ctx.pdf.text(`Generated: ${new Date().toLocaleString()}`, ctx.margin, ctx.yPos)
    ctx.yPos += 10

    ctx.pdf.setDrawColor(...COLORS.slate100)
    ctx.pdf.setLineWidth(0.5)
    ctx.pdf.line(ctx.margin, ctx.yPos, ctx.pageWidth - ctx.margin, ctx.yPos)
    ctx.yPos += 8
}

function addFooter(ctx: PDFContext, pageNum: number, totalPages: number): void {
    ctx.pdf.setFontSize(8)
    ctx.pdf.setTextColor(...COLORS.slate400)
    ctx.pdf.text('Pulse Analyzer', ctx.margin, ctx.pageHeight - 10)
    ctx.pdf.text(`Page ${pageNum} of ${totalPages}`, ctx.pageWidth - ctx.margin - 20, ctx.pageHeight - 10)
}

function addSectionTitle(ctx: PDFContext, title: string): void {
    checkPageBreak(ctx, 15)
    ctx.pdf.setFontSize(14)
    ctx.pdf.setFont('helvetica', 'bold')
    ctx.pdf.setTextColor(...COLORS.slate900)
    ctx.pdf.text(title, ctx.margin, ctx.yPos)
    ctx.yPos += 8
}

function checkPageBreak(ctx: PDFContext, requiredSpace: number): boolean {
    if (ctx.yPos + requiredSpace > ctx.pageHeight - 20) {
        ctx.pdf.addPage()
        ctx.yPos = 20
        return true
    }
    return false
}

function drawMetricCard(
    ctx: PDFContext,
    x: number,
    y: number,
    width: number,
    label: string,
    value: string,
    color?: [number, number, number]
): void {
    ctx.pdf.setFillColor(...COLORS.slate100)
    ctx.pdf.roundedRect(x, y, width, 28, 3, 3, 'F')

    if (color) {
        ctx.pdf.setFillColor(...color)
        ctx.pdf.roundedRect(x, y, 3, 28, 1, 1, 'F')
    }

    ctx.pdf.setFontSize(9)
    ctx.pdf.setFont('helvetica', 'normal')
    ctx.pdf.setTextColor(...COLORS.slate500)
    ctx.pdf.text(label, x + (color ? 8 : 5), y + 10)

    ctx.pdf.setFontSize(16)
    ctx.pdf.setFont('helvetica', 'bold')
    ctx.pdf.setTextColor(...COLORS.slate900)
    ctx.pdf.text(value, x + (color ? 8 : 5), y + 22)
}

export interface ThemeData {
    name: string
    frequency: number
    sentiment: string
    sentimentScore: number
    keywords?: string[]
    sampleQuotes?: string[]
}

export interface NarrativeData {
    type: string
    title: string
    content: string
    priority?: string
}

export interface IndicatorData {
    name: string
    currentValue: number
    previousValue: number
    targetValue: number
    trend: string
}

export interface HeatmapData {
    departments: string[]
    questions: string[]
    values: number[][]
}

export interface SurveyStats {
    engagementScore: number
    eNPS: number
    responseRate: number
    totalResponses: number
    totalEmployees: number
}

export async function exportThemeAnalysisPDF(
    surveyName: string,
    themes: ThemeData[]
): Promise<void> {
    const ctx = createPDF()

    addHeader(ctx, 'Theme Analysis Report', surveyName)

    addSectionTitle(ctx, 'Overview')
    const totalMentions = themes.reduce((sum, t) => sum + t.frequency, 0)
    const positiveCount = themes.filter(t => t.sentiment === 'positive').length
    const negativeCount = themes.filter(t => t.sentiment === 'negative').length

    const cardWidth = (ctx.contentWidth - 10) / 3
    drawMetricCard(ctx, ctx.margin, ctx.yPos, cardWidth, 'Themes Detected', `${themes.length}`)
    drawMetricCard(ctx, ctx.margin + cardWidth + 5, ctx.yPos, cardWidth, 'Total Mentions', `${totalMentions}`)
    drawMetricCard(ctx, ctx.margin + (cardWidth + 5) * 2, ctx.yPos, cardWidth, 'Sentiment Split', `${positiveCount}+ / ${negativeCount}-`)
    ctx.yPos += 38

    addSectionTitle(ctx, 'Detected Themes')

    themes.forEach((theme, index) => {
        checkPageBreak(ctx, 45)

        const sentimentColor = theme.sentiment === 'positive' ? COLORS.green :
            theme.sentiment === 'negative' ? COLORS.red : COLORS.blue

        ctx.pdf.setFillColor(248, 250, 252)
        ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, 40, 3, 3, 'F')

        ctx.pdf.setFillColor(...sentimentColor)
        ctx.pdf.roundedRect(ctx.margin, ctx.yPos, 4, 40, 2, 2, 'F')

        ctx.pdf.setFontSize(12)
        ctx.pdf.setFont('helvetica', 'bold')
        ctx.pdf.setTextColor(...COLORS.slate900)
        ctx.pdf.text(`${index + 1}. ${theme.name}`, ctx.margin + 10, ctx.yPos + 10)

        ctx.pdf.setFontSize(9)
        ctx.pdf.setFont('helvetica', 'normal')
        ctx.pdf.setTextColor(...COLORS.slate600)
        ctx.pdf.text(`${theme.frequency} mentions`, ctx.margin + 10, ctx.yPos + 18)

        ctx.pdf.setFillColor(...sentimentColor)
        ctx.pdf.roundedRect(ctx.margin + 50, ctx.yPos + 13, 30, 7, 2, 2, 'F')
        ctx.pdf.setFontSize(7)
        ctx.pdf.setTextColor(255, 255, 255)
        ctx.pdf.text(`${theme.sentimentScore}% ${theme.sentiment}`, ctx.margin + 53, ctx.yPos + 18)

        if (theme.keywords && theme.keywords.length > 0) {
            ctx.pdf.setFontSize(8)
            ctx.pdf.setTextColor(...COLORS.slate500)
            const keywordsText = `Keywords: ${theme.keywords.slice(0, 5).join(', ')}`
            ctx.pdf.text(keywordsText, ctx.margin + 10, ctx.yPos + 28)
        }

        if (theme.sampleQuotes && theme.sampleQuotes[0]) {
            ctx.pdf.setFontSize(8)
            ctx.pdf.setFont('helvetica', 'italic')
            ctx.pdf.setTextColor(...COLORS.slate600)
            const quote = `"${theme.sampleQuotes[0].slice(0, 80)}${theme.sampleQuotes[0].length > 80 ? '...' : ''}"`
            ctx.pdf.text(quote, ctx.margin + 10, ctx.yPos + 36)
        }

        ctx.yPos += 45
    })

    const pageCount = ctx.pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
        ctx.pdf.setPage(i)
        addFooter(ctx, i, pageCount)
    }

    ctx.pdf.save(`theme_analysis_${surveyName.replace(/\s+/g, '_')}.pdf`)
}

export async function exportIndicatorsPDF(
    surveyName: string,
    indicators: IndicatorData[],
    trendData: Array<{ period: string; value: number }>
): Promise<void> {
    const ctx = createPDF()

    addHeader(ctx, 'Indicator Tracking Report', surveyName)

    if (indicators.length > 0) {
        addSectionTitle(ctx, 'Key Performance Indicators')

        const cardWidth = (ctx.contentWidth - 15) / 4
        indicators.slice(0, 4).forEach((indicator, i) => {
            const x = ctx.margin + i * (cardWidth + 5)
            const change = indicator.currentValue - indicator.previousValue
            const isPositive = change >= 0
            const color = indicator.currentValue >= indicator.targetValue ? COLORS.green :
                indicator.trend === 'down' ? COLORS.red : COLORS.blue

            ctx.pdf.setFillColor(...COLORS.slate100)
            ctx.pdf.roundedRect(x, ctx.yPos, cardWidth, 45, 3, 3, 'F')

            ctx.pdf.setFillColor(...color)
            ctx.pdf.roundedRect(x, ctx.yPos, cardWidth, 4, 2, 2, 'F')

            ctx.pdf.setFontSize(8)
            ctx.pdf.setFont('helvetica', 'normal')
            ctx.pdf.setTextColor(...COLORS.slate500)
            ctx.pdf.text(indicator.name, x + 5, ctx.yPos + 14)

            ctx.pdf.setFontSize(18)
            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.slate900)
            const valueStr = indicator.name.includes('Rate') ? `${indicator.currentValue}%` : `${indicator.currentValue}`
            ctx.pdf.text(valueStr, x + 5, ctx.yPos + 28)

            ctx.pdf.setFontSize(8)
            ctx.pdf.setTextColor(...(isPositive ? COLORS.green : COLORS.red))
            ctx.pdf.text(`${isPositive ? '+' : ''}${change.toFixed(1)}`, x + 5, ctx.yPos + 36)

            ctx.pdf.setTextColor(...COLORS.slate400)
            ctx.pdf.text(`Target: ${indicator.targetValue}`, x + 5, ctx.yPos + 42)
        })

        ctx.yPos += 55
    }

    if (trendData.length > 0) {
        addSectionTitle(ctx, 'Engagement Trend')

        ctx.pdf.setFillColor(...COLORS.slate100)
        ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, 60, 3, 3, 'F')

        const chartX = ctx.margin + 10
        const chartY = ctx.yPos + 10
        const chartWidth = ctx.contentWidth - 20
        const chartHeight = 40

        ctx.pdf.setDrawColor(...COLORS.slate400)
        ctx.pdf.setLineWidth(0.2)
        for (let i = 0; i <= 4; i++) {
            const y = chartY + (chartHeight / 4) * i
            ctx.pdf.line(chartX, y, chartX + chartWidth, y)
        }

        if (trendData.length > 1) {
            const maxValue = Math.max(...trendData.map(d => d.value), 100)
            const minValue = Math.min(...trendData.map(d => d.value), 0)
            const range = maxValue - minValue || 1

            ctx.pdf.setDrawColor(...COLORS.blue)
            ctx.pdf.setLineWidth(1)

            for (let i = 0; i < trendData.length - 1; i++) {
                const x1 = chartX + (chartWidth / (trendData.length - 1)) * i
                const x2 = chartX + (chartWidth / (trendData.length - 1)) * (i + 1)
                const y1 = chartY + chartHeight - ((trendData[i].value - minValue) / range) * chartHeight
                const y2 = chartY + chartHeight - ((trendData[i + 1].value - minValue) / range) * chartHeight
                ctx.pdf.line(x1, y1, x2, y2)
            }

            ctx.pdf.setFillColor(...COLORS.blue)
            trendData.forEach((point, i) => {
                const x = chartX + (chartWidth / (trendData.length - 1)) * i
                const y = chartY + chartHeight - ((point.value - minValue) / range) * chartHeight
                ctx.pdf.circle(x, y, 1.5, 'F')
            })
        }

        ctx.pdf.setFontSize(7)
        ctx.pdf.setTextColor(...COLORS.slate500)
        trendData.forEach((point, i) => {
            const x = chartX + (chartWidth / Math.max(trendData.length - 1, 1)) * i
            ctx.pdf.text(point.period, x - 5, ctx.yPos + 55)
        })

        ctx.yPos += 70
    }

    addSectionTitle(ctx, 'Performance Summary')
    ctx.pdf.setFontSize(10)
    ctx.pdf.setFont('helvetica', 'normal')
    ctx.pdf.setTextColor(...COLORS.slate600)

    const metricsOnTarget = indicators.filter(i => i.currentValue >= i.targetValue).length
    const summaryText = `${metricsOnTarget} of ${indicators.length} indicators are meeting their targets.`
    ctx.pdf.text(summaryText, ctx.margin, ctx.yPos)
    ctx.yPos += 10

    const pageCount = ctx.pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
        ctx.pdf.setPage(i)
        addFooter(ctx, i, pageCount)
    }

    ctx.pdf.save(`indicator_report_${surveyName.replace(/\s+/g, '_')}.pdf`)
}

export async function exportNarrativesPDF(
    surveyName: string,
    narratives: NarrativeData[],
    stats?: SurveyStats
): Promise<void> {
    const ctx = createPDF()

    addHeader(ctx, 'Narrative Highlights Report', surveyName)

    if (stats) {
        addSectionTitle(ctx, 'Survey Metrics')
        const cardWidth = (ctx.contentWidth - 15) / 4
        drawMetricCard(ctx, ctx.margin, ctx.yPos, cardWidth, 'Engagement', `${stats.engagementScore}%`)
        drawMetricCard(ctx, ctx.margin + cardWidth + 5, ctx.yPos, cardWidth, 'eNPS', stats.eNPS >= 0 ? `+${stats.eNPS}` : `${stats.eNPS}`)
        drawMetricCard(ctx, ctx.margin + (cardWidth + 5) * 2, ctx.yPos, cardWidth, 'Response Rate', `${stats.responseRate}%`)
        drawMetricCard(ctx, ctx.margin + (cardWidth + 5) * 3, ctx.yPos, cardWidth, 'Responses', `${stats.totalResponses}`)
        ctx.yPos += 38
    }

    const groupedNarratives = {
        summary: narratives.filter(n => n.type === 'summary'),
        positive: narratives.filter(n => n.type === 'positive'),
        concern: narratives.filter(n => n.type === 'concern'),
        action: narratives.filter(n => n.type === 'action')
    }

    const sections = [
        { key: 'summary', title: 'Executive Summary', color: COLORS.blue },
        { key: 'positive', title: 'Positive Highlights', color: COLORS.green },
        { key: 'concern', title: 'Areas of Concern', color: COLORS.red },
        { key: 'action', title: 'Recommended Actions', color: COLORS.orange }
    ] as const

    sections.forEach(section => {
        const items = groupedNarratives[section.key]
        if (items.length === 0) return

        checkPageBreak(ctx, 30)
        addSectionTitle(ctx, section.title)

        items.forEach(narrative => {
            checkPageBreak(ctx, 35)

            const lines = ctx.pdf.splitTextToSize(narrative.content, ctx.contentWidth - 20)
            const boxHeight = 18 + lines.length * 4

            ctx.pdf.setFillColor(248, 250, 252)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, boxHeight, 3, 3, 'F')

            ctx.pdf.setFillColor(...section.color)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, 4, boxHeight, 2, 2, 'F')

            ctx.pdf.setFontSize(11)
            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.slate900)
            ctx.pdf.text(narrative.title, ctx.margin + 10, ctx.yPos + 10)

            if (narrative.priority === 'high') {
                ctx.pdf.setFillColor(...COLORS.red)
                ctx.pdf.roundedRect(ctx.pageWidth - ctx.margin - 30, ctx.yPos + 5, 25, 6, 2, 2, 'F')
                ctx.pdf.setFontSize(6)
                ctx.pdf.setTextColor(255, 255, 255)
                ctx.pdf.text('HIGH PRIORITY', ctx.pageWidth - ctx.margin - 28, ctx.yPos + 9)
            }

            ctx.pdf.setFontSize(9)
            ctx.pdf.setFont('helvetica', 'normal')
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(lines, ctx.margin + 10, ctx.yPos + 18)

            ctx.yPos += boxHeight + 5
        })
    })

    const pageCount = ctx.pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
        ctx.pdf.setPage(i)
        addFooter(ctx, i, pageCount)
    }

    ctx.pdf.save(`narrative_highlights_${surveyName.replace(/\s+/g, '_')}.pdf`)
}

export async function exportHeatmapPDF(
    surveyName: string,
    heatmapData: HeatmapData,
    insights: { hotspots: Array<{ dept: string; question: string; score: number }>; strengths: Array<{ dept: string; question: string; score: number }> }
): Promise<void> {
    const ctx = createPDF()

    addHeader(ctx, 'Heatmap Report', surveyName)

    addSectionTitle(ctx, 'Organization Heatmap')

    if (heatmapData.departments.length > 0 && heatmapData.questions.length > 0) {
        const colCount = heatmapData.questions.length
        const rowCount = heatmapData.departments.length
        const labelWidth = 35
        const cellWidth = Math.min(15, (ctx.contentWidth - labelWidth) / colCount)
        const cellHeight = 8
        const headerHeight = 25

        ctx.pdf.setFontSize(6)
        ctx.pdf.setFont('helvetica', 'normal')
        ctx.pdf.setTextColor(...COLORS.slate500)

        heatmapData.questions.forEach((q, i) => {
            const x = ctx.margin + labelWidth + i * cellWidth + cellWidth / 2
            ctx.pdf.text(q.slice(0, 12), x, ctx.yPos, { angle: 45, align: 'left' })
        })

        ctx.yPos += headerHeight

        heatmapData.departments.forEach((dept, rowIndex) => {
            checkPageBreak(ctx, cellHeight + 5)

            ctx.pdf.setFontSize(8)
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(dept.slice(0, 15), ctx.margin, ctx.yPos + cellHeight / 2 + 2)

            heatmapData.values[rowIndex]?.forEach((value, colIndex) => {
                const x = ctx.margin + labelWidth + colIndex * cellWidth
                const color = getHeatmapColorRGB(value)

                ctx.pdf.setFillColor(...color)
                ctx.pdf.rect(x, ctx.yPos, cellWidth - 1, cellHeight - 1, 'F')

                ctx.pdf.setFontSize(6)
                ctx.pdf.setTextColor(value >= 70 ? 255 : 30, value >= 70 ? 255 : 41, value >= 70 ? 255 : 59)
                ctx.pdf.text(`${value}`, x + cellWidth / 2 - 3, ctx.yPos + cellHeight / 2 + 1)
            })

            ctx.yPos += cellHeight
        })

        ctx.yPos += 10

        ctx.pdf.setFontSize(7)
        ctx.pdf.setTextColor(...COLORS.slate500)
        ctx.pdf.text('Legend:', ctx.margin, ctx.yPos)

        const legendColors = [
            { label: '<60', color: [239, 68, 68] as [number, number, number] },
            { label: '60-69', color: [249, 115, 22] as [number, number, number] },
            { label: '70-79', color: [52, 211, 153] as [number, number, number] },
            { label: '80+', color: [59, 130, 246] as [number, number, number] }
        ]

        legendColors.forEach((item, i) => {
            const x = ctx.margin + 25 + i * 25
            ctx.pdf.setFillColor(...item.color)
            ctx.pdf.rect(x, ctx.yPos - 3, 8, 5, 'F')
            ctx.pdf.setTextColor(...COLORS.slate500)
            ctx.pdf.text(item.label, x + 10, ctx.yPos)
        })

        ctx.yPos += 15
    }

    if (insights.hotspots.length > 0) {
        addSectionTitle(ctx, 'Areas of Concern')
        insights.hotspots.forEach(item => {
            checkPageBreak(ctx, 12)
            ctx.pdf.setFillColor(254, 242, 242)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, 10, 2, 2, 'F')

            ctx.pdf.setFontSize(9)
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(`${item.dept} - ${item.question}`, ctx.margin + 5, ctx.yPos + 6)

            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.red)
            ctx.pdf.text(`${item.score}%`, ctx.pageWidth - ctx.margin - 15, ctx.yPos + 6)

            ctx.yPos += 12
        })
        ctx.yPos += 5
    }

    if (insights.strengths.length > 0) {
        addSectionTitle(ctx, 'Top Strengths')
        insights.strengths.forEach(item => {
            checkPageBreak(ctx, 12)
            ctx.pdf.setFillColor(240, 253, 244)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, 10, 2, 2, 'F')

            ctx.pdf.setFontSize(9)
            ctx.pdf.setFont('helvetica', 'normal')
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(`${item.dept} - ${item.question}`, ctx.margin + 5, ctx.yPos + 6)

            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.green)
            ctx.pdf.text(`${item.score}%`, ctx.pageWidth - ctx.margin - 15, ctx.yPos + 6)

            ctx.yPos += 12
        })
    }

    const pageCount = ctx.pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
        ctx.pdf.setPage(i)
        addFooter(ctx, i, pageCount)
    }

    ctx.pdf.save(`heatmap_report_${surveyName.replace(/\s+/g, '_')}.pdf`)
}

export async function exportSurveyDetailPDF(
    surveyName: string,
    stats: SurveyStats,
    questionData: Array<{ question: string; score: number }>,
    themes: ThemeData[],
    sentimentData: Array<{ name: string; value: number }>
): Promise<void> {
    const ctx = createPDF()

    addHeader(ctx, 'Survey Report', surveyName)

    addSectionTitle(ctx, 'Key Metrics')
    const cardWidth = (ctx.contentWidth - 15) / 4
    drawMetricCard(ctx, ctx.margin, ctx.yPos, cardWidth, 'Response Rate', `${stats.responseRate}%`, COLORS.blue)
    drawMetricCard(ctx, ctx.margin + cardWidth + 5, ctx.yPos, cardWidth, 'Engagement', `${stats.engagementScore}%`, COLORS.green)
    drawMetricCard(ctx, ctx.margin + (cardWidth + 5) * 2, ctx.yPos, cardWidth, 'eNPS', stats.eNPS >= 0 ? `+${stats.eNPS}` : `${stats.eNPS}`, stats.eNPS >= 0 ? COLORS.green : COLORS.red)
    drawMetricCard(ctx, ctx.margin + (cardWidth + 5) * 3, ctx.yPos, cardWidth, 'Themes', `${themes.length}`, COLORS.orange)
    ctx.yPos += 40

    if (questionData.length > 0) {
        addSectionTitle(ctx, 'Question Breakdown')

        questionData.forEach(item => {
            checkPageBreak(ctx, 12)

            ctx.pdf.setFontSize(9)
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(item.question.slice(0, 25), ctx.margin, ctx.yPos + 5)

            const barX = ctx.margin + 55
            const barWidth = ctx.contentWidth - 75
            const filledWidth = (item.score / 100) * barWidth

            ctx.pdf.setFillColor(...COLORS.slate100)
            ctx.pdf.roundedRect(barX, ctx.yPos, barWidth, 8, 2, 2, 'F')

            const barColor = item.score >= 80 ? COLORS.green : item.score >= 60 ? COLORS.blue : COLORS.red
            ctx.pdf.setFillColor(...barColor)
            ctx.pdf.roundedRect(barX, ctx.yPos, filledWidth, 8, 2, 2, 'F')

            ctx.pdf.setFontSize(9)
            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.slate900)
            ctx.pdf.text(`${item.score}%`, ctx.pageWidth - ctx.margin - 10, ctx.yPos + 6)

            ctx.yPos += 12
        })

        ctx.yPos += 10
    }

    if (sentimentData.length > 0) {
        addSectionTitle(ctx, 'Theme Sentiment Distribution')

        sentimentData.forEach((item, i) => {
            const color = item.name === 'Positive' ? COLORS.green :
                item.name === 'Negative' ? COLORS.red : COLORS.yellow

            ctx.pdf.setFillColor(...color)
            ctx.pdf.circle(ctx.margin + 5, ctx.yPos + 2, 3, 'F')

            ctx.pdf.setFontSize(10)
            ctx.pdf.setFont('helvetica', 'normal')
            ctx.pdf.setTextColor(...COLORS.slate600)
            ctx.pdf.text(`${item.name}: ${item.value}%`, ctx.margin + 12, ctx.yPos + 4)

            ctx.yPos += 10
        })

        ctx.yPos += 10
    }

    if (themes.length > 0) {
        addSectionTitle(ctx, 'Detected Themes')

        themes.slice(0, 6).forEach(theme => {
            checkPageBreak(ctx, 20)

            const sentimentColor = theme.sentiment === 'positive' ? COLORS.green :
                theme.sentiment === 'negative' ? COLORS.red : COLORS.blue

            ctx.pdf.setFillColor(248, 250, 252)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, ctx.contentWidth, 18, 2, 2, 'F')

            ctx.pdf.setFillColor(...sentimentColor)
            ctx.pdf.roundedRect(ctx.margin, ctx.yPos, 3, 18, 1, 1, 'F')

            ctx.pdf.setFontSize(10)
            ctx.pdf.setFont('helvetica', 'bold')
            ctx.pdf.setTextColor(...COLORS.slate900)
            ctx.pdf.text(theme.name, ctx.margin + 8, ctx.yPos + 8)

            ctx.pdf.setFontSize(8)
            ctx.pdf.setFont('helvetica', 'normal')
            ctx.pdf.setTextColor(...COLORS.slate500)
            ctx.pdf.text(`${theme.frequency} mentions`, ctx.margin + 8, ctx.yPos + 14)

            ctx.pdf.setFillColor(...sentimentColor)
            ctx.pdf.roundedRect(ctx.pageWidth - ctx.margin - 25, ctx.yPos + 5, 20, 8, 2, 2, 'F')
            ctx.pdf.setFontSize(7)
            ctx.pdf.setTextColor(255, 255, 255)
            ctx.pdf.text(theme.sentiment, ctx.pageWidth - ctx.margin - 22, ctx.yPos + 10)

            ctx.yPos += 22
        })
    }

    const pageCount = ctx.pdf.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
        ctx.pdf.setPage(i)
        addFooter(ctx, i, pageCount)
    }

    ctx.pdf.save(`survey_report_${surveyName.replace(/\s+/g, '_')}.pdf`)
}

function getHeatmapColorRGB(value: number): [number, number, number] {
    if (value >= 85) return [59, 130, 246]
    if (value >= 80) return [96, 165, 250]
    if (value >= 75) return [52, 211, 153]
    if (value >= 70) return [110, 231, 183]
    if (value >= 65) return [250, 204, 21]
    if (value >= 60) return [251, 146, 60]
    return [239, 68, 68]
}
