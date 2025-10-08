import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar, User, ExternalLink, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../utils/supabase/info';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  tags: string[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  author_id: string;
};

export function PublicBlog({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    } else {
      fetchAllPosts();
    }
  }, [slug]);

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get all posts to find by slug
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const posts = await response.json();
      const foundPost = posts.find((p: BlogPost) => p.slug === slug && p.status === 'published');

      if (!foundPost) {
        setError('Blog post not found or not published');
        return;
      }

      setPost(foundPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const posts = await response.json();
      const publishedPosts = posts.filter((p: BlogPost) => p.status === 'published');
      setAllPosts(publishedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const sharePost = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const goBack = () => {
    window.location.hash = '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl mb-4">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Single post view
  if (slug && post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goBack} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <Button variant="outline" onClick={sharePost} className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/70 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              {/* Cover Image */}
              {post.cover_image && (
                <img 
                  src={post.cover_image} 
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                />
              )}

              {/* Title and Meta */}
              <div className="mb-8">
                <h1 className="text-4xl mb-4">{post.title}</h1>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover insights, tutorials, and stories from our team
            </p>
          </div>
        </div>
      </header>

      {/* Blog Posts */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allPosts.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-lg border-white/20">
            <CardContent className="p-16 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl mb-4">No Posts Yet</h2>
              <p className="text-gray-600 mb-6">
                We're working on some amazing content. Check back soon!
              </p>
              <Button onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post) => (
              <Card key={post.id} className="bg-white/70 backdrop-blur-lg border-white/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.hash = `blog/${post.slug}`}>
                <CardContent className="p-0">
                  {post.cover_image && (
                    <img 
                      src={post.cover_image} 
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    
                    <h3 className="text-xl mb-3 line-clamp-2">{post.title}</h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content.substring(0, 150)}...
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Read more</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}