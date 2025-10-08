const { createClient } = require('@supabase/supabase-js');

const projectId = 'cgicptkbwmfscrenbxxf';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnaWNwdGtid21mc2NyZW5ieHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTA0ODgsImV4cCI6MjA3NDU2NjQ4OH0.p8dfZwavKpinx9j5FYQaEtm2yoSgG9pr3NEC0PQhZrc';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

async function createDemoUser() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'jimpbeats@gmail.com', 
      password: 'admin123',
      options: {
        data: {
          name: 'Demo Admin',
          role: 'admin'
        }
      }
    });

    if (error) {
      console.error('Error creating demo user:', error.message);
    } else {
      console.log('Demo user created successfully:', data);
    }
  } catch (error) {
    console.error('Exception while creating demo user:', error);
  }
}

createDemoUser();