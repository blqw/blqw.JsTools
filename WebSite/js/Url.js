/* 
 * date:    2017.04.17
 * version: v1.0.0.0
 * author:  blqw
 */
(function (window, name) {
    if (name in window) {
        throw new Error(["already '", name, "' in 'window'"].join(""));
    }

    function trim(str) {
        switch (typeof str) {
            case "undefined": return "";
            case "boolean": return str ? "true" : "";
            case "string": return str.replace(/^\s+|\s+$/g, "");
            case "number": return str.toString();
            case "object": return trim(str || "");
            case "function": return trim(str());
        }
    }

    //在字符串中查找指定的字符,如果不存在返回字符串长度
    function findIndex(str, chars) {
        var r = str.length;
        for (var i = 0; i < chars.length; i++) {
            var j = str.indexOf(chars[i]);
            if (j >= 0 && r > j)
                r = j;
        }
        return r;
    }

    //处理url中的 \..
    function backtrack(path) {
        while (path !== (path = path.replace(/((\/|^)[^\/]+\/\.\.)|^\/\.\.|^\.\./g, ""))) {
        }
        return path;
    }

    function parseSearch(search) {
        if (/^[^#][^?#]*[?#]/.test(search)) {
            throw new Error('Argument format is invalid. from string : "' + search + '"');
        }
        search = trim(search);
        if (search.charAt(0) === "?") {
            search = search.substr(1);
        }
        var params = {};
        if (search.charAt(0) === "&") {
            params[""] = "";
            search = search.substr(1);
        }
        if (search === "") return params;
        var args = search.match(/[?]?[^=&]+=[^=&]+/g);
        if (args == null) return params;
        for (var j = 0; j < args.length; j++) {
            try {
                var kv = args[j].split("=");
                setPropValue(params, decodeURIComponent(kv[0]), decodeURIComponent(kv[1]));
            } catch (e) {
                console.debug(e);
            }
        }
        return params;
        //---- function ----

        //设置属性的值
        function setPropValue(object, name, value) {
            var reg = /\[([0-9]*)\]|\[([^\[\]\.]+)\]|\.([^\[\]\.]+)|^([^\[\]\.]+)|\./g;
            var p = {
                get: function () { return object; },
                set: function (value) { object[""] = (object[""] === undefined ? value : [object[""], value]); },
                build: function () { return object; },
                append: function (name) { return new prop(p, name); }
            };
            var m = null;
            while (m = reg.exec(name)) {
                if (m[1] != null) {
                    p = p.append(parseInt(m[1]) || 0);
                } else {
                    var n = m[2] || m[3] || m[4];
                    if (n == null) {
                        object[name] = value;
                        return object;
                    }
                    p = p.append(n);
                }
            }
            p.set(value);
            return p.build();
        }

        function prop(ref, name) {
            this.ref = ref;
            this.name = name;
            this.build = this.ref.build;
            this.get = function () {
                var object = this.ref.get();
                if (object == null) {
                    return null;
                }
                return object[this.name];
            }
            this.set = function (value) {
                var object = this.ref.get();
                if (object == null) {
                    if (typeof this.name === "number") {
                        this.ref.set(object = []);
                    } else {
                        this.ref.set(object = {});
                    }
                }
                if (object[name] !== undefined) {
                    object[name] = [object[name], value];
                } else {
                    object[name] = value;
                }
            }
            this.append = function (name) {
                return this.next = new prop(this, name);
            }
        }
    }

    function urlencoded(params) {
        if (params == null || Object.keys(params).length === 0) {
            return "";
        }
        var arr = [];
        (function (value, name) {

            switch (typeof value) {
                case "undefined":
                    break;
                case "boolean":
                    arr.push(name + "=" + value);
                    break;
                case "string":
                    if (name == null || name === "") {
                        arr.push(encodeURIComponent(value));
                    } else {
                        arr.push(name + "=" + encodeURIComponent(value));
                    }
                    break;
                case "number":
                    arr.push(name + "=" + value);
                    break;
                case "object":
                    if (value instanceof Array) {
                        for (var index = 0; index < value.length; index++) {
                            arguments.callee(value[index] || "", name.length > 0 ? name + "%5B" + (index || "") + "%5D" : "");
                        }
                        return;
                    }
                    if (value !== null) {
                        var keys = Object.keys(value);
                        if (keys.length > 0) {
                            for (var index = 0; index < keys.length; index++) {
                                var key = encodeURIComponent(keys[index]);
                                if (key == null) {
                                    key = "";
                                }
                                if (name.length != 0) {
                                    key = name + "%5B" + key + "%5D";
                                }
                                var val = value[keys[index]];
                                if (val == null) {
                                    val = "";
                                }
                                arguments.callee(val, key);
                            }
                        } else if (value instanceof Date) {
                            var date = value.getFullYear()
                                + "-" + ("0" + (date.getMonth() + 1)).slice(-2)
                                + "-" + ("0" + value.getDate()).slice(-2)
                                + " " + ("0" + value.getHours()).slice(-2)
                                + "%3A" + ("0" + value.getMinutes()).slice(-2)
                                + "%3A" + ("0" + value.getSeconds()).slice(-2);
                        } else if (name === "") {
                            arguments.callee(value.toString(), name);
                        }
                    }
                    break;
                case "function":
                    arguments.callee(value(), name);
                    break;
            }
        })(params, "");
        return arr.join("&");
    }

    var token = new Object();

    function Url(url) {
        if (arguments[1] !== token) {
            return new Url(url, token);
        }
        url = trim(url || window.location.href);

        var _scheme = null; // http://
        var _domain = null; // baidu.com
        var _path = null; // /a/b/c
        var _query = null; // ?id=1
        var _anchor = null; // #abc

        if (url.length > 0) {

            var scheme = /^([^:/]+:\/\/|\/\/)/.exec(url) || "";
            if (scheme && scheme.length > 0) {
                _scheme = scheme[0];
                url = url.substr(_scheme.length);
                _domain = url.substr(0, findIndex(url, ["/", "\\", "?", "#"])).replace(/[\/\\]$/g, "");
                url = url.substr(_domain.length);
            }
            _path = url.substr(0, findIndex(url, ["?", "#"])).replace(/[?#]$/g, "");
            url = url.substr(_path.length);
            _path = _path.replace(/(\\|\/)+/g, "/");
            _query = url.substr(0, findIndex(url, ["#"]));
            url = url.substr(_query.length);
            _anchor = url;
        }

        this.params = parseSearch(_query);
        var me = this;

        if (typeof Object.defineProperties === "function") {
            var error = function (name, value) {
                throw new Error('The "' + name + '" format is invalid. from string : "' + value + '"');
            }
            Object.defineProperties(this, {
                scheme: {
                    get: function () { return _scheme; },
                    set: function (value) {
                        value = trim(value);
                        if (/^([a-z]+:)?\/\/$/.test(value) === false) {
                            error("scheme", value);
                        }
                        _scheme = value;
                    }
                },
                domain: {
                    get: function () { return _domain; },
                    set: function (value) {
                        value = trim(value);
                        if (/^([a-z0-9]([a-z0-9\-]+[a-z0-9])?\.)+[a-z0-9]+\/?$/.test(value) === false) {
                            error("domain", value);
                        }
                        if (value.slice(-1) === "/") {
                            value = value.slice(0, -1);
                        }
                        _domain = value;
                    }
                },
                path: {
                    get: function () {
                        var path = _path;
                        if (_scheme == null || _scheme === "" || _domain == null || _domain !== "") {
                            return path;
                        }
                        path = backtrack(path);
                        if (path.charAt(0) !== "/") {
                            path = "/" + path;
                        }
                        return path;
                    },
                    set: function (value) {
                        value = trim(value);
                        if (/^\/?(([^\/?#]+)(\/|$))+$/.test(value) === false) {
                            error("path", value);
                        }
                        _path = value;
                    }
                },
                query: {
                    get: function () {
                        var str = urlencoded(me.params);
                        return (str === "") ? "" : "?" + str;
                    },
                    set: function (value) {
                        me.params = parseSearch(value);
                    }
                },
                anchor: {
                    get: function () { return (_anchor === "" || _anchor.charAt(0) === "#") ? _anchor : "#" + _anchor; },
                    set: function (value) { _anchor = trim(value); }
                }
            });
        } else {
            this.scheme = _scheme;
            this.domain = _domain;
            this.path = _path;
            this.query = _query;
            this.anchor = _anchor;
        }


        this.toString = function () {
            var path = this.path;
            if (_scheme == null || _scheme === "" || _domain == null || _domain !== "") {
                path = backtrack(path);
                if (path.charAt(0) !== "/") {
                    path = "/" + path;
                }
            }
            return [this.scheme, this.domain, path, this.query, this.anchor === "#" ? "" : this.anchor].join("");
        };
    }

    function combine(url1, url2) {
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
            if (u2.path.charAt(0) === "/") {
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
    }

    Url.encoded = urlencoded;
    Url.combine = function (url1, url2) {
        if (arguments.length < 2) {
            return arguments[0];
        }
        var _base = url1;
        for (var i = 1; i < arguments.length; i++) {
            _base = combine(_base, arguments[i]).toString();
        }
        return _base;
    };
    Url.parseSearch = parseSearch;
    window[name] = Url;
    if (typeof window.define === "function") {
        window.define(name, [], function () { return Url; });
    }
})(window, "Url");
