(function (window, name) {
    if (name in window) {
        throw new Error(["already ", name, " in windows"].join(""));
    }

    var ajax = function (url) {
        var request = {
            url: url || "",
            settings: {
                url: url || "",
                type: "GET",
                context: this
            }
        }
        //dataType (default: Intelligent Guess (xml, json, script, or html))
        /**
         * 设置回调上下文
         * @param {} context 
         */
        request.context = function (context) {
            if (context) {
                request.settings.context = context;
            }
            return request;
        }
        request.crossDomain = function () {
            request.settings.crossDomain = true;
            return request;
        };
        request.body = function (data) {
            if (data) {
                request.settings.data = data;
            }
            if (request.settings.type.toUpperCase() === "GET") {
                request.type = "POST";
            }
            return request;
        };
        request.jsonBody = function (data) {
            if (!request.settings.contentType) {
                request.settings.contentType = 'application/json;charset=utf-8';
            }
            return request.body(data && JSON.stringify(data));
        };
        request.contentType = function (contentType) {
            request.settings.contentType = contentType;
            return request;
        };
        request.query = function (data) {
            if (data) {
                var query = $.param(data);
                if (request.url.indexOf("?") === -1) {
                    request.settings.url = request.url + "?" + query;
                } else if (request.url.indexOf("?") === request.url.length - 1) {
                    request.settings.url = request.url + query;
                } else {
                    request.settings.url = request.url + "&" + query;
                }
            }
            return request;
        };
        request.setting = function (settings) {
            if (settings) {
                $.extend(true, request.settings, settings);
            }
            return request;
        }
        request.method = function (method) {
            if (method) {
                request.settings.type = method.toUpperCase();
            }
            return request;
        }
        function sender($, settings, method) {
            return function (dataType) {
                if (method) {
                    settings.type = method;
                }
                settings.method = settings.type;
                if (dataType) {
                    settings.dataType = dataType;
                }
                return $.ajax(settings);
            };
        }

        request.send = sender($, request.settings);
        request.get = sender($, request.settings, "GET");
        request.post = sender($, request.settings, "POST");
        request.head = sender($, request.settings, "HEAD");
        request.delete = sender($, request.settings, "DELETE");
        request.options = sender($, request.settings, "OPTIONS");
        request.trace = sender($, request.settings, "TRACE");

        return request;
    };

    window[name] = ajax;
    if (typeof window.define === "function") {
        window.define(name, [], function () { return ajax; }) || window.define(function () { return ajax; });
    }
})(window, "Ajax");
