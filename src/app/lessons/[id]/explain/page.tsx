"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import LessonStoryNarrator from '@/app/components/explain/LessonStoryNarrator';
import { Loader2, ArrowLeft } from 'lucide-react';

// Utility function to extract text from lesson code
function extractTextFromCode(code: string): string {
  // Remove code blocks, imports, and JSX syntax
  let text = code
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
    .replace(/export\s+.*?function\s+/g, '')
    .replace(/const\s+\w+\s*=\s*/g, '')
    .replace(/<[^>]+>/g, ' ') // Remove JSX tags
    .replace(/\{[^}]+\}/g, ' ') // Remove JSX expressions
    .replace(/['"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract text from string literals
  const stringMatches = code.match(/'([^']+)'|"([^"]+)"/g);
  if (stringMatches) {
    const extractedStrings = stringMatches
      .map(match => match.replace(/['"]/g, ''))
      .filter(str => str.length > 10) // Only meaningful strings
      .join(' ');
    if (extractedStrings) {
      text = extractedStrings + ' ' + text;
    }
  }

  return text || 'This lesson contains interactive content.';
}

export default function LessonExplainPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('english');
  const [error, setError] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [lessonOutline, setLessonOutline] = useState<string>('');

  useEffect(() => {
    async function fetchLesson() {
      try {
        const supabase = createClient();
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (lessonError) throw lessonError;
        if (!lesson) {
          setError('Lesson not found');
          return;
        }

        setTopic(lesson.outline || '');
        setLessonOutline(lesson.outline || '');
        
        // Extract text from lesson content
        const extractedText = lesson.content 
          ? extractTextFromCode(lesson.content)
          : lesson.outline || '';

        setLessonContent(extractedText);
        
        // Show language selector first
        setShowLanguageSelector(true);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const generateStory = async (content: string, topicTitle: string, selectedLanguage?: string) => {
    setGenerating(true);
    setError(null);

    // Use the passed language or fall back to current state
    const languageToUse = selectedLanguage || language;

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          topic: topicTitle,
          language: languageToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const data = await response.json();
      setStory(data.story);
      setShowLanguageSelector(false);
    } catch (err) {
      console.error('Error generating story:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate story. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    setShowLanguageSelector(false);
    // Generate story with selected language - pass it directly to avoid state timing issues
    await generateStory(lessonContent, lessonOutline, newLanguage);
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg">
          {loading ? 'Loading lesson...' : 'Generating story...'}
        </p>
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showLanguageSelector && !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-indigo-800/50 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Language</h2>
          <div className="space-y-4">
            <button
              onClick={() => handleLanguageChange('english')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('hindi')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Hindi (हिंदी)
            </button>
            <button
              onClick={() => handleLanguageChange('hinglish')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LessonStoryNarrator
      story={story}
      topic={topic}
      language={language}
      onBack={() => router.back()}
    />
  );
}

