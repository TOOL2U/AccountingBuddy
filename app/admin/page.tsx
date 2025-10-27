'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Webhook, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { uiStaggerContainer, cardAnimationVariants } from '@/hooks/usePageAnimations';

interface WebhookEvent {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export default function AdminPage() {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string>('');
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('webhook_events');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored events:', e);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('webhook_events', JSON.stringify(events));
    }
  }, [events]);

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResponse('');

    const newEvent: WebhookEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      status: 'pending',
      message: 'Testing webhook...',
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events

    try {
      // Simulate webhook test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockResponse = {
        status: 'success',
        timestamp: new Date().toISOString(),
        message: 'Webhook test completed successfully',
        endpoint: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Not configured',
      };

      setWebhookResponse(JSON.stringify(mockResponse, null, 2));
      
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newEvent.id
            ? { ...e, status: 'success', message: 'Webhook test successful' }
            : e
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setWebhookResponse(JSON.stringify({ error: errorMessage }, null, 2));
      
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newEvent.id
            ? { ...e, status: 'error', message: `Error: ${errorMessage}` }
            : e
        )
      );
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCopyDebugJSON = () => {
    const debugData = {
      environment: process.env.NODE_ENV,
      webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'Not configured',
      timestamp: new Date().toISOString(),
      recentEvents: events.slice(0, 5),
    };

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const getStatusIcon = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-accent-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-accent-danger" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-accent-warn animate-pulse" />;
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-8 md:py-12"
      variants={uiStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6 md:mb-8" variants={cardAnimationVariants}>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
          Admin Panel
        </h1>
        <p className="text-text-secondary">
          Test webhooks and view system events
        </p>
      </motion.div>

      {/* Webhook Testing Card */}
      <motion.div className="glass rounded-2xl p-6 mb-6" variants={cardAnimationVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-accent-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Webhook Testing
          </h2>
        </div>

        <p className="text-text-secondary mb-4 text-sm">
          Test the Google Sheets webhook integration and view the response.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="flex-1 sm:flex-none bg-accent-primary hover:bg-accent-hover text-white font-medium rounded-xl px-6 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base"
          >
            {isTestingWebhook ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Webhook className="w-4 h-4" />
                Test Webhook
              </>
            )}
          </button>

          <button
            onClick={handleCopyDebugJSON}
            className="glass glass-hover text-text-primary font-medium rounded-xl px-6 py-2.5 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base"
          >
            <Copy className="w-4 h-4" />
            Copy Debug JSON
          </button>
        </div>

        {/* Response Block */}
        {webhookResponse && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Response:
            </label>
            <pre className="bg-black/30 border border-white/10 rounded-lg p-4 text-xs text-text-primary font-mono overflow-x-auto">
              {webhookResponse}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Recent Events Card */}
      <motion.div className="glass rounded-2xl p-6" variants={cardAnimationVariants}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Recent Events
        </h2>

        {events.length === 0 ? (
          <p className="text-text-meta text-sm text-center py-8">
            No events yet. Test the webhook to see events here.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(event.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium">
                      {event.message}
                    </p>
                    <p className="text-xs text-text-meta mt-1">
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <button
            onClick={() => {
              setEvents([]);
              localStorage.removeItem('webhook_events');
            }}
            className="mt-4 w-full text-sm text-accent-danger hover:text-red-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-danger/50 focus:ring-offset-2 focus:ring-offset-dark-base rounded px-2 py-1"
          >
            Clear All Events
          </button>
        )}
      </motion.div>

      {/* Copied Toast */}
      {copiedToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent-success text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="w-5 h-5" />
          Copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  );
}

