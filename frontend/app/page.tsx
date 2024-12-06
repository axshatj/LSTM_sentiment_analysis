'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function SentimentAnalysis() {
  const [review, setReview] = useState('')
  const [sentiment, setSentiment] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSentiment = async () => {
    if (!review.trim()) {
      setSentiment(null)
      setConfidence(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review }),
      })
      if (!response.ok) {
        throw new Error('Failed to analyze sentiment')
      }
      const data = await response.json()
      setSentiment(data.sentiment)
      setConfidence(data.confidence)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while analyzing the sentiment. Please try again.')
      setSentiment(null)
      setConfidence(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600">Sentiment Analysis</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Analyze the sentiment of your text using our advanced LSTM model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your review here..."
            className="min-h-[150px] text-lg"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <Button
            className="w-full text-lg"
            onClick={analyzeSentiment}
            disabled={loading || !review.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Sentiment'
            )}
          </Button>
          {error && (
            <div className="text-center text-red-600 font-semibold">
              {error}
            </div>
          )}
          {sentiment && confidence !== null && (
            <div className="text-center space-y-2">
              <div className={`text-xl font-semibold ${
                sentiment === 'Positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                Sentiment: {sentiment}
              </div>
              <div className="text-gray-600">
                Confidence: {confidence.toFixed(2)}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

