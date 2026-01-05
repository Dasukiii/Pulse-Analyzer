import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, Check, AlertCircle, X } from 'lucide-react'
import { hasApiKey, setApiKey } from '../services/openai'

interface ApiKeySettingsProps {
    isOpen: boolean
    onClose: () => void
}

export default function ApiKeySettings({ isOpen, onClose }: ApiKeySettingsProps) {
    const [apiKey, setApiKeyValue] = useState('')
    const [showKey, setShowKey] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isConfigured, setIsConfigured] = useState(false)

    useEffect(() => {
        setIsConfigured(hasApiKey())
    }, [isOpen])

    const handleSave = () => {
        if (apiKey.trim()) {
            setApiKey(apiKey.trim())
            setSaved(true)
            setIsConfigured(true)
            setTimeout(() => {
                setSaved(false)
                onClose()
            }, 1500)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Key className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">API Configuration</h2>
                            <p className="text-sm text-slate-500">Configure your OpenAI API key</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {isConfigured && !apiKey && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-green-800">API Key Configured</p>
                            <p className="text-sm text-green-600">Your OpenAI API key is set and ready to use.</p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">OpenAI API Key</label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            placeholder={isConfigured ? '••••••••••••••••' : 'sk-...'}
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100"
                        >
                            {showKey ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenAI Dashboard</a>
                    </p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800">
                            Your API key is stored locally in your browser. For production use, configure it as an environment variable.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!apiKey.trim()}
                        className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${saved
                                ? 'bg-green-500 text-white'
                                : apiKey.trim()
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {saved ? (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Saved!
                            </span>
                        ) : (
                            'Save API Key'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
