exports.pack = (length, numbers) => {
  const string = numbers.map(e => lpad(e.toString(2), "0", length)).join('')

  return Array.from({length: string.length/8}, (v, i) => {
    const from = i * 8
    const to = from + 8
    const bin = string.slice(from, to)
    const hex = parseInt(bin, 2).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function repeat(str, num) {
  if (str.length === 0 || num <= 1) {
    if (num === 1) {
      return str;
    }

    return '';
  }

  let result = '';
  let pattern = str;

  while (num > 0) {
    if (num & 1) {
      result += pattern;
    }

    num >>=  1;
    pattern += pattern;
  }

  return result;
}

function lpad(obj, str, num) {
  return repeat(str, num - obj.length) + obj;
}

exports.lpad = lpad
