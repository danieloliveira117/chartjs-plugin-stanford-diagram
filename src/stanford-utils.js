/* eslint-disable */
/**
 * Assumes h, s, and l are contained in the set [0, 1]
 * thanks to https://codepen.io/anon/pen/ZPqQdM
 *
 * @param a
 * @param b
 * @param o
 * @returns {String}
 */
export function interpolateHSL(a, b, o) {
  const len = a.length;
  const hsl = Array(len);

  if (o > 1) {
    o = 1;
  } else if (o < 0) {
    o = 0;
  }

  for (let i = 0; i < len; i++) {
    const a1 = a[i];
    hsl[i] = a1 + (b[i] - a1) * o;
  }

  return hslToRgb(hsl[0], hsl[1], hsl[2]);
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {String}          The RGB representation
 */
function hslToRgb(h, s, l) {
  let r;
  let g;
  let
    b;

  if (s === 0) { // achromatic
    r = l;
    g = l;
    b = l;
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// sequence
export function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
    n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
    range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

// sequential
export function scaleSequential() {
  const scale = defaultFunction(transformerLinear()(defaultFunction));

  return initInterpolator.apply(scale, arguments);
}


export function sequentialLog() {
  var scale = loggish(transformerLog()).domain([1, 10]);

  scale.copy = function() {
    return copy$1(scale, sequentialLog()).base(scale.base());
  };

  return initInterpolator.apply(scale, arguments);
}

function defaultFunction(x) {
  return x;
}

function transformLog(x) {
  return Math.log(x);
}

function transformExp(x) {
  return Math.exp(x);
}

function transformLogn(x) {
  return -Math.log(-x);
}

function transformExpn(x) {
  return -Math.exp(-x);
}

function reflect(f) {
  return function(x) {
    return -f(-x);
  };
}

function pow10(x) {
  return isFinite(x) ? +('1e' + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10 ? pow10 :
    base === Math.E ? Math.exp :
      function(x) {
        return Math.pow(base, x);
      };
}

function logp(base) {
  return base === Math.E ? Math.log :
    base === 10 && Math.log10 ||
    base === 2 && Math.log2 ||
    (base = Math.log(base), function(x) {
      return Math.log(x) / base;
    });
}

function object(a, b) {
  var i = {},
    c = {},
    k;

  if (a === null || typeof a !== 'object') a = {};
  if (b === null || typeof b !== 'object') b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolateValue(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

function interpolateNumber(a, b) {
  return a = +a, b -= a, function(t) {
    return a + b * t;
  };
}

function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.interpolator(domain);
      break;
    default:
      this.interpolator(interpolator).domain(domain);
      break;
  }

  return this;
}

function interpolateValue(a, b) {
  var t = typeof b, c;
  return b == null || t === 'boolean' ? defaultFunction(b) :
    (t === 'number' ? interpolateNumber :
      typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b) ? object :
        interpolateNumber)(a, b);
}

function transformerLinear() {
  let x0 = 0,
    x1 = 1,
    t0,
    t1,
    k10,
    transform,
    interpolator = defaultFunction,
    clamp = false,
    unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? (t0 = transform(x0 = +_[0]), t1 = transform(x1 = +_[1]), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}

function identity(x) {
  return x;
}

function transformerLog() {
  var x0 = 0,
    x1 = 1,
    t0,
    t1,
    k10,
    transform,
    interpolator = identity,
    clamp = false,
    unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}

function ticks(start, stop, count) {
  var reverse,
    i = -1,
    n,
    ticks,
    step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    start = Math.floor(start * step);
    stop = Math.ceil(stop * step);
    ticks = new Array(n = Math.ceil(start - stop + 1));
    while (++i < n) ticks[i] = (start - i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
    power = Math.floor(Math.log(step) / Math.LN10),
    error = step / Math.pow(10, power);
  return power >= 0 ?
    (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) :
    -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function loggish(transform) {
  var scale = transform(transformLog, transformExp),
    domain = scale.domain,
    base = 10,
    logs,
    pows;

  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }

  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.ticks = function(count) {
    var d = domain(),
      u = d[0],
      v = d[d.length - 1],
      r;

    if (r = v < u) i = u, u = v, v = i;

    var i = logs(u),
      j = logs(v),
      p,
      k,
      t,
      n = count == null ? 10 : +count,
      z = [];

    if (!(base % 1) && j - i < n) {
      i = Math.round(i) - 1, j = Math.round(j) + 1;
      if (u > 0) for (; i < j; ++i) {
        for (k = 1, p = pows(i); k < base; ++k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      } else for (; i < j; ++i) {
        for (k = base - 1, p = pows(i); k >= 1; --k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }

    return r ? z.reverse() : z;
  };

  scale.tickFormat = function(count, specifier) {
    if (specifier == null) specifier = base === 10 ? '.0e' : ',';
    if (typeof specifier !== 'function') specifier = exports.format(specifier);
    if (count === Infinity) return specifier;
    if (count == null) count = 10;
    var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
    return function(d) {
      var i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : '';
    };
  };

  scale.nice = function() {
    return domain(nice(domain(), {
      floor: function(x) {
        return pows(Math.floor(logs(x)));
      },
      ceil: function(x) {
        return pows(Math.ceil(logs(x)));
      }
    }));
  };

  return scale;
}

function nice(domain, interval) {
  domain = domain.slice();

  var i0 = 0,
    i1 = domain.length - 1,
    x0 = domain[i0],
    x1 = domain[i1],
    t;

  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }

  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}
