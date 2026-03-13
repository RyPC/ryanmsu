'use client'

import type { SideTrailContent as SideTrailContentType } from '@/data/sideTrails'

interface SideTrailContentProps {
  content: SideTrailContentType
}

export function SideTrailContent({ content }: SideTrailContentProps) {
  return (
    <div className="prose prose-amber max-w-none">
      <p className="text-gray-600 mb-6">{content.description}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {content.techStack.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>

      {content.url && (
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium mb-8"
        >
          Visit →
        </a>
      )}

      <div className="space-y-6">
        {content.sections.map((section, i) => (
          <div key={i}>
            {section.type === 'text' && (
              <p className="text-gray-700 leading-relaxed">
                {section.content as string}
              </p>
            )}
            {section.type === 'list' && (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(section.content as string[]).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
            {section.type === 'code' && (
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{section.content as string}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
