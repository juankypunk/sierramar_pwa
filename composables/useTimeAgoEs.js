/*
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export const useTimeAgoEs = (time) => {
  return useTimeAgo(time, {
    messages: {
      justNow: 'ahora mismo',
      past: n => n.match(/\d/) ? `hace ${n}` : `${n}`,
      future: n => n.match(/\d/) ? `en ${n}` : `${n}`,
      month: (n, past) => n === 1 
        ? past 
          ? 'el mes pasado' 
          : 'el próximo mes'
        : `${n} meses`,
      year: (n, past) => n === 1
        ? past 
          ? 'el año pasado'
          : 'el próximo año'
        : `${n} años`,
      day: (n, past) => n === 1
        ? past 
          ? 'ayer'
          : 'mañana'
        : `${n} días`,
      week: (n, past) => n === 1
        ? past 
          ? 'la semana pasada'
          : 'la próxima semana'
        : `${n} semanas`,
      hour: n => `${n} horas`,
      minute: n => `${n} minutos`,
      second: n => `${n} segundos`,
    }
  })
}