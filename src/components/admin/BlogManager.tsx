import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BlogPreview } from '../blog/BlogPreview';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Save,
  Upload,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../../utils/supabase/info';

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

export function BlogManager() {
  const context = useContext(AppContext);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveId, setAutoSaveId] = useState<NodeJS.Timeout>();
  const [lastSaved, setLastSaved] = useState<Date>();

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { session, user } = context;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: '',
      title: '',
      slug: '',
      content: '',
      cover_image: '',
      tags: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: user?.id || ''
    };
    setEditingPost(newPost);
    setIsDialogOpen(true);
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleInputChange = (field: keyof BlogPost, value: any) => {
    if (!editingPost) return;
    
    const updatedPost = { ...editingPost, [field]: value };
    
    // Auto-generate slug from title
    if (field === 'title') {
      updatedPost.slug = generateSlug(value);
    }
    
    setEditingPost(updatedPost);

    // Clear existing auto-save timer
    if (autoSaveId) {
      clearTimeout(autoSaveId);
    }

    // Set new auto-save timer (3 seconds after last change)
    setAutoSaveId(
      setTimeout(async () => {
        if (editingPost.id) { // Only auto-save existing posts
          await handleSave(true);
          setLastSaved(new Date());
        }
      }, 3000)
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      handleInputChange('cover_image', result.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!editingPost) return;

    try {
      setSaving(true);
      const isNew = !editingPost.id;
      const url = isNew 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts`
        : `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts/${editingPost.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(editingPost),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      if (!isAutoSave) {
        toast.success(`Post ${isNew ? 'created' : 'updated'} successfully!`);
        setIsDialogOpen(false);
        setEditingPost(null);
        fetchPosts();
      } else {
        // Silent save for auto-save
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (!isAutoSave) {
        toast.error('Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      toast.success('Post deleted successfully!');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getPublicUrl = (slug: string) => {
    return `${window.location.origin}#blog/${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Blog Posts Manager</span>
              </CardTitle>
              <CardDescription>
                Create, edit, and manage your blog content
              </CardDescription>
            </div>
            <Button onClick={createNewPost} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Posts List */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Posts ({posts.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchPosts} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No blog posts yet</p>
              <Button onClick={createNewPost}>Create your first post</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-gray-900">{post.title || 'Untitled Post'}</h3>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {post.slug && `/${post.slug}`}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>You</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.status === 'published' && post.slug && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getPublicUrl(post.slug), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPost(post)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost?.id ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your blog post
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-6">
              <Tabs defaultValue="edit">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editingPost.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter post title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={editingPost.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="post-url-slug"
                      />
                    </div>
                  </div>
                  
                  {lastSaved && (
                    <p className="text-sm text-gray-500 text-right">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <RichTextEditor
                      content={editingPost.content}
                      onChange={(content) => handleInputChange('content', content)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cover_image">Cover Image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" disabled={uploading}>
                          <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      {editingPost.cover_image && (
                        <img 
                          src={editingPost.cover_image} 
                          alt="Cover preview" 
                          className="w-full h-32 object-cover rounded-lg mt-2"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={editingPost.status} 
                        onValueChange={(value: 'draft' | 'published') => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={editingPost.tags.join(', ')}
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                      placeholder="technology, web development, react"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSave()} disabled={saving}>
                      <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                      {saving ? 'Saving...' : 'Save Post'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <BlogPreview post={editingPost} />
                </TabsContent>
              </Tabs>
            </div>
          )}

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={editingPost.content}
                  onChange={(content) => handleInputChange('content', content)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" disabled={uploading}>
                      <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  {editingPost.cover_image && (
                    <img 
                      src={editingPost.cover_image} 
                      alt="Cover preview" 
                      className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select                   value={editingPost?.status || 'draft'} onValueChange={(value: 'draft' | 'published') => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={editingPost.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  placeholder="technology, web development, react"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}