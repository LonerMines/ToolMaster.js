### Документация для библиотеки ToolMaster.js  
**Версия 4.2.0**  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Оглавление
1. [Введение](#введение)
2. [Установка](#установка)
3. [Основные функции](#основные-функции)
   - [Манипуляции с данными](#манипуляции-с-данными)
   - [Работа с функциями](#работа-с-функциями)
   - [Асинхронные операции](#асинхронные-операции)
   - [Строковые операции](#строковые-операции)
   - [Работа с объектами](#работа-с-объектами)
   - [Работа с массивами](#работа-с-массивами)
   - [Дата и время](#дата-и-время)
   - [DOM-утилиты](#dom-утилиты)
   - [Хранилища](#хранилища)
   - [Валидация](#валидация)
   - [Криптография](#криптография)
   - [Математика](#математика)
4. [Система событий](#система-событий)
5. [Плагины](#плагины)
6. [Расширение библиотеки](#расширение-библиотеки)

---

## Введение
**ToolMaster.js** - универсальная библиотека JavaScript, содержащая более 50 функций для решения широкого спектра задач. Поддерживает браузеры и Node.js, не имеет зависимостей.

```javascript
// Инициализация
const tm = ToolMaster;
console.log(tm.VERSION); // 4.2.0
```

---

## Установка
### Браузер
```html
<script src="https://cdn.jsdelivr.net/gh/LonerMines/ToolMaster.js@main/Code%20main/ToolMaster%404.2.0.js"></script>
<script>
  const tm = ToolMaster;
  tm.uuid(); // Генерация UUID
</script>
```

### Node.js (в будущем)
```bash
npm install toolmaster-js
```
```javascript
const tm = require('toolmaster-js');
```

---

## Основные функции

### Манипуляции с данными
#### `clone(data)`
Глубокое клонирование объектов/массивов.
```javascript
const obj = { a: 1, b: { c: 2 } };
const cloned = tm.clone(obj);
obj.b.c = 3;
console.log(cloned.b.c); // 2
```

#### `merge(...objects)`
Глубокое слияние объектов.
```javascript
const base = { theme: 'dark', sizes: { sm: 12 } };
const user = { sizes: { md: 24 }, colors: ['red'] };
const merged = tm.merge(base, user);
// { theme: 'dark', sizes: { sm:12, md:24 }, colors: ['red'] }
```

---

### Работа с функциями
#### `debounce(fn, delay, immediate)`
Оптимизация частых вызовов функций.
```javascript
const search = tm.debounce((query) => {
  console.log(`Searching: ${query}`);
}, 300);

search("a"); // Отменён
search("ab"); // Отменён
search("abc"); // Выполнится через 300мс
```

#### `memoize(fn)`
Кэширование результатов функций.
```javascript
const factorial = tm.memoize((n) => {
  return n <= 1 ? 1 : n * factorial(n - 1);
});

factorial(5); // Вычисление
factorial(5); // Результат из кэша
```

---

### Асинхронные операции
#### `retry(fn, retries, delay)`
Повторная попытка выполнения с экспоненциальной задержкой.
```javascript
tm.retry(() => fetch('/api/data'), 3, 1000)
  .then(data => console.log(data))
  .catch(err => console.error('Failed after 3 attempts'));
```

#### `parallel(tasks, concurrency)`
Параллельное выполнение с ограничением.
```javascript
const tasks = [
  () => fetch('/api/users'),
  () => fetch('/api/posts'),
  () => fetch('/api/comments')
];

tm.parallel(tasks, 2) // Макс. 2 параллельных запроса
  .then(results => console.log(results));
```

---

### Строковые операции
#### `uuid()`
Генерация UUID v4.
```javascript
console.log(tm.uuid()); // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

#### `randomString(length, charset)`
Случайная строка.
```javascript
tm.randomString(8); // 'A3dFg7Hk'
tm.randomString(6, '0123456789'); // '384726'
```

---

### Работа с объектами
#### `deepEqual(a, b)`
Глубокое сравнение объектов.
```javascript
const a = { x: { y: 1 } };
const b = { x: { y: 1 } };
console.log(tm.deepEqual(a, b)); // true
```

#### `objectDiff(oldObj, newObj)`
Поиск различий между объектами.
```javascript
const diff = tm.objectDiff(
  { name: 'Alex', age: 30 },
  { name: 'Alex', age: 31 }
);
// { age: 31 }
```

---

### Работа с массивами
#### `shuffle(array)`
Перемешивание массива (Fisher-Yates).
```javascript
tm.shuffle([1, 2, 3, 4]); // [3, 1, 4, 2]
```

#### `chunk(array, size)`
Разделение массива на части.
```javascript
tm.chunk([1, 2, 3, 4, 5], 2); // [[1,2], [3,4], [5]]
```

---

### Дата и время
#### `formatDate(date, format)`
Форматирование даты.
```javascript
tm.formatDate(new Date(), 'DD.MM.YYYY HH:mm'); // '06.07.2025 14:30'
```

#### `timeDiff(start, end)`
Разница между датами.
```javascript
const start = new Date(2025, 6, 1);
const diff = tm.timeDiff(start);
console.log(diff.days); // Количество дней с 1 июля
```

---

### DOM-утилиты
#### `$(selector, scope)` и `$$(selector, scope)`
Поиск элементов.
```javascript
tm.$('#submit-btn').addEventListener('click', ...);
tm.$$('.item').forEach(el => ...);
```

#### `createElement(tag, attributes, content)`
Создание элементов.
```javascript
const button = tm.createElement('button', {
  class: 'btn',
  onclick: () => alert('Clicked!')
}, 'Submit');
```

---

### Хранилища
#### `setLocal(key, value, ttl)`
LocalStorage с истечением срока.
```javascript
tm.setLocal('user_token', 'abc123', 3600); // Удалится через 1 час
```

#### `getLocal(key)`
Получение данных с проверкой срока.
```javascript
const token = tm.getLocal('user_token');
```

---

### Валидация
#### `isEmail(email)`
Проверка email.
```javascript
tm.isEmail('test@example.com'); // true
```

#### `validate(data, schema)`
Валидация по схеме.
```javascript
const schema = {
  email: { type: 'string', required: true, pattern: /@/ },
  age: { type: 'number', min: 18 }
};

const result = tm.validate({ email: 'test', age: 16 }, schema);
console.log(result.errors);
// { email: 'is invalid', age: 'must be at least 18' }
```

---

### Криптография
#### `hash(str)`
Простая хеш-функция.
```javascript
tm.hash('password123'); // '1a79a4d60de6718e8'
```

#### `hmac(message, secret)`
HMAC-подпись (работает в браузере и Node.js).
```javascript
tm.hmac('data', 'secret').then(signature => {
  console.log(signature); // 'a7d33b7c...'
});
```

---

### Математика
#### `random(min, max, integer)`
Случайное число.
```javascript
tm.random(5, 10); // 7.324
tm.random(1, 100, true); // 42
```

#### `clamp(value, min, max)`
Ограничение значения.
```javascript
tm.clamp(150, 0, 100); // 100
```

---

## Система событий
Встроенная шина событий для коммуникации между компонентами.

```javascript
// Подписка на событие
tm.events.on('user:login', (user) => {
  console.log(`User logged in: ${user.name}`);
});

// Генерация события
tm.events.emit('user:login', { name: 'Alex' });

// Одноразовая подписка
tm.events.once('app:loaded', () => {
  console.log('App loaded!');
});
```

---

## Плагины
Модульная система расширения функциональности.

```javascript
// Регистрация плагина
tm.plugins.register('logger', {
  init() {
    console.log('Logger initialized');
  },
  log(message) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
});

// Использование плагина
tm.plugins.get('logger').log('Test message');

// Автоматическая инициализация при загрузке страницы
```

---

## Расширение библиотеки
Добавление пользовательских функций.

```javascript
// Расширение новым модулем
tm.extend({
  currency: {
    format(amount) {
      return amount.toFixed(2) + ' ₽';
    }
  }
});

// Использование
tm.currency.format(1500); // '1500.00 ₽'
```

---

## Производительность и безопасность
- **Оптимизация**: Все функции протестированы на производительность
- **Безопасность**: 
  - Автоматическая санитизация входных данных
  - Защита от XSS в DOM-функциях
- **Размер**: 
  - 15.7 KB (minified)
  - 5.2 KB (gzipped)

---

## Лицензия
MIT License. Бесплатное использование в коммерческих и некоммерческих проектах с указанием авторства.

```text
Copyright 2025 ToolMaster.js

Разрешено свободное использование, копирование, модификация и распространение 
для любых целей без ограничений.
```
