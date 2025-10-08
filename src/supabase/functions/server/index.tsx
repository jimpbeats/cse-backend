import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from '@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Create storage buckets on startup
const initializeStorage = async () => {
  const bucketName = 'make-a369a306-media'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/*', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    })
    if (error) {
      console.log('Bucket creation error:', error)
    } else {
      console.log('Storage bucket created successfully')
    }
  }
}

// Initialize storage on startup
initializeStorage()

// Create demo user on startup
const createDemoUser = async () => {
  try {
    const { data: existingUser } = await supabase.auth.admin.getUsersByEmail('admin@example.com')
    
    if (!existingUser || existingUser.users.length === 0) {
      await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'admin123',
        user_metadata: { name: 'Demo Admin', role: 'admin' },
        email_confirm: true
      })
      console.log('Demo user created successfully')
    }
  } catch (error) {
    console.log('Demo user creation error:', error)
  }
}

createDemoUser()

// Initialize demo content
const initializeDemoContent = async () => {
  try {
    // Check if demo content already exists
    const existingPosts = await kv.getByPrefix('blog_post_') || []
    
    if (existingPosts.length === 0) {
      // Create demo blog post
      const demoPost = {
        id: crypto.randomUUID(),
        title: 'Welcome to Your New Blog!',
        slug: 'welcome-to-your-new-blog',
        content: `Welcome to your new Universal React Backend Boilerplate! This is your first blog post to demonstrate the blogging functionality.

This platform includes:

🎨 **Modern Admin Interface** - Manage your content with a beautiful glassmorphism design
📝 **Blog Management** - Create, edit, and publish blog posts
📅 **Event Management** - Schedule and manage events
📋 **Custom Forms** - Build dynamic forms to collect user data
🖼️ **Media Upload** - Upload and manage images
📊 **Dashboard Analytics** - Track your content performance

## Getting Started

1. **Customize Your Hero Section** - Update the homepage banner with your branding
2. **Create Blog Posts** - Share your thoughts and expertise
3. **Schedule Events** - Keep your audience informed about upcoming events
4. **Build Forms** - Collect feedback and user information

## Technical Features

- ✅ **Supabase Integration** - Secure backend with real-time capabilities
- ✅ **Role-Based Access Control** - Manage user permissions
- ✅ **Responsive Design** - Works beautifully on all devices
- ✅ **SEO Optimized** - Built for search engine visibility
- ✅ **Type Safe** - Written in TypeScript for reliability

Start exploring the admin dashboard to customize your site and create amazing content!`,
        cover_image: '',
        tags: ['welcome', 'tutorial', 'getting-started'],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_id: 'demo-admin'
      }
      
      await kv.set('blog_post_welcome-to-your-new-blog', demoPost)
      
      // Create demo event
      const demoEvent = {
        id: crypto.randomUUID(),
        title: 'Platform Launch Webinar',
        description: 'Join us for an exciting webinar where we\'ll walk you through all the features of this Universal React Backend Boilerplate. Learn how to customize your site, create content, and build forms.',
        location: 'Online via Zoom',
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        image_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'demo-admin'
      }
      
      await kv.set(`event_${demoEvent.id}`, demoEvent)
      
      console.log('Demo content initialized successfully')
    }
  } catch (error) {
    console.log('Demo content initialization error:', error)
  }
}

initializeDemoContent()

// Helper function to verify authorization
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return { error: 'No authorization token provided', user: null }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return { error: 'Invalid or expired token', user: null }
  }
  
  return { error: null, user }
}

// Auth Routes
app.post('/make-server-a369a306/signup', async (c) => {
  try {
    const { email, password, name, role = 'editor' } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true // Auto-confirm since email server not configured
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ user: data.user, message: 'User created successfully' })
  } catch (error) {
    console.log('Signup exception:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Hero Section Routes
app.get('/make-server-a369a306/hero', async (c) => {
  try {
    const hero = await kv.get('hero_section')
    if (!hero) {
      // Return default hero data
      const defaultHero = {
        title: 'Welcome to Your Site',
        subtitle: 'Build amazing experiences with our platform',
        button_text: 'Get Started',
        button_link: '#',
        background_image: ''
      }
      await kv.set('hero_section', defaultHero)
      return c.json(defaultHero)
    }
    return c.json(hero)
  } catch (error) {
    console.log('Get hero error:', error)
    return c.json({ error: 'Failed to fetch hero section' }, 500)
  }
})

app.put('/make-server-a369a306/hero', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const heroData = await c.req.json()
    await kv.set('hero_section', heroData)
    return c.json({ message: 'Hero section updated successfully' })
  } catch (error) {
    console.log('Update hero error:', error)
    return c.json({ error: 'Failed to update hero section' }, 500)
  }
})

// Blog Posts Routes
app.get('/make-server-a369a306/posts', async (c) => {
  try {
    const posts = await kv.getByPrefix('blog_post_') || []
    return c.json(posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  } catch (error) {
    console.log('Get posts error:', error)
    return c.json({ error: 'Failed to fetch blog posts' }, 500)
  }
})

app.get('/make-server-a369a306/posts/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const post = await kv.get(`blog_post_${slug}`)
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }
    return c.json(post)
  } catch (error) {
    console.log('Get post error:', error)
    return c.json({ error: 'Failed to fetch blog post' }, 500)
  }
})

app.post('/make-server-a369a306/posts', async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const postData = await c.req.json()
    const slug = postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const post = {
      ...postData,
      id: crypto.randomUUID(),
      slug,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`blog_post_${slug}`, post)
    return c.json(post)
  } catch (error) {
    console.log('Create post error:', error)
    return c.json({ error: 'Failed to create blog post' }, 500)
  }
})

app.put('/make-server-a369a306/posts/:id', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const id = c.req.param('id')
    const postData = await c.req.json()
    
    // Find the post by ID in all blog posts
    const posts = await kv.getByPrefix('blog_post_') || []
    const existingPost = posts.find(post => post.id === id)
    
    if (!existingPost) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    const updatedPost = {
      ...existingPost,
      ...postData,
      updated_at: new Date().toISOString()
    }
    
    // Update using the slug key
    await kv.set(`blog_post_${updatedPost.slug}`, updatedPost)
    return c.json(updatedPost)
  } catch (error) {
    console.log('Update post error:', error)
    return c.json({ error: 'Failed to update blog post' }, 500)
  }
})

app.delete('/make-server-a369a306/posts/:id', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const id = c.req.param('id')
    
    // Find the post by ID to get the slug
    const posts = await kv.getByPrefix('blog_post_') || []
    const existingPost = posts.find(post => post.id === id)
    
    if (!existingPost) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    await kv.del(`blog_post_${existingPost.slug}`)
    return c.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.log('Delete post error:', error)
    return c.json({ error: 'Failed to delete blog post' }, 500)
  }
})



// Events Routes
app.get('/make-server-a369a306/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event_') || []
    return c.json(events.sort((a, b) => new Date(a.date_time) - new Date(b.date_time)))
  } catch (error) {
    console.log('Get events error:', error)
    return c.json({ error: 'Failed to fetch events' }, 500)
  }
})

app.post('/make-server-a369a306/events', async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const eventData = await c.req.json()
    const id = crypto.randomUUID()
    
    const event = {
      ...eventData,
      id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`event_${id}`, event)
    return c.json(event)
  } catch (error) {
    console.log('Create event error:', error)
    return c.json({ error: 'Failed to create event' }, 500)
  }
})

app.put('/make-server-a369a306/events/:id', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const id = c.req.param('id')
    const eventData = await c.req.json()
    const existingEvent = await kv.get(`event_${id}`)
    
    if (!existingEvent) {
      return c.json({ error: 'Event not found' }, 404)
    }
    
    const updatedEvent = {
      ...existingEvent,
      ...eventData,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`event_${id}`, updatedEvent)
    return c.json(updatedEvent)
  } catch (error) {
    console.log('Update event error:', error)
    return c.json({ error: 'Failed to update event' }, 500)
  }
})

app.delete('/make-server-a369a306/events/:id', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const id = c.req.param('id')
    await kv.del(`event_${id}`)
    return c.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.log('Delete event error:', error)
    return c.json({ error: 'Failed to delete event' }, 500)
  }
})

// Forms Routes
app.get('/make-server-a369a306/forms', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const forms = await kv.getByPrefix('form_') || []
    return c.json(forms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  } catch (error) {
    console.log('Get forms error:', error)
    return c.json({ error: 'Failed to fetch forms' }, 500)
  }
})

app.get('/make-server-a369a306/forms/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const form = await kv.get(`form_${slug}`)
    if (!form) {
      return c.json({ error: 'Form not found' }, 404)
    }
    return c.json(form)
  } catch (error) {
    console.log('Get form error:', error)
    return c.json({ error: 'Failed to fetch form' }, 500)
  }
})

app.post('/make-server-a369a306/forms', async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const formData = await c.req.json()
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const form = {
      ...formData,
      id: crypto.randomUUID(),
      slug,
      created_by: user.id,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`form_${slug}`, form)
    return c.json(form)
  } catch (error) {
    console.log('Create form error:', error)
    return c.json({ error: 'Failed to create form' }, 500)
  }
})

// Form Submissions
app.post('/make-server-a369a306/forms/:slug/submit', async (c) => {
  try {
    const slug = c.req.param('slug')
    const submissionData = await c.req.json()
    
    const form = await kv.get(`form_${slug}`)
    if (!form) {
      return c.json({ error: 'Form not found' }, 404)
    }
    
    const submission = {
      id: crypto.randomUUID(),
      form_id: form.id,
      form_slug: slug,
      data: submissionData,
      submitted_at: new Date().toISOString()
    }
    
    await kv.set(`submission_${submission.id}`, submission)
    return c.json({ message: 'Form submitted successfully' })
  } catch (error) {
    console.log('Form submission error:', error)
    return c.json({ error: 'Failed to submit form' }, 500)
  }
})

app.get('/make-server-a369a306/forms/:slug/responses', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const slug = c.req.param('slug')
    const submissions = await kv.getByPrefix('submission_') || []
    const formSubmissions = submissions.filter(sub => sub.form_slug === slug)
    
    return c.json(formSubmissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)))
  } catch (error) {
    console.log('Get form responses error:', error)
    return c.json({ error: 'Failed to fetch form responses' }, 500)
  }
})

app.get('/make-server-a369a306/forms/:slug/submissions', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const slug = c.req.param('slug')
    const submissions = await kv.getByPrefix('submission_') || []
    const formSubmissions = submissions.filter(sub => sub.form_slug === slug)
    
    return c.json(formSubmissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)))
  } catch (error) {
    console.log('Get submissions error:', error)
    return c.json({ error: 'Failed to fetch form submissions' }, 500)
  }
})

// File Upload Route
app.post('/make-server-a369a306/upload', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const fileName = `${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data, error } = await supabase.storage
      .from('make-a369a306-media')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      })
    
    if (error) {
      console.log('Upload error:', error)
      return c.json({ error: 'Failed to upload file' }, 500)
    }
    
    const { data: signedUrl } = await supabase.storage
      .from('make-a369a306-media')
      .createSignedUrl(data.path, 365 * 24 * 60 * 60) // 1 year
    
    return c.json({ 
      url: signedUrl?.signedUrl,
      path: data.path 
    })
  } catch (error) {
    console.log('Upload exception:', error)
    return c.json({ error: 'Failed to process file upload' }, 500)
  }
})

// Dashboard Stats
app.get('/make-server-a369a306/stats', async (c) => {
  try {
    const { error: authError } = await verifyAuth(c.req)
    if (authError) {
      return c.json({ error: authError }, 401)
    }
    
    const posts = await kv.getByPrefix('blog_post_') || []
    const events = await kv.getByPrefix('event_') || []
    const forms = await kv.getByPrefix('form_') || []
    const submissions = await kv.getByPrefix('submission_') || []
    
    const publishedPosts = posts.filter(p => p.status === 'published').length
    const upcomingEvents = events.filter(e => new Date(e.date_time) > new Date()).length
    
    return c.json({
      totalPosts: posts.length,
      publishedPosts: publishedPosts,
      totalEvents: events.length,
      upcomingEvents: upcomingEvents,
      totalForms: forms.length,
      totalResponses: submissions.length
    })
  } catch (error) {
    console.log('Get stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

Deno.serve(app.fetch)