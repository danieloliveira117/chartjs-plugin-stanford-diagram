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

// log$1
export function scaleLog() {
    const scale = loggish(transformerLog()).domain([1, 10]);

    scale.copy = function () {
        return copy(scale, scaleLog()).base(scale.base());
    };

    initRange.apply(scale, arguments);

    return scale;
}

const unit = [0, 1];
const arrayPrototype = Array.prototype;

const map = arrayPrototype.map;
const slice = arrayPrototype.slice;

function getPositiveNumber(x) {
    return +x;
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
    return function (x) {
        return -f(-x);
    };
}

function normalize(a, b) {
    return (b -= (a = +a))
        ? function (x) {
            return (x - a) / b;
        }
        : defaultFunction(isNaN(b) ? NaN : 0.5);
}

function pow10(x) {
    return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function initRange(domain, range) {
    switch (arguments.length) {
        case 0:
            break;
        case 1:
            this.range(domain);
            break;
        default:
            this.range(range).domain(domain);
            break;
    }

    return this;
}

function powp(base) {
    return base === 10 ? pow10
        : base === Math.E ? Math.exp
            : function (x) {
                return Math.pow(base, x);
            };
}

function logp(base) {
    return base === Math.E ? Math.log
        : base === 10 && Math.log10
        || base === 2 && Math.log2
        || (base = Math.log(base), function (x) {
            return Math.log(x) / base;
        });
}

function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
        if (k in a) {
            i[k] = interpolateValue(a[k], b[k]);
        } else {
            c[k] = b[k];
        }
    }

    return function (t) {
        for (k in i) c[k] = i[k](t);
        return c;
    };
}

function interpolateNumber(a, b) {
    return a = +a, b -= a, function (t) {
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
    return b == null || t === "boolean" ? defaultFunction(b)
        : (t === "number" ? interpolateNumber
            : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
                : interpolateNumber)(a, b);
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

    scale.domain = function (_) {
        return arguments.length ? (t0 = transform(x0 = +_[0]), t1 = transform(x1 = +_[1]), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
    };

    scale.interpolator = function (_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
    };

    return function (t) {
        transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
        return scale;
    };
}

function transformerLog() {
    let domain = unit,
        range = unit,
        interpolate$$1 = interpolateValue,
        transform,
        untransform,
        unknown,
        clamp = defaultFunction,
        piecewise$$1,
        output,
        input;

    function rescale() {
        piecewise$$1 = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
        output = input = null;
        return scale;
    }

    function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise$$1(domain.map(transform), range, interpolate$$1)))(transform(clamp(x)));
    }

    scale.domain = function (_) {
        return arguments.length ? (domain = map.call(_, getPositiveNumber), clamp === defaultFunction || (clamp = clamper(domain)), rescale()) : domain.slice();
    };

    scale.range = function (_) {
        return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
    };


    scale.interpolate = function (_) {
        return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
    };

    return function (t, u) {
        transform = t, untransform = u;
        return rescale();
    };
}

function bimap(domain, range, interpolate$$1) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate$$1(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate$$1(r0, r1);
    return function (x) {
        return r0(d0(x));
    };
}

function polymap(domain, range, interpolate$$1) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
    }

    while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate$$1(range[i], range[i + 1]);
    }

    return function (x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
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
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
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

    scale.base = function (_) {
        return arguments.length ? (base = +_, rescale()) : base;
    };

    scale.domain = function (_) {
        return arguments.length ? (domain(_), rescale()) : domain();
    };

    scale.ticks = function (count) {
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

    scale.tickFormat = function (count, specifier) {
        if (specifier == null) specifier = base === 10 ? ".0e" : ",";
        if (typeof specifier !== "function") specifier = exports.format(specifier);
        if (count === Infinity) return specifier;
        if (count == null) count = 10;
        var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
        return function (d) {
            var i = d / pows(Math.round(logs(d)));
            if (i * base < base - 0.5) i *= base;
            return i <= k ? specifier(d) : "";
        };
    };

    scale.nice = function () {
        return domain(nice(domain(), {
            floor: function (x) {
                return pows(Math.floor(logs(x)));
            },
            ceil: function (x) {
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
