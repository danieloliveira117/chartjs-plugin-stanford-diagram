// exports.scaleSequentialLog = sequentialLog;
export function scaleSequentialLog() {
    var scale = loggish(transformer$2()).domain([1, 10]);

    scale.copy = function() {
        return copy$1(scale, scaleSequentialLog()).base(scale.base());
    };

    return initInterpolator.apply(scale, arguments);
}

// exports.scaleLinear = linear$2;
export function scaleLinear() {
    var scale = continuous(identity$6, identity$6);

    scale.copy = function() {
        return copy(scale, scaleLinear());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
}

// exports.range = sequence;
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

// exports.interpolatePlasma = plasma;
export var interpolatePlasma = ramp$1(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

// ------------------------

var array$3 = Array.prototype;

var map$2 = array$3.map;
var slice$5 = array$3.slice;
var unit = [0, 1];

function interpolateNumber(a, b) {
    return a = +a, b -= a, function(t) {
        return a + b * t;
    };
}

function number$2(x) {
    return +x;
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

    return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
    };
}

function interpolateValue(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$3(b)
        : (t === "number" ? interpolateNumber
            : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
                : b instanceof color ? interpolateRgb
                    : b instanceof Date ? date
                        : Array.isArray(b) ? array$1
                            : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
                                : interpolateNumber)(a, b);
}

function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain(),
            i0 = 0,
            i1 = d.length - 1,
            start = d[i0],
            stop = d[i1],
            step;

        if (stop < start) {
            step = start, start = stop, stop = step;
            step = i0, i0 = i1, i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
            step = tickIncrement(start, stop, count);
        } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
            step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
            d[i0] = Math.floor(start / step) * step;
            d[i1] = Math.ceil(stop / step) * step;
            domain(d);
        } else if (step < 0) {
            d[i0] = Math.ceil(start * step) / step;
            d[i1] = Math.floor(stop * step) / step;
            domain(d);
        }

        return scale;
    };

    return scale;
}

function initRange(domain, range) {
    switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
    }
    return this;
}

function constant$a(x) {
    return function() {
        return x;
    };
}

function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constant$a(isNaN(b) ? NaN : 0.5);
}

function bimap(domain, range, interpolate$$1) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate$$1(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate$$1(r0, r1);
    return function(x) { return r0(d0(x)); };
}


function transformer$1() {
    var domain = unit,
        range = unit,
        interpolate$$1 = interpolateValue,
        transform,
        untransform,
        unknown,
        clamp = identity$6,
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

    scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise$$1(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
        return arguments.length ? (domain = map$2.call(_, number$2), clamp === identity$6 || (clamp = clamper(domain)), rescale()) : domain.slice();
    };

    scale.range = function(_) {
        return arguments.length ? (range = slice$5.call(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
        return range = slice$5.call(_), interpolate$$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? clamper(domain) : identity$6, scale) : clamp !== identity$6;
    };

    scale.interpolate = function(_) {
        return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
    };

    scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
        transform = t, untransform = u;
        return rescale();
    };
}

function continuous(transform, untransform) {
    return transformer$1()(transform, untransform);
}

function colors(specifier) {
    var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
}

function ramp$1(range) {
    var n = range.length;
    return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
    };
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function initInterpolator(domain, interpolator) {
    switch (arguments.length) {
        case 0: break;
        case 1: this.interpolator(domain); break;
        default: this.interpolator(interpolator).domain(domain); break;
    }
    return this;
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


function logp(base) {
    return base === Math.E ? Math.log
        : base === 10 && Math.log10
        || base === 2 && Math.log2
        || (base = Math.log(base), function(x) { return Math.log(x) / base; });
}

function reflect(f) {
    return function(x) {
        return -f(-x);
    };
}

function pow10(x) {
    return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function powp(base) {
    return base === 10 ? pow10
        : base === Math.E ? Math.exp
            : function(x) { return Math.pow(base, x); };
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
        if (specifier == null) specifier = base === 10 ? ".0e" : ",";
        if (typeof specifier !== "function") specifier = exports.format(specifier);
        if (count === Infinity) return specifier;
        if (count == null) count = 10;
        var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
        return function(d) {
            var i = d / pows(Math.round(logs(d)));
            if (i * base < base - 0.5) i *= base;
            return i <= k ? specifier(d) : "";
        };
    };

    scale.nice = function() {
        return domain(nice(domain(), {
            floor: function(x) { return pows(Math.floor(logs(x))); },
            ceil: function(x) { return pows(Math.ceil(logs(x))); }
        }));
    };

    return scale;
}

function copy$1(source, target) {
    return target
        .domain(source.domain())
        .interpolator(source.interpolator())
        .clamp(source.clamp())
        .unknown(source.unknown());
}

function transformer$2() {
    var x0 = 0,
        x1 = 1,
        t0,
        t1,
        k10,
        transform,
        interpolator = identity$6,
        clamp = false,
        unknown;

    function scale(x) {
        return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
    }

    scale.domain = function(_) {
        return arguments.length ? (t0 = transform(x0 = +_[0]), t1 = transform(x1 = +_[1]), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
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

function identity$6(x) {
    return x;
}
