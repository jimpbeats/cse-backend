import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Save, Upload, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../../utils/supabase/info';

type HeroData = {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  background_image: string;
};

export function HeroManager() {
  const context = useContext(AppContext);
  const [heroData, setHeroData] = useState<HeroData>({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    background_image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { session } = context;

  const fetchHeroData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/hero`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hero data');
      }

      const data = await response.json();
      setHeroData(data);
    } catch (error) {
      console.error('Error fetching hero data:', error);
      toast.error('Failed to load hero section data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(heroData),
      });

      if (!response.ok) {
        throw new Error('Failed to save hero data');
      }

      toast.success('Hero section updated successfully!');
    } catch (error) {
      console.error('Error saving hero data:', error);
      toast.error('Failed to save hero section');
    } finally {
      setSaving(false);
    }
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
      setHeroData(prev => ({ ...prev, background_image: result.url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: keyof HeroData, value: string) => {
    setHeroData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading hero section...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Editor */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Hero Section Manager</span>
              </CardTitle>
              <CardDescription>
                Customize your homepage hero section content and appearance
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Live Editor
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Hero Title</Label>
                <Input
                  id="title"
                  value={heroData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Welcome to our amazing platform"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={heroData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="A brief description of what you offer..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={heroData.button_text}
                  onChange={(e) => handleInputChange('button_text', e.target.value)}
                  placeholder="Get Started"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                  id="button_link"
                  value={heroData.button_link}
                  onChange={(e) => handleInputChange('button_link', e.target.value)}
                  placeholder="https://example.com or #section"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_image">Background Image</Label>
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
                {heroData.background_image && (
                  <p className="text-xs text-gray-500">Current: Image uploaded</p>
                )}
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Live Preview</h3>
                <Card className="border-dashed border-2 border-gray-300 overflow-hidden">
                  <div 
                    className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 min-h-[300px] flex items-center justify-center"
                    style={{
                      backgroundImage: heroData.background_image ? `url(${heroData.background_image})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {heroData.background_image && (
                      <div className="absolute inset-0 bg-black/40"></div>
                    )}
                    <div className="relative text-center space-y-4 max-w-lg">
                      <h1 className="text-3xl text-white">
                        {heroData.title || 'Your Hero Title'}
                      </h1>
                      <p className="text-lg text-gray-100">
                        {heroData.subtitle || 'Your compelling subtitle goes here...'}
                      </p>
                      {heroData.button_text && (
                        <Button 
                          className="bg-white text-gray-900 hover:bg-gray-100"
                          size="lg"
                        >
                          {heroData.button_text}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-gray-900 mb-2">Button Link Options:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• External URL: https://example.com</li>
                <li>• Internal anchor: #section-id</li>
                <li>• Email: mailto:contact@example.com</li>
                <li>• Phone: tel:+1234567890</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 mb-2">Image Guidelines:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Recommended: 1920x1080px</li>
                <li>• Formats: JPG, PNG, WebP</li>
                <li>• Max size: 10MB</li>
                <li>• High contrast images work best</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}