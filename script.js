const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

let display, calculator, currentInput = '', expression = '', operator = null, isScientific = false, isConversion = false, theme = 'dark', memorySlots = {};

if (isBrowser) {
  display = document.getElementById('display');
  calculator = document.getElementById('calculator');
  if (typeof localStorage !== 'undefined') {
    try {
      theme = localStorage.getItem('theme') || 'dark';
      memorySlots = JSON.parse(localStorage.getItem('memorySlots')) || {};
    } catch (e) {
      console.warn('localStorage access error:', e);
    }
  }
  if (theme === 'light') document.body.classList.add('light');
}

const conversionFactors = {
  currency: {
    units: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
    rates: {
      'USD-USD': 1,
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110,
      'USD-INR': 83,
      'EUR-USD': 1.18,
      'EUR-EUR': 1,
      'EUR-GBP': 0.86,
      'EUR-JPY': 129,
      'EUR-INR': 91,
      'GBP-USD': 1.37,
      'GBP-EUR': 1.16,
      'GBP-GBP': 1,
      'GBP-JPY': 150,
      'GBP-INR': 106,
      'JPY-USD': 0.0091,
      'JPY-EUR': 0.0078,
      'JPY-GBP': 0.0067,
      'JPY-JPY': 1,
      'JPY-INR': 0.75,
      'INR-USD': 0.012,
      'INR-EUR': 0.011,
      'INR-GBP': 0.0094,
      'INR-JPY': 1.33,
      'INR-INR': 1
    }
  },
  area: {
    units: ['m²', 'km²', 'ft²', 'acre'],
    rates: {
      'm²-m²': 1,
      'm²-km²': 1e-6,
      'm²-ft²': 10.7639,
      'm²-acre': 0.000247105,
      'km²-m²': 1e6,
      'km²-km²': 1,
      'km²-ft²': 1.076e7,
      'km²-acre': 247.105,
      'ft²-m²': 0.092903,
      'ft²-km²': 9.2903e-8,
      'ft²-ft²': 1,
      'ft²-acre': 2.2957e-5,
      'acre-m²': 4046.86,
      'acre-km²': 0.00404686,
      'acre-ft²': 43560,
      'acre-acre': 1
    }
  },
  data: {
    units: ['KB', 'MB', 'GB', 'TB'],
    rates: {
      'KB-KB': 1,
      'KB-MB': 1/1024,
      'KB-GB': 1/(1024*1024),
      'KB-TB': 1/(1024*1024*1024),
      'MB-KB': 1024,
      'MB-MB': 1,
      'MB-GB': 1/1024,
      'MB-TB': 1/(1024*1024),
      'GB-KB': 1024*1024,
      'GB-MB': 1024,
      'GB-GB': 1,
      'GB-TB': 1/1024,
      'TB-KB': 1024*1024*1024,
      'TB-MB': 1024*1024,
      'TB-GB': 1024,
      'TB-TB': 1
    }
  },
  speed: {
    units: ['m/s', 'km/h', 'mph'],
    rates: {
      'm/s-m/s': 1,
      'm/s-km/h': 3.6,
      'm/s-mph': 2.23694,
      'km/h-m/s': 0.277778,
      'km/h-km/h': 1,
      'km/h-mph': 0.621371,
      'mph-m/s': 0.44704,
      'mph-km/h': 1.60934,
      'mph-mph': 1
    }
  },
  temperature: {
    units: ['°C', '°F', 'K'],
    convert: {
      '°C-°F': (x) => (x * 9/5) + 32,
      '°C-K': (x) => x + 273.15,
      '°F-°C': (x) => (x - 32) * 5/9,
      '°F-K': (x) => ((x - 32) * 5/9) + 273.15,
      'K-°C': (x) => x - 273.15,
      'K-°F': (x) => ((x - 273.15) * 9/5) + 32,
      '°C-°C': (x) => x,
      '°F-°F': (x) => x,
      'K-K': (x) => x
    }
  },
  time: {
    units: ['s', 'min', 'h', 'd'],
    rates: {
      's-s': 1,
      's-min': 1/60,
      's-h': 1/3600,
      's-d': 1/(3600*24),
      'min-s': 60,
      'min-min': 1,
      'min-h': 1/60,
      'min-d': 1/(60*24),
      'h-s': 3600,
      'h-min': 60,
      'h-h': 1,
      'h-d': 1/24,
      'd-s': 3600*24,
      'd-min': 60*24,
      'd-h': 24,
      'd-d': 1
    }
  },
  volume: {
    units: ['L', 'mL', 'gal', 'fl oz'],
    rates: {
      'L-L': 1,
      'L-mL': 1000,
      'L-gal': 0.264172,
      'L-fl oz': 33.814,
      'mL-L': 0.001,
      'mL-mL': 1,
      'mL-gal': 0.000264172,
      'mL-fl oz': 0.033814,
      'gal-L': 3.78541,
      'gal-mL': 3785.41,
      'gal-gal': 1,
      'gal-fl oz': 128,
      'fl oz-L': 0.0295735,
      'fl oz-mL': 29.5735,
      'fl oz-gal': 0.0078125,
      'fl oz-fl oz': 1
    }
  },
  weight: {
    units: ['g', 'kg', 'lb', 'oz'],
    rates: {
      'g-g': 1,
      'g-kg': 0.001,
      'g-lb': 0.00220462,
      'g-oz': 0.035274,
      'kg-g': 1000,
      'kg-kg': 1,
      'kg-lb': 2.20462,
      'kg-oz': 35.274,
      'lb-g': 453.592,
      'lb-kg': 0.453592,
      'lb-lb': 1,
      'lb-oz': 16,
      'oz-g': 28.3495,
      'oz-kg': 0.0283495,
      'oz-lb': 0.0625,
      'oz-oz': 1
    }
  }
};

function updateDisplay() {
  if (!isBrowser) return;
  try {
    if (isConversion) {
      const input = document.getElementById('input-value').value;
      const result = document.getElementById('result-value').value;
      const fromUnit = document.getElementById('from-unit').value;
      const toUnit = document.getElementById('to-unit').value;
      display.textContent = input ? `${input} ${fromUnit} = ${result} ${toUnit}` : '0';
    } else {
      const symbolMap = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        ',': ''
      };
      let displayText = expression;
      for (const [op, symbol] of Object.entries(symbolMap)) {
        displayText = displayText.replaceAll(op, symbol);
      }
      displayText = displayText.replace(/(\d{1,3}(,\d{3})*(\.\d*)?)/g, (match) =>
        parseFloat(match.replace(/,/g, '')).toLocaleString('en-US', { maximumFractionDigits: 10 })
      );
      display.textContent = displayText || '0';
    }
  } catch (e) {
    display.textContent = 'Error';
  }
}

function appendNumber(num) {
  if (!isConversion) {
    if (num === '.' && currentInput.includes('.')) return;
    currentInput += num;
    expression += num;
    updateDisplay();
    removeOperatorHighlight();
  }
}

function appendComma(comma) {
  if (!isConversion && currentInput && !currentInput.includes(',')) {
    expression += comma;
    currentInput += comma;
    updateDisplay();
  }
}

function inputBracket(bracket) {
  if (!isConversion) {
    currentInput += bracket;
    expression += bracket;
    updateDisplay();
  }
}

function inputConstant(constant) {
  if (!isConversion) {
    const constants = {
      'pi': Math.PI.toString(),
      'e': Math.E.toString()
    };
    currentInput = constants[constant];
    expression += constant;
    updateDisplay();
  }
}

function clearDisplay() {
  if (!isBrowser) return;
  if (isConversion) {
    document.getElementById('input-value').value = '';
    document.getElementById('result-value').value = '';
  } else {
    currentInput = '';
    expression = '';
    operator = null;
  }
  updateDisplay();
  removeOperatorHighlight();
}

function toggleSign() {
  if (!isConversion && currentInput) {
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
      expression = expression.replace(/^-/, '');
    } else {
      currentInput = '-' + currentInput;
      expression = '-' + expression;
    }
    updateDisplay();
  }
}

function toggleConversion() {
  if (!isBrowser) return;
  isConversion = !isConversion;
  console.log('Toggling mode: isConversion =', isConversion);
  document.getElementById('basic-buttons').style.display = isConversion ? 'none' : 'grid';
  document.getElementById('scientific-buttons').style.display = isConversion || !isScientific ? 'none' : 'grid';
  document.getElementById('conversion-panel').classList.toggle('active', isConversion);
  document.getElementById('conversionToggle').textContent = isConversion ? '🧮' : '↔';
  calculator.classList.toggle('conversion-mode', isConversion);
  if (isConversion) {
    currentInput = '';
    expression = '';
    updateUnits();
    convert();
  } else {
    document.getElementById('input-value').value = '';
    document.getElementById('result-value').value = '';
    updateDisplay();
  }
}

function updateUnits() {
  if (!isBrowser) return;
  const category = document.getElementById('category-select').value;
  const fromSelect = document.getElementById('from-unit');
  const toSelect = document.getElementById('to-unit');
  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';
  conversionFactors[category].units.forEach(unit => {
    const option1 = document.createElement('option');
    option1.value = unit;
    option1.textContent = unit;
    fromSelect.appendChild(option1);
    const option2 = document.createElement('option');
    option2.value = unit;
    option2.textContent = unit;
    toSelect.appendChild(option2);
  });
  toSelect.value = conversionFactors[category].units[1] || conversionFactors[category].units[0];
  convert();
}

function swapUnits() {
  if (!isBrowser) return;
  const fromSelect = document.getElementById('from-unit');
  const toSelect = document.getElementById('to-unit');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convert();
}

function convert() {
  if (!isBrowser) return;
  const category = document.getElementById('category-select').value;
  const fromUnit = document.getElementById('from-unit').value;
  const toUnit = document.getElementById('to-unit').value;
  const input = parseFloat(document.getElementById('input-value').value);
  let result = '';
  if (!isNaN(input)) {
    if (category === 'temperature') {
      const convertFn = conversionFactors[category].convert[`${fromUnit}-${toUnit}`];
      result = convertFn ? convertFn(input).toFixed(2) : input.toFixed(2);
    } else {
      const rate = conversionFactors[category].rates[`${fromUnit}-${toUnit}`];
      result = rate ? (input * rate).toFixed(2) : input.toFixed(2);
    }
  }
  document.getElementById('result-value').value = result;
  updateDisplay();
}

function inputOperator(op) {
  if (!isConversion && currentInput) {
    operator = op;
    expression += op;
    currentInput = '';
    updateDisplay();
    highlightOperator(op);
  }
}

function backspace() {
  if (!isConversion && expression) {
    const funcPrefixes = [
      'sqrt(', 'cbrt(', 'square(', 'cube(', 'sin(', 'cos(', 'tan(',
      'asin(', 'acos(', 'log(', 'ln(', 'log2(', 'abs(', 'exp(',
      'pow(10,', 'pow(', 'factorial(', 'mod(', 'round('
    ];
    let removed = false;
    for (const prefix of funcPrefixes) {
      if (expression.endsWith(prefix)) {
        expression = expression.slice(0, -prefix.length);
        currentInput = '';
        removed = true;
        break;
      }
    }
    if (!removed) {
      expression = expression.slice(0, -1);
      const lastSegment = expression.split(/[\+\-\*\/\(\),]/).pop();
      currentInput = lastSegment || '';
    }
    updateDisplay();
    removeOperatorHighlight();
  }
}

function calculate() {
  if (!isBrowser) return;
  if (isConversion) {
    const input = document.getElementById('input-value').value;
    const result = document.getElementById('result-value').value;
    const fromUnit = document.getElementById('from-unit').value;
    const toUnit = document.getElementById('to-unit').value;
    if (input && result) {
      addToHistory(`${input} ${fromUnit} = ${result} ${toUnit}`);
    }
  } else {
    try {
      if (!expression) return;
      let normalizedExpression = expression.replace(/,/g, '');
      const funcPrefixes = [
        'sqrt(', 'cbrt(', 'square(', 'cube(', 'sin(', 'cos(', 'tan(',
        'asin(', 'acos(', 'log(', 'ln(', 'log2(', 'abs(', 'exp(',
        'pow(10,', 'pow(', 'factorial(', 'mod(', 'round('
      ];
      for (const prefix of funcPrefixes) {
        if (normalizedExpression.includes(prefix) && !normalizedExpression.endsWith(')')) {
          const openCount = (normalizedExpression.match(/\(/g) || []).length;
          const closeCount = (normalizedExpression.match(/\)/g) || []).length;
          if (openCount > closeCount) {
            normalizedExpression += ')'.repeat(openCount - closeCount);
          }
        }
      }
      let result = math.evaluate(normalizedExpression);
      if (result === Infinity || isNaN(result)) throw new Error('Math Error');
      result = Number(result.toFixed(10));
      addToHistory(`${expression.replaceAll('*', '×').replaceAll('/', '÷').replaceAll('-', '−').replaceAll(',', '')} = ${result}`);
      currentInput = result.toString();
      expression = result.toString();
      operator = null;
      updateDisplay();
      removeOperatorHighlight();
    } catch (e) {
      expression = 'Error';
      currentInput = '';
      updateDisplay();
    }
  }
}

function scientific(func) {
  if (!isConversion) {
    try {
      if (!currentInput) {
        const funcMap = {
          'sqrt': 'sqrt(',
          'cbrt': 'cbrt(',
          'square': 'square(',
          'cube': 'cube(',
          'reciprocal': '1/(',
          'sin': 'sin(',
          'cos': 'cos(',
          'tan': 'tan(',
          'asin': 'asin(',
          'acos': 'acos(',
          'log': 'log(',
          'ln': 'ln(',
          'log2': 'log2(',
          'logn': 'log(',
          'abs': 'abs(',
          'exp': 'exp(',
          'pow10': 'pow(10,',
          'pow': 'pow(',
          'degToRad': '(',
          'radToDeg': '(',
          'factorial': 'factorial(',
          'mod': 'mod(',
          'round': 'round('
        };
        if (funcMap[func]) {
          expression += funcMap[func];
          currentInput = '';
          updateDisplay();
          return;
        }
      }
      let value = parseFloat(currentInput);
      let result;
      let historyEntry = '';
      switch (func) {
        case 'sqrt':
          result = Math.sqrt(value);
          historyEntry = `√(${value})`;
          break;
        case 'cbrt':
          result = Math.cbrt(value);
          historyEntry = `∴(${value})`;
          break;
        case 'square':
          result = value * value;
          historyEntry = `(${value})²`;
          break;
        case 'cube':
          result = value * value * value;
          historyEntry = `(${value})³`;
          break;
        case 'reciprocal':
          result = 1 / value;
          historyEntry = `1/(${value})`;
          break;
        case 'sin':
          result = Math.sin(value);
          historyEntry = `sin(${value})`;
          break;
        case 'cos':
          result = Math.cos(value);
          historyEntry = `cos(${value})`;
          break;
        case 'tan':
          result = Math.tan(value);
          historyEntry = `tan(${value})`;
          break;
        case 'asin':
          result = Math.asin(value);
          historyEntry = `sin⁻¹(${value})`;
          break;
        case 'acos':
          result = Math.acos(value);
          historyEntry = `cos⁻¹(${value})`;
          break;
        case 'log':
          result = Math.log10(value);
          historyEntry = `log₁₀(${value})`;
          break;
        case 'ln':
          result = Math.log(value);
          historyEntry = `ln(${value})`;
          break;
        case 'log2':
          result = Math.log2(value);
          historyEntry = `log₂(${value})`;
          break;
        case 'logn':
          const base = parseFloat(isBrowser ? prompt('Enter log base:') : '');
          result = Math.log(value) / Math.log(base);
          historyEntry = `log_${base}(${value})`;
          break;
        case 'abs':
          result = Math.abs(value);
          historyEntry = `|${value}|`;
          break;
        case 'exp':
          result = Math.exp(value);
          historyEntry = `e^(${value})`;
          break;
        case 'pow10':
          result = Math.pow(10, value);
          historyEntry = `10^(${value})`;
          break;
        case 'pow':
          const exponent = parseFloat(isBrowser ? prompt('Enter exponent:') : '');
          result = Math.pow(value, exponent);
          historyEntry = `(${value})^${exponent}`;
          break;
        case 'degToRad':
          result = value * (Math.PI / 180);
          historyEntry = `${value}°→rad`;
          break;
        case 'radToDeg':
          result = value * (180 / Math.PI);
          historyEntry = `${value}rad→°`;
          break;
        case 'factorial':
          result = math.factorial(Math.floor(value));
          historyEntry = `${value}!`;
          break;
        case 'mod':
          const divisor = parseFloat(isBrowser ? prompt('Enter divisor:') : '');
          result = value % divisor;
          historyEntry = `${value} mod ${divisor}`;
          break;
        case 'round':
          result = Math.round(value);
          historyEntry = `round(${value})`;
          break;
        default:
          return;
      }
      if (isNaN(result) || result === Infinity) throw new Error('Math Error');
      addToHistory(`${historyEntry} = ${result}`);
      currentInput = result.toString();
      expression = result.toString();
      updateDisplay();
    } catch (e) {
      expression = 'Error';
      currentInput = '';
      updateDisplay();
    }
  }
}

function memoryOperation(op) {
  if (!isConversion) {
    const slot = isBrowser ? prompt('Enter memory slot (1-9):') : '';
    if (!/^[1-9]$/.test(slot)) return;
    switch (op) {
      case 'store':
        memorySlots[slot] = parseFloat(currentInput);
        if (isBrowser && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('memorySlots', JSON.stringify(memorySlots));
          } catch (e) {
            console.warn('localStorage access error:', e);
          }
        }
        break;
      case 'recall':
        if (memorySlots[slot]) {
          currentInput = memorySlots[slot].toString();
          expression = currentInput;
          updateDisplay();
        }
        break;
      case 'clear':
        delete memorySlots[slot];
        if (isBrowser && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('memorySlots', JSON.stringify(memorySlots));
          } catch (e) {
            console.warn('localStorage access error:', e);
          }
        }
        break;
    }
  }
}

function addToHistory(entry) {
  if (!isBrowser) return;
  let list = document.getElementById('historyList');
  let li = document.createElement('li');
  li.textContent = entry;
  li.onclick = () => {
    if (isConversion) {
      const [value, unit] = entry.split('=')[0].trim().split(' ');
      document.getElementById('input-value').value = value;
      convert();
    } else {
      currentInput = entry.split('=')[1].trim();
      expression = currentInput;
      updateDisplay();
    }
  };
  list.insertBefore(li, list.firstChild);
  let history = [];
  if (typeof sessionStorage !== 'undefined') {
    try {
      history = JSON.parse(sessionStorage.getItem('history') || '[]');
    } catch (e) {
      console.warn('sessionStorage access error:', e);
    }
  }
  history.unshift(entry);
  if (history.length > 50) history.pop();
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem('history', JSON.stringify(history));
    } catch (e) {
      console.warn('sessionStorage access error:', e);
    }
  }
}

function loadHistory() {
  if (!isBrowser) return;
  let list = document.getElementById('historyList');
  let history = [];
  if (typeof sessionStorage !== 'undefined') {
    try {
      history = JSON.parse(sessionStorage.getItem('history') || '[]');
    } catch (e) {
      console.warn('sessionStorage access error:', e);
    }
  }
  list.innerHTML = '';
  history.forEach(entry => {
    let li = document.createElement('li');
    li.textContent = entry;
    li.onclick = () => {
      if (isConversion) {
        const [value, unit] = entry.split('=')[0].trim().split(' ');
        document.getElementById('input-value').value = value;
        convert();
      } else {
        currentInput = entry.split('=')[1].trim();
        expression = currentInput;
        updateDisplay();
      }
    };
    list.appendChild(li);
  });
}

function clearHistory() {
  if (!isBrowser) return;
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('history');
    } catch (e) {
      console.warn('sessionStorage access error:', e);
    }
  }
  document.getElementById('historyList').innerHTML = '';
}

function copyHistory() {
  if (!isBrowser) return;
  let history = [];
  if (typeof sessionStorage !== 'undefined') {
    try {
      history = JSON.parse(sessionStorage.getItem('history') || '[]');
      navigator.clipboard.writeText(history.join('\n'));
    } catch (e) {
      console.warn('sessionStorage or clipboard access error:', e);
    }
  }
}

function highlightOperator(op) {
  if (!isBrowser || !isConversion) return;
  removeOperatorHighlight();
  const map = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
  };
  const symbol = map[op];
  const buttons = document.querySelectorAll('.btn-orange');
  buttons.forEach(btn => {
    if (btn.textContent === symbol) {
      btn.classList.add('active-operator');
    }
  });
}

function removeOperatorHighlight() {
  if (!isBrowser) return;
  document.querySelectorAll('.btn-orange').forEach(btn =>
    btn.classList.remove('active-operator')
  );
}

if (isBrowser) {
  const modeToggle = document.getElementById('modeToggle');
  const themeToggle = document.getElementById('themeToggle');
  const conversionToggle = document.getElementById('conversionToggle');

  if (modeToggle) {
    modeToggle.onclick = () => {
      if (!isConversion) {
        isScientific = !isScientific;
        document.getElementById('scientific-buttons').style.display = isScientific ? 'grid' : 'none';
      }
    };
  }

  if (themeToggle) {
    themeToggle.onclick = () => {
      document.body.classList.toggle('light');
      theme = document.body.classList.contains('light') ? 'light' : 'dark';
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('theme', theme);
        } catch (e) {
          console.warn('localStorage access error:', e);
        }
      }
    };
  }

  if (conversionToggle) {
    conversionToggle.onclick = toggleConversion;
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateUnits();
  });

  document.addEventListener('keydown', function (event) {
    const key = event.key;
    const keyMap = {
      's': 'sin', 'c': 'cos', 't': 'tan',
      'l': 'log', 'n': 'ln', 'q': 'sqrt',
      'p': 'pi', 'e': 'e'
    };

    if (!isConversion) {
      if (!isNaN(key)) appendNumber(key);
      else if (['+', '-', '*', '/'].includes(key)) inputOperator(key);
      else if (key === 'Enter' || key === '=') calculate();
      else if (key === 'Escape') clearDisplay();
      else if (key === '.') appendNumber('.');
      else if (key === ',') appendComma(',');
      else if (key === '(' || key === ')') inputBracket(key);
      else if (key === 'Backspace') backspace();
      else if (key === '~') toggleSign();
      else if (keyMap[key]) {
        if (keyMap[key] === 'pi' || keyMap[key] === 'e') {
          inputConstant(keyMap[key]);
        } else {
          scientific(keyMap[key]);
        }
      }
    }
  });
}