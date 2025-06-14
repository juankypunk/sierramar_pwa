/*
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export const useAuth = () => {
  const config = useRuntimeConfig()
  const accessToken = useAccessToken()
  const refreshToken = useCookie('refreshToken')
  const remember_me = useCookie('remember_me')

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(credentials) {
    try {
      const { data } = await useFetch(`${config.public.api}/auth/login`, {
        method: 'POST',
        body: credentials,
        credentials: 'include'
      })

      if (data.value) {
        accessToken.value = data.value.accessToken
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }


  async function refreshAccessToken() {
    try {
      const { data } = await useFetch(`${config.public.api}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })

      if (data.value?.accessToken) {
        accessToken.value = data.value.accessToken
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  const validateRefreshToken = async () => {
    try {
      const config = useRuntimeConfig()
      const refreshToken = useCookie('refreshToken')
      
      if (!refreshToken.value) return false

      const { data } = await useFetch(`${config.public.api}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })

      if (data.value?.accessToken) {
        accessToken.value = data.value.accessToken
        return true
      }
      return false
    } catch (error) {
      console.error('Error validating refresh token:', error)
      return false
    }
  }

  async function logout() {
    try {
      // Llamada al backend para invalidar el token
      await useFetch(`${config.public.api}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      // Limpiar estado local incluso si falla la llamada al backend
      accessToken.value = null
      refreshToken.value = null
      remember_me.value = null
      navigateTo('/login')
    }
  }


  return {
    login,
    refreshAccessToken,
    validateRefreshToken,
    logout,
    isAuthenticated,
    accessToken,
  }
}