/* 
 * date:    2017.04.24
 * version: v1.0.0.0
 * author:  blqw
 */
(function(){
    var ___DateToString = Date.prototype.toString;
    Date.prototype.toString = function (format) {
        if (format === undefined) {
            return ___DateToString.apply(this);
        }
        if (format === null) {
            format = "yyyy-MM-dd HH:mm:ss";
        }

        var frontadd = function (num, decimal) {
            var i = parseInt(num);
            if (i < 0) {
                i *= -1;
                return "-" + ("0000" + i).slice(-(decimal || 2))
            }
            return ("0000" + i).slice(-(decimal || 2))
        };

        var weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var cnWeekNames = ["一", "二", "三", "四", "五", "六", "日"];
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var cnMonthNames = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

        var formats = [
            { expr: "yyyy", value: this.getFullYear() },
            { expr: "yyy", value: this.getYear() },
            { expr: "yy", value: this.getFullYear() % 100 },
            { expr: "mi", value: this.getMilliseconds() },
            { expr: "MMMMM", value: cnMonthNames[this.getMonth()] },
            { expr: "MMMM", value: monthNames[this.getMonth()] },
            { expr: "MMM", value: monthNames[this.getMonth()].substr(0, 3) },
            { expr: "MM", value: frontadd(this.getMonth() + 1) },
            { expr: "M", value: this.getMonth() + 1 },
            { expr: "dddd", value: weekNames[this.getDay()] },
            { expr: "ddd", value: weekNames[this.getDay()].substr(0, 3) },
            { expr: "DDDD", value: "星期" + cnWeekNames[this.getDay()] },
            { expr: "DDD", value: "周" + cnWeekNames[this.getDay()] },
            { expr: "dd", value: frontadd(this.getDate()) },
            { expr: "d", value: this.getDate() },
            { expr: "HH", value: frontadd(this.getHours()) },
            { expr: "H", value: this.getHours() },
            { expr: "hh", value: frontadd(this.getHours() % 12) },
            { expr: "h", value: this.getHours() % 12 },
            { expr: "mm", value: frontadd(this.getMinutes()) },
            { expr: "m", value: this.getMinutes() },
            { expr: "ss", value: frontadd(this.getSeconds()) },
            { expr: "s", value: this.getSeconds() },
            { expr: "fff", value: frontadd(this.getMilliseconds(), 3) },
            { expr: "ff", value: frontadd(this.getMilliseconds(), 3).substr(0, 2) },
            { expr: "f", value: frontadd(this.getMilliseconds(), 3).substr(0, 1) },
            { expr: "tt", value: this.getHours() > 12 ? "PM" : "AM" },
            { expr: "t", value: this.getHours() > 12 ? "P" : "A" },
            { expr: "TT", value: this.getHours() > 12 ? "下午" : "上午" },
            { expr: "T", value: this.getHours() > 12 ? "下" : "上" },
            { expr: "zzz", value: frontadd(this.getTimezoneOffset() / 60) + ":" + frontadd(this.getTimezoneOffset() % 60) },
            { expr: "zz", value: frontadd(this.getTimezoneOffset() / 60) },
            { expr: "z", value: this.getTimezoneOffset() / 60 },
        ];

        var expr = "(\\\\.)"; //匹配转义符
        var map = {};
        for (var i in formats) {
            var e = formats[i];
            expr += "|(" + e.expr + ")";
            map[e.expr] = e.value;
        }

        return format.replace(new RegExp(expr, "g"), function (m) {
            return map[m] || m.substr(1);
        });
    };
    Date.prototype.checkNumber = function (value) {
        if (+value !== value) {
            throw new Error("必须是数字");
        }
    };

    //时间加减
    Date.prototype.add = function (type, value) {
        this.checkNumber(value);
        var date = new Date(this);
        switch (type) {
            case 'y':
            case 'Y':
                date.setYear(this.getYear() + value);
                break;
            case 'M':
                date.setMonths(this.getMonths() + value);
                break;
            case 'd':
            case 'D':
                date.setDate(this.getDate() + value);
                break;
            case 'h':
            case 'H':
                date.setHours(this.getHours() + value);
                break;
            case 'm':
                date.setMinutes(this.getMinutes() + value);
                break;
            case 'S':
            case 's':
                date.setSeconds(this.getSeconds() + value);
                break;
            case 'f':
                date.setMilliseconds(this.getMilliseconds() + value);
                break;
            default:
                throw Error("type只能是:y,Y,M,d,D,h,H,m,s,S,f");
        }
        return date;
    };

    Date.prototype.addDays = function (value) { return this.add("d", value); };
    Date.prototype.addHours = function (value) { return this.add("h", value); };
    Date.prototype.addMilliseconds = function (value) { return this.add("f", value); };
    Date.prototype.addMinutes = function (value) { return this.add("m", value); };
    Date.prototype.addMonths = function (value) { return this.add("M", value); };
    Date.prototype.addSeconds = function (value) { return this.add("s", value); };
    Date.prototype.addYears = function (value) { return this.add("y", value); };
})();
