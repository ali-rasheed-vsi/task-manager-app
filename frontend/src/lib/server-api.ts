import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User, Task, PaginatedResponse, PaginationQuery } from '@/types';

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

// Server-side API functions
export async function getProfile(): Promise<User> {
  return makeAuthenticatedRequest<User>('/auth/profile');
}

export async function getTasks(params?: PaginationQuery): Promise<PaginatedResponse<Task>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
  
  return makeAuthenticatedRequest<PaginatedResponse<Task>>(endpoint);
}

export async function getUsers(params?: PaginationQuery): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : '/users';
  
  return makeAuthenticatedRequest<PaginatedResponse<User>>(endpoint);
}

export async function getTaskById(id: string): Promise<Task> {
  return makeAuthenticatedRequest<Task>(`/tasks/${id}`);
}

