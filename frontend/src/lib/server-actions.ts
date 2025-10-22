'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CreateTaskRequest, UpdateTaskRequest, Task, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    redirect('/login');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Task Server Actions
export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const result = await makeAuthenticatedRequest<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard');
  
  return result;
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  const result = await makeAuthenticatedRequest<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/tasks/${id}`);
  
  return result;
}

export async function deleteTask(id: string): Promise<void> {
  await makeAuthenticatedRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
  
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard');
}

