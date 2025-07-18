/*
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, refreshAccessToken } = useAuth()
  
  const refreshToken = useCookie('refreshToken')
  const remember_me = useCookie('remember_me')

  console.log('Middleware auth - cookies:', {
    remember_me: remember_me.value,
    refreshToken: refreshToken.value,
    path: to.path
  })

  if (!isAuthenticated.value && remember_me.value == true) {
    console.log('dentro de middleware auth')
    // Intentar refresh
    const success = await refreshAccessToken()
    if (!success) {
      return navigateTo('/login')
    }
  } else if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})