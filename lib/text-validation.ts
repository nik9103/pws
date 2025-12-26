// Карта для замены латинских букв на кириллицу (для обхода фильтров)
const latinToCyrillicMap: { [key: string]: string } = {
  'a': 'а', 'A': 'а', 'e': 'е', 'E': 'е', 'o': 'о', 'O': 'о',
  'p': 'р', 'P': 'р', 'c': 'с', 'C': 'с', 'x': 'х', 'X': 'х',
  'y': 'у', 'Y': 'у', 'u': 'у', 'U': 'у', 's': 'с', 'S': 'с', 'd': 'д', 'D': 'д',
  'f': 'ф', 'F': 'ф', 'g': 'г', 'G': 'г', 'l': 'л', 'L': 'л',
  'h': 'н', 'H': 'н', 'k': 'к', 'K': 'к', 'm': 'м', 'M': 'м',
  't': 'т', 'T': 'т', 'b': 'в', 'B': 'в', 'n': 'н', 'N': 'н',
  'r': 'р', 'R': 'р', 'i': 'и', 'I': 'и', 'z': 'з', 'Z': 'з',
  'w': 'ш', 'W': 'ш', 'j': 'й', 'J': 'й', 'q': 'к', 'Q': 'к',
  'v': 'в', 'V': 'в'
}

// Корни запрещенных слов для проверки через регулярные выражения
const forbiddenRoots = [
  // Основные корни (русские)
  { root: 'ху[йя]', variants: ['хуй', 'хуя', 'хуе', 'хуё'] },
  { root: 'п[иы]зд', variants: ['пизд', 'пызд'] },
  { root: 'еб', variants: ['еб'] },
  { root: 'ёб', variants: ['ёб'] },
  { root: 'ебан', variants: ['ебан'] },
  { root: 'ебнут', variants: ['ебнут'] },
  { root: 'бл[яь]', variants: ['бля', 'бль'] },
  { root: 'бляд', variants: ['бляд'] },
  { root: 'с[уы]к[а]?', variants: ['сук', 'сык', 'сука', 'сыка'] },
  { root: 'муд[аяк]?', variants: ['муд', 'муда', 'мудя', 'мудак'] },
  { root: 'долбо', variants: ['долбо'] },
  { root: 'г[ао]нд[оа]н', variants: ['гандон', 'гондон'] },
  { root: 'мраз', variants: ['мраз'] },
  { root: 'урод', variants: ['урод'] },
  { root: 'п[иы]д[оа]р?', variants: ['пид', 'пыд', 'пидор', 'пыдор', 'пида', 'пыда'] },
  { root: 'педр', variants: ['педр'] },
  { root: 'шлю[хш]', variants: ['шлюх', 'шлюш'] },
  { root: 'простит', variants: ['простит'] },
  { root: 'сос[иал]?', variants: ['соси', 'сосал'] },
  { root: 'дроч', variants: ['дроч'] },
  { root: 'залуп', variants: ['залуп'] },
  { root: 'манда', variants: ['манда'] },
  { root: 'сран', variants: ['сран'] },
  { root: 'говн', variants: ['говн'] },
  { root: 'дерьм', variants: ['дерьм'] },
  { root: 'твар', variants: ['твар'] },
  { root: 'ублюд', variants: ['ублюд'] },
  { root: 'жоп', variants: ['жоп'] },
  { root: 'очк', variants: ['очк'] },
  { root: 'анус', variants: ['анус'] },
  { root: 'секс', variants: ['секс'] },
  { root: 'порн', variants: ['порн'] },
  { root: 'минет', variants: ['минет'] },
  // Английские корни (будут нормализованы через latinToCyrillicMap)
  { root: 'ф[ау]к', variants: ['фак', 'фук'] }, // fuck
  { root: 'ш[иы]т', variants: ['шит', 'шыт'] }, // shit
  { root: 'б[иы]тч', variants: ['битч', 'бытч'] }, // bitch
  { root: 'а[сз][сз]', variants: ['асс', 'азз'] }, // ass
  { root: 'к[оа]к', variants: ['кок', 'как'] }, // cock
  { root: 'д[иы]к', variants: ['дик', 'дык'] }, // dick
]

// Функция нормализации текста для проверки (без пробелов для поиска запрещенных слов)
const normalizeText = (text: string): string => {
  if (!text) return ''
  
  // 1. Приводим к нижнему регистру
  let normalized = text.toLowerCase()
  
  // 2. Заменяем латинские символы на кириллицу
  normalized = normalized.replace(/[a-z]/g, (char) => latinToCyrillicMap[char] || char)
  
  // 3. Схлопываем повторения букв (3+ повторения до 2)
  normalized = normalized.replace(/([а-яё])\1{2,}/gi, '$1$1')
  
  // 4. Удаляем все неалфавитные символы (включая пробелы для поиска)
  normalized = normalized.replace(/[^а-яё]/gi, '')
  
  // 5. Схлопываем оставшиеся повторения букв (2+ одинаковых буквы подряд)
  normalized = normalized.replace(/([а-яё])\1+/gi, '$1')
  
  return normalized
}

// Функция проверки наличия запрещенных слов
export const hasForbiddenWords = (text: string): boolean => {
  if (!text) return false
  
  const normalized = normalizeText(text)
  
  // Проверяем каждый корень
  for (const { root } of forbiddenRoots) {
    // Создаем паттерн для поиска корня с учетом разделителей
    let pattern = root
      // Обрабатываем группы альтернатив [йя] -> (й|я)
      .replace(/\[([^\]]+)\]/g, (_, chars) => {
        return `(${chars.split('').join('|')})`
      })
      // Разбиваем на символы и добавляем разделители между буквами
      .split('')
      .filter(char => /[а-яё()|]/.test(char))
      .map((char) => {
        if (char === '(' || char === '|' || char === ')') return char
        // Экранируем специальные символы и добавляем разделители (но не пробелы)
        return `${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^а-яё\\s]*`
      })
      .join('')
    
    const regex = new RegExp(pattern, 'gi')
    
    // Проверяем наличие корня в нормализованном тексте
    if (regex.test(normalized)) {
      return true
    }
  }
  
  return false
}

// Функция создания карты позиций: нормализованный индекс -> исходный индекс
const createPositionMap = (text: string): Array<number> => {
  const map: Array<number> = []
  let normalizedPos = 0
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const normalizedChar = normalizeText(char)
    
    if (normalizedChar) {
      map[normalizedPos] = i
      normalizedPos++
    }
  }
  
  return map
}

// Функция очистки текста от запрещенных слов
export const sanitizeText = (text: string): string => {
  if (!text) return text
  
  let result = text
  let changed = true
  let iterations = 0
  const maxIterations = 10 // Защита от бесконечного цикла
  
  // Повторяем проверку, пока находим запрещенные слова
  while (changed && iterations < maxIterations) {
    iterations++
    changed = false
    const normalized = normalizeText(result)
    
    // Проверяем каждый корень
    for (const { root } of forbiddenRoots) {
      // Создаем паттерн для поиска корня с учетом разделителей (но не пробелов)
      let pattern = root
        // Обрабатываем группы альтернатив [йя] -> (й|я)
        .replace(/\[([^\]]+)\]/g, (_, chars) => {
          return `(${chars.split('').join('|')})`
        })
        // Разбиваем на символы и добавляем разделители между буквами
        .split('')
        .filter(char => /[а-яё()|]/.test(char))
        .map((char) => {
          if (char === '(' || char === '|' || char === ')') return char
          // Экранируем специальные символы и добавляем разделители (но не пробелы)
          return `${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^а-яё\\s]*`
        })
        .join('')
      
      const regex = new RegExp(pattern, 'gi')
      
      // Находим все вхождения в нормализованном тексте
      const matches: Array<{ start: number; end: number }> = []
      let match
      const testNormalized = normalized
      
      // Сбрасываем lastIndex для глобального regex
      regex.lastIndex = 0
      while ((match = regex.exec(testNormalized)) !== null) {
        matches.push({ 
          start: match.index, 
          end: match.index + match[0].length
        })
      }
      
      if (matches.length === 0) continue
      
      // Создаем карту позиций для сопоставления нормализованного и исходного текста
      const positionMap = createPositionMap(result)
      
      // Удаляем найденные слова из исходного текста (с конца к началу)
      for (let i = matches.length - 1; i >= 0; i--) {
        const { start, end } = matches[i]
        
        // Находим соответствующие позиции в исходном тексте через карту позиций
        if (positionMap[start] === undefined || positionMap[end - 1] === undefined) continue
        
        const origStart = positionMap[start]
        const origEnd = positionMap[end - 1] + 1
        
        // Расширяем границы, чтобы включить разделители (но НЕ пробелы)
        let actualStart = origStart
        let actualEnd = origEnd
        
        // Ищем начало слова (может быть разделитель перед ним, но НЕ пробел)
        while (actualStart > 0) {
          const char = result[actualStart - 1]
          if (char === ' ') {
            // Останавливаемся на пробеле - пробелы НЕ удаляем
            break
          }
          if (!/[а-яёa-z]/i.test(char)) {
            actualStart--
          } else {
            break
          }
        }
        
        // Ищем конец слова (может быть разделитель после него, но НЕ пробел)
        while (actualEnd < result.length) {
          const char = result[actualEnd]
          if (char === ' ') {
            // Останавливаемся на пробеле - пробелы НЕ удаляем
            break
          }
          if (!/[а-яёa-z]/i.test(char)) {
            actualEnd++
          } else {
            break
          }
        }
        
        // Удаляем найденный фрагмент, НЕ трогая пробелы вокруг
        if (actualEnd > actualStart) {
          // Проверяем символы вокруг удаляемого фрагмента
          const beforeChar = actualStart > 0 ? result[actualStart - 1] : ''
          const afterChar = actualEnd < result.length ? result[actualEnd] : ''
          
          // Удаляем только сам фрагмент, пробелы оставляем
          let newStart = actualStart
          let newEnd = actualEnd
          
          // Если перед и после удаляемого фрагмента пробелы, удаляем один из них
          // чтобы не было двойного пробела после удаления
          if (beforeChar === ' ' && afterChar === ' ') {
            // Удаляем один пробел (перед фрагментом), чтобы не было двойного пробела
            newStart = actualStart - 1
          }
          
          result = result.substring(0, newStart) + result.substring(newEnd)
          changed = true
        }
      }
    }
  }
  
  return result
}

