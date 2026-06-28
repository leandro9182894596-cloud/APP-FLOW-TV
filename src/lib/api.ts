const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private setToken(token: string) {
    localStorage.setItem('accessToken', token)
  }

  private setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token)
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          this.setToken(data.accessToken)
          this.setRefreshToken(data.refreshToken)
          
          const retryHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${data.accessToken}`,
          }

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          })

          if (!retryResponse.ok) {
            throw new Error('Request failed after token refresh')
          }
          return retryResponse.json()
        } else {
          this.clearTokens()
          window.location.href = '/login'
        }
      } else {
        this.clearTokens()
        window.location.href = '/login'
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async register(email: string, password: string, username?: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })
    if (response.accessToken && response.refreshToken) {
      this.setToken(response.accessToken)
      this.setRefreshToken(response.refreshToken)
    }
    return response
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (response.accessToken && response.refreshToken) {
      this.setToken(response.accessToken)
      this.setRefreshToken(response.refreshToken)
    }
    return response
  }

  async logout() {
    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    }
    this.clearTokens()
  }

  async getProfile() {
    return this.request('/users/profile')
  }

  async updateProfile(data: { username?: string; avatarUrl?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getDnsConnections() {
    return this.request('/users/dns')
  }

  async createDnsConnection(data: { dnsUrl: string; username: string; password: string }) {
    return this.request('/users/dns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDnsConnection(id: string, data: { dnsUrl: string; username: string; password: string }) {
    return this.request(`/users/dns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDnsConnection(id: string) {
    return this.request(`/users/dns/${id}`, {
      method: 'DELETE',
    })
  }

  async getFavorites() {
    return this.request('/favorites')
  }

  async createFavorite(data: { contentType: string; contentId: number; title: string; poster?: string }) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteFavorite(contentType: string, contentId: number) {
    return this.request(`/favorites/${contentType}/${contentId}`, {
      method: 'DELETE',
    })
  }

  async getHistory() {
    return this.request('/history')
  }

  async upsertHistory(data: {
    contentType: string;
    contentId: number;
    episodeId?: string;
    title: string;
    poster?: string;
    position?: number;
    duration?: number;
  }) {
    return this.request('/history', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteHistoryItem(contentType: string, contentId: number) {
    return this.request(`/history/${contentType}/${contentId}`, {
      method: 'DELETE',
    })
  }

  async clearHistory() {
    return this.request('/history', {
      method: 'DELETE',
    })
  }

  async getSettings() {
    return this.request('/settings')
  }

  async updateSettings(data: { logo?: string; background?: string; banners?: any }) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getAds() {
    return this.request('/ads')
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

export const api = new ApiClient()
