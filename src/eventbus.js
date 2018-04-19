(function (exporter) {
    function isFunc(fn) { return typeof fn === "function" }
    function str(s) {
        if (s == null) {
            return null;
        }
        s = s.replace(/^\s+|\s+$/g, "");
        return s.length > 0 ? s.toLowerCase() : null;
    }

    function handler(eventName) {
        var fns = [];
        var datas = [];
        this.add = function (fn, data) {
            fns.push(fn);
            datas.push(data);
        }
        this.remove = function (fn) {
            var i = fns.indexOf(fn);
            if (i >= 0) {
                fns.splice(i, 1);
                datas.splice(i, 1);
            }
        }
        this.invoke = function (sender, data) {
            fns.forEach(function (fn, i) {
                try {
                    fn(sender, data, datas[i])
                } catch (error) {
                    console.error(eventName + "事件出现异常异常: " + fn.toString());
                    console.error(error);
                }
            });
        }
    }

    function eventBus() {
        var handers = {}
        this.on = function (eventName, fn, data) {
            eventName = str(eventName);
            if (eventName == null) {
                throw new Error("事件名无效");
            }
            if (!isFunc(fn)) {
                var temp = fn;
                fn = data;
                data = temp;
            }
            if (!isFunc(fn)) {
                throw new Error("必须提供事件函数");
            }
            var handle = handers[eventName];
            if (handle == null) {
                handle = new handler(eventName);
                handers[eventName] = handle;
            }
            handle.add(fn, data);
        }
        this.off = function (eventName, fn) {
            eventName = str(eventName);
            if (eventName == null) {
                return;
            }
            var handle = handers[eventName];
            if (handle != null) {
                if (fn == null) {
                    delete handers[eventName];
                } else {
                    handle.remove(fn);
                }
            }
        }
        this.fire = this.emit = this.trigger =
            function (eventName, sender, args) {
                eventName = str(eventName);
                if (eventName == null) {
                    return;
                }
                var handle = handers[eventName];
                if (handle != null) {
                    handle.invoke(sender, args);
                }
            }
        var bus = this;
        this.bindTo = function (obj) {
            if (obj == null) {
                throw new Error("obj is null");
            }
            for (var key in bus) {
                if (bus.hasOwnProperty(key) && key !== "bindTo") {
                    obj[key] = bus[key];
                }
            }
        }
    }
    var instance = new eventBus();
    instance.bindTo(eventBus);
    eventBus.version = "2018.04.19"
    exporter(eventBus);
})(function (c) { window.eventBus = c; })