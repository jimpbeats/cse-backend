import React from 'react';
import { Card } from '../ui/card';

interface PreviewProps {
  post: {
    title: string;
    content: string;
    cover_image?: string;
    tags: string[];
  };
}

export function BlogPreview({ post }: PreviewProps) {
  return (
    <Card className="overflow-hidden">
      {post.cover_image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-gray-100 rounded-full text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}