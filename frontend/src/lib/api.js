const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("CRITICAL: VITE_API_URL is not defined in your environment variables!");
}

// Helper to dynamically inject the JWT token from localStorage
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Centralized response and error unboxing engine
const handleResponse = async (response) => {
  const json = await response.json().catch(() => {
    throw new Error(`Server responded with status ${response.status} (Non-JSON payload)`);
  });

  if (!response.ok) {
    const errorMsg = 
      (json.errors && Array.isArray(json.errors) ? json.errors.join(', ') : null) || 
      json.message || 
      json.error || 
      json.msg || 
      `Server Error: ${response.status}`;
      
    throw new Error(errorMsg);
  }
  return json;
};
export const api = {
  BASE_URL,
  auth: {
    register: (userData) => 
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),

    login: (credentials) => 
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),
  },

  applications: {
    getAll: () => 
      fetch(`${BASE_URL}/applications`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    getOne: (id) =>
      fetch(`${BASE_URL}/applications/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    create: (applicationData) => 
      fetch(`${BASE_URL}/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(applicationData),
      }).then(handleResponse),

    update: (id, updateData) => 
      fetch(`${BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      }).then(handleResponse),

    delete: (id) => 
      fetch(`${BASE_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  },
  stats: {
    get: async () => {
      const response = await fetch(`${BASE_URL}/applications/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  interviews: {
    getUpcoming: async () => {
      const response = await fetch(`${BASE_URL}/interviews/upcoming`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: (applicationId, interviewData) =>
      fetch(`${BASE_URL}/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(interviewData),
      }).then(handleResponse),

    delete: (interviewId) =>
      fetch(`${BASE_URL}/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  }
};