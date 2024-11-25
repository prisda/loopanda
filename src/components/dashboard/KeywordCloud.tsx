import { useMemo } from 'react';
import { Feature } from '../../types';
import ReactECharts from 'echarts-for-react';
import 'echarts-wordcloud';

interface KeywordCloudProps {
  features: Feature[];
}

export function KeywordCloud({ features }: KeywordCloudProps) {
  const keywords = useMemo(() => {
    if (!features.length) return [];

    // Combine all titles and descriptions
    const text = features
      .map(f => `${f.title} ${f.description}`)
      .join(' ')
      .toLowerCase();

    // Remove common words and split into words
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
    const words = text.split(/\W+/).filter(word => 
      word.length > 2 && !commonWords.has(word)
    );

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to ECharts format
    return Object.entries(wordCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);
  }, [features]);

  const option = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      right: null,
      bottom: null,
      sizeRange: [12, 30],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function() {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')';
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: keywords
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Keywords</h2>
      {keywords.length > 0 ? (
        <ReactECharts 
          option={option}
          style={{ height: '300px' }}
          opts={{ renderer: 'canvas' }}
        />
      ) : (
        <p className="text-center text-gray-500 py-12">No data available</p>
      )}
    </div>
  );
}