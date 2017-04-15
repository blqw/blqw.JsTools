(function (window, name) {
    if (name in window) {
        throw new Error(["already ", name, " in windows"].join(""));
    }
    var Url = function (url) {
        //在字符串中查找指定的字符,如果不存在返回字符串的 def
        var find = function (str, chars, def) {
            var r = def || str.length;
            for (var i = 0; i < chars.length; i++) {
                var j = str.indexOf(chars[i]);
                if (j >= 0 && r > j)
                    r = j;
            }
            return r;
        }

        //处理url中的 \..
        var format = function (path) {
            while (path !== (path = path.replace(/((\/|^)[^\/]+\/\.\.)|^\/\.\.|^\.\./g, ""))) {
            }
            return path;
        }
        this.scheme = null; // http://
        this.domain = null; // baidu.com
        this.path = null; // /a/b/c
        this.query = null; // ?id=1
        this.anchor = null; // #abc

        if (url == null) return;
        url = url.replace(/^\s+|\s+$/g, "");
        var scheme = /^([^:/]+:\/\/|\/\/)/.exec(url) || null;
        if (scheme && scheme.length > 0) {
            this.scheme = scheme[0];
            url = url.substr(this.scheme.length);
            this.domain = url.substr(0, find(url, ["/", "\\", "?", "#"])).replace(/[\/\\]$/g, "");
            url = url.substr(this.domain.length);
        }
        this.path = url.substr(0, find(url, ["?", "#"])).replace(/[?#]$/g, "");
        url = url.substr(this.path.length);
        this.path = format(this.path.replace(/(\\|\/)+/g, "/"));
        this.query = url.substr(0, find(url, ["#"]));
        url = url.substr(this.query.length);
        this.anchor = url;
        this.toString = function () {
            return [this.scheme, this.domain, this.path, this.query, this.anchor].join("");
        };
    };

    Url.combine = function (url1, url2) {
        if (url1 == null || url1.length === 0) {
            return url2 && new Url(url2).toString();
        }
        if (url2 == null || url2.length === 0) {
            return new Url(url1).toString();
        }
        var u1 = new Url(url1);
        var u2 = new Url(url2);

        if (u2.scheme != null) {
            return u2.toString();
        }

        if (u2.path != null && u2.path.length > 0) {
            if (u2.path.charAt(0) === ".") {

            }
            else if (u2.path.charAt(0) === "/") {
                u1.path = u2.path;
            }
            else if (u2.path.substr(0, 2) === "./") {
                u1.path = [u1.path, u2.path.substr(u1.path.slice(-1) === "/" ? 2 : 1)].join("");
            }
            else if (u1.path.slice(-1) === "/") {
                u1.path = [u1.path, u2.path].join("");
            } else {
                u1.path = [u1.path.substr(0, u1.path.lastIndexOf("/")), "/", u2.path].join("");
            }
        }

        if (u2.query == null || u2.query.length === 0) {
            if (u2.anchor != null && u2.anchor.length > 0) {
                u1.anchor = u2.anchor;
            } else {
                u1.query = "";
            }
            return u1.toString();
        }

        if (u2.query.substr(0, 2) === "?&") {
            if (u2.query.length > 2) {
                if (u1.query == null || u1.query.length === 0) {
                    u1.query = ["?", u2.query.substr(2)];
                } else {
                    u1.query = [u1.query, u2.query.substr(u1.query.slice(-1) === "&" ? 2 : 1)].join("");
                }
            }
        } else {
            u1.query = u2.query;
        }

        if (u2.anchor != null && u2.anchor.length > 0) {
            u1.anchor = u2.anchor;
        }

        return u1.toString();
    };

    Url.parseSearch = function (search) {
        if (search == null || search === "?") return {};
        if (search.charAt(0) === "?") search = search.substr(1);
        var args = search.match(/[?]?[^=&]+=[^=&]+/g);
        var params = {};
        if (args == null) return params;
        for (var j = 0; j < args.length; j++) {
            try {
                var a = args[j].split("=");
                var v = params[a[0]];
                if (v) {
                    if (v.constructor === Array) {
                        v.push(decodeURIComponent(a[1]));
                    } else {
                        params[a[0]] = [v, decodeURIComponent(a[1])];
                    }
                } else {
                    params[a[0]] = decodeURIComponent(a[1]);
                }
            } catch (e) {
                console.debug(e);
            }
        }
        return params;
    };

    window[name] = Url;
    if (typeof window.define === "function") {
        window.define(name, [], function () { return Url; }) || window.define(function () { return Url; });
    }
})(window, "Url");
