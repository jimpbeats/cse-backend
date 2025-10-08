import React, { useState, useexport type FormField = {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export type { Form, FormResponse };useContext } from 'react';
import { AppContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { formTemplates } from '../forms/form-templates';
import { FormAnalytics } from '../forms/form-analytics';
import { exportResponsesToCSV, downloadCSV } from '../../utils/export-utils';
import { 
  Plus, 
  FormInput, 
  Trash2, 
  Save,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  BarChart3,
  Settings,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../../utils/supabase/info';

type FormField = {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

type Form = {
  id: string;
  title: string;
  description: string;
  slug: string;
  schema: FormField[];
  created_by: string;
  created_at: string;
};

type FormResponse = {
  id: string;
  form_slug: string;
  data: Record<string, any>;
  submitted_at: string;
};

export function FormsManager() {
  const context = useContext(AppContext);
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewingResponses, setViewingResponses] = useState<string | null>(null);

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { session, user } = context;

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/forms`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }

      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (slug: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/forms/${slug}/responses`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }

      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('Failed to load responses');
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchForms();
    }
  }, [session]);

  const createNewForm = () => {
    const newForm: Form = {
      id: '',
      title: '',
      description: '',
      slug: '',
      schema: [],
      created_by: user?.id || '',
      created_at: new Date().toISOString()
    };
    setEditingForm(newForm);
    setIsDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleInputChange = (field: keyof Form, value: any) => {
    if (!editingForm) return;
    
    const updatedForm = { ...editingForm, [field]: value };
    
    if (field === 'title') {
      updatedForm.slug = generateSlug(value);
    }
    
    setEditingForm(updatedForm);
  };

  const addField = () => {
    if (!editingForm) return;
    
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New Field',
      required: false
    };
    
    setEditingForm({
      ...editingForm,
      schema: [...editingForm.schema, newField]
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!editingForm) return;
    
    setEditingForm({
      ...editingForm,
      schema: editingForm.schema.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeField = (fieldId: string) => {
    if (!editingForm) return;
    
    setEditingForm({
      ...editingForm,
      schema: editingForm.schema.filter(field => field.id !== fieldId)
    });
  };

  const handleSave = async () => {
    if (!editingForm) return;

    try {
      setSaving(true);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(editingForm),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      toast.success('Form created successfully!');
      setIsDialogOpen(false);
      setEditingForm(null);
      fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const copyFormUrl = (slug: string) => {
    const url = `${window.location.origin}#forms/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Form URL copied to clipboard!');
  };

  const viewResponses = (slug: string) => {
    setViewingResponses(slug);
    fetchResponses(slug);
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'file', label: 'File Upload' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FormInput className="w-5 h-5" />
                <span>Forms Manager</span>
              </CardTitle>
              <CardDescription>
                Create custom forms and collect responses
              </CardDescription>
            </div>
            <Button onClick={createNewForm} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Form</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Forms List */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Forms ({forms.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchForms} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-8">
              <FormInput className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No forms created yet</p>
              <Button onClick={createNewForm}>Create your first form</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-gray-900">{form.title}</h3>
                        <Badge variant="secondary">{form.schema.length} fields</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{form.description}</p>
                      <p className="text-sm text-gray-500">
                        Form URL: /forms/{form.slug}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFormUrl(form.slug)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`#forms/${form.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewResponses(form.slug)}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Builder Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Build your custom form with various field types
            </DialogDescription>
          </DialogHeader>
          
          {editingForm && (
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Start with a Template</Label>
                <Select
                  onValueChange={(template) => {
                    if (template in formTemplates) {
                      const selected = formTemplates[template as keyof typeof formTemplates];
                      setEditingForm({
                        ...editingForm,
                        title: selected.title,
                        description: selected.description,
                        schema: selected.schema,
                        slug: generateSlug(selected.title)
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">Contact Form</SelectItem>
                    <SelectItem value="event">Event Registration</SelectItem>
                    <SelectItem value="feedback">Feedback Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Form Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={editingForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Contact Form"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-slug">URL Slug</Label>
                  <Input
                    id="form-slug"
                    value={editingForm.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="contact-form"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={editingForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your form..."
                  rows={2}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Form Fields</Label>
                  <Button variant="outline" size="sm" onClick={addField}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {editingForm.schema.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FormInput className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No fields added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingForm.schema.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex items-center pt-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Field Type</Label>
                              <Select 
                                value={field.type} 
                                onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Field label"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                placeholder="Placeholder text"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6">
                            <label className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="rounded"
                              />
                              <span>Required</span>
                            </label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div className="mt-4">
                            <Label>Options (one per line)</Label>
                            <Textarea
                              value={(field.options || []).join('\n')}
                              onChange={(e) => updateField(field.id, { 
                                options: e.target.value.split('\n').filter(Boolean) 
                              })}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Creating...' : 'Create Form'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Responses Modal */}
      <Dialog open={!!viewingResponses} onOpenChange={() => setViewingResponses(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Responses</DialogTitle>
            <DialogDescription>
              View submissions and analytics for this form
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No responses yet</p>
              </div>
            ) : (
              <>
                {/* Analytics Section */}
                <FormAnalytics 
                  responses={responses} 
                  fields={forms.find(f => f.slug === viewingResponses)?.schema || []}
                />

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const form = forms.find(f => f.slug === viewingResponses);
                      if (!form) return;
                      
                      const csv = exportResponsesToCSV(responses, form.schema);
                      downloadCSV(csv, `${form.slug}-responses.csv`);
                    }}
                  >
                    Export to CSV
                  </Button>
                </div>

                {/* Responses List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Individual Responses</h3>
                  {responses.map((response) => (
                    <Card key={response.id} className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {new Date(response.submitted_at).toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(response.data).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs text-gray-500">{key}</Label>
                              <p className="text-sm text-gray-900">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}