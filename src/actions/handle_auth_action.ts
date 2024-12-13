'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/db/supabase/server'
import { SignupFormData } from '@/types/AuthType'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: SignupFormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  })
  if (error) {
    console.error(error)
    return
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  console.log('Logging out...')
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
    return
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGithub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL,
    },
  })
  if (error) {
    console.error(error)
    return
  }

  if (data.url) {
    redirect(data.url)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL,
    },
  })
  if (error) {
    console.error(error)
    return
  }

  if (data.url) {
    redirect(data.url)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
