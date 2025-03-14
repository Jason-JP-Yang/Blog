! function () {
    "use strict";
    (t => {
        const {
            screen: {
                width: e,
                height: a
            },
            navigator: {
                language: r
            },
            location: n,
            document: i,
            history: s
        } = t, {
            hostname: c,
            href: o,
            origin: u
        } = n, {
            currentScript: l,
            referrer: d
        } = i, h = o.startsWith("data:") ? void 0 : t.localStorage;
        if (!l) return;
        const m = "data-",
            f = "true",
            p = l.getAttribute.bind(l),
            g = p(m + "website-id"),
            y = p(m + "host-url"),
            b = p(m + "tag"),
            v = "false" !== p(m + "auto-track"),
            w = p(m + "exclude-search") === f,
            S = p(m + "exclude-hash") === f,
            N = p(m + "domains") || "",
            T = N.split(",").map((t => t.trim())),
            A = `${(y || "https://api-gateway.umami.dev" || l.src.split("/").slice(0, -1).join("/")).replace(/\/$/, "")}/api/send`,
            j = `${e}x${a}`,
            x = /data-umami-event-([\w-_]+)/,
            O = m + "umami-event",
            k = 300,
            E = t => {
                try {
                    const {
                        pathname: e,
                        search: a,
                        hash: r
                    } = new URL(t, n.href);
                    return e + (w ? "" : a) + (S ? "" : r)
                } catch (e) {
                    return t
                }
            },
            L = () => ({
                website: g,
                hostname: c,
                screen: j,
                language: r,
                title: J,
                url: C,
                referrer: I,
                tag: b || void 0
            }),
            $ = (t, e, a) => {
                a && (I = C, C = E(a.toString()), C !== I && setTimeout(D, k))
            },
            K = () => M || !g || h && h.getItem("umami.disabled") || N && !T.includes(c),
            U = async (t, e = "event") => {
                if (K()) return;
                const a = {
                    "Content-Type": "application/json"
                };
                void 0 !== _ && (a["x-umami-cache"] = _);
                try {
                    const r = await fetch(A, {
                        method: "POST",
                        body: JSON.stringify({
                            type: e,
                            payload: t
                        }),
                        headers: a
                    }),
                        n = await r.json();
                    n && (M = !!n.disabled, _ = n.cache)
                } catch (t) { }
            }, B = () => {
                q || (D(), (() => {
                    const t = (t, e, a) => {
                        const r = t[e];
                        return (...e) => (a.apply(null, e), r.apply(t, e))
                    };
                    s.pushState = t(s, "pushState", $), s.replaceState = t(s, "replaceState", $)
                })(), (() => {
                    const t = new MutationObserver((([t]) => {
                        J = t && t.target ? t.target.text : void 0
                    })),
                        e = i.querySelector("head > title");
                    e && t.observe(e, {
                        subtree: !0,
                        characterData: !0,
                        childList: !0
                    })
                })(), i.addEventListener("click", (async t => {
                    const e = t => ["BUTTON", "A"].includes(t),
                        a = async t => {
                            const e = t.getAttribute.bind(t),
                                a = e(O);
                            if (a) {
                                const r = {};
                                return t.getAttributeNames().forEach((t => {
                                    const a = t.match(x);
                                    a && (r[a[1]] = e(t))
                                })), D(a, r)
                            }
                        }, r = t.target, i = e(r.tagName) ? r : ((t, a) => {
                            let r = t;
                            for (let t = 0; t < a; t++) {
                                if (e(r.tagName)) return r;
                                if (r = r.parentElement, !r) return null
                            }
                        })(r, 10);
                    if (!i) return a(r);
                    {
                        const {
                            href: e,
                            target: r
                        } = i, s = i.getAttribute(O);
                        if (s)
                            if ("A" === i.tagName) {
                                const c = "_blank" === r || t.ctrlKey || t.shiftKey || t.metaKey || t.button && 1 === t.button;
                                if (s && e) return c || t.preventDefault(), a(i).then((() => {
                                    c || (n.href = e)
                                }))
                            } else if ("BUTTON" === i.tagName) return a(i)
                    }
                }), !0), q = !0)
            }, D = (t, e) => U("string" == typeof t ? {
                ...L(),
                name: t,
                data: "object" == typeof e ? e : void 0
            } : "object" == typeof t ? t : "function" == typeof t ? t(L()) : L()), W = t => U({
                ...L(),
                data: t
            }, "identify");
        t.umami || (t.umami = {
            track: D,
            identify: W
        });
        let _, q, C = E(o),
            I = d.startsWith(u) ? "" : d,
            J = i.title,
            M = !1;
        v && !K() && ("complete" === i.readyState ? B() : i.addEventListener("readystatechange", B, !0))
    })(window)
}();