const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': navigator.language || 'en',
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Unable to reach the Agriwise API. Check that the backend is running.')
  }

  let data

  try {
    data = await response.json()
  } catch {
    if (!response.ok) {
      const error = new Error(`The Agriwise API returned an error (${response.status}).`)
      error.status = response.status
      throw error
    }
    throw new Error('The Agriwise API returned an invalid response.')
  }

  if (!response.ok) {
    const error = new Error(data.error || `The request failed (${response.status}).`)
    error.status = response.status
    throw error
  }

  return data
}

export function getRegions() {
  return request('/meta/regions')
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyRegistration(phone, otp) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  })
}

export function login(phone, pin) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, pin }),
  })
}

export async function getCurrentUser(token) {
  const { user } = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })

  return user
}

export function saveAuthSession({ token, user }) {
  localStorage.setItem('agriwiseToken', token)
  localStorage.setItem('agriwiseUser', JSON.stringify(user))
}