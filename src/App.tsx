import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Dashboard from './pages/Dashboard'
import SurveyLibrary from './pages/SurveyLibrary'
import SurveyUpload from './pages/SurveyUpload'
import SurveyDetail from './pages/SurveyDetail'
import HeatmapView from './pages/HeatmapView'
import ThemeAnalysis from './pages/ThemeAnalysis'
import IndicatorTracking from './pages/IndicatorTracking'
import NarrativeHighlights from './pages/NarrativeHighlights'
import NotFound from './pages/NotFound'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route element={
                <ProtectedRoute>
                    <AppLayout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/surveys" element={<SurveyLibrary />} />
                <Route path="/upload" element={<SurveyUpload />} />
                <Route path="/survey/:id" element={<SurveyDetail />} />
                <Route path="/heatmap" element={<HeatmapView />} />
                <Route path="/themes" element={<ThemeAnalysis />} />
                <Route path="/indicators" element={<IndicatorTracking />} />
                <Route path="/narratives" element={<NarrativeHighlights />} />
            </Route>
            {/* 404 Catch-all route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App
