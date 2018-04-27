window.nsGmx = window.nsGmx || {};
window.nsGmx.Utils = window.nsGmx.Utils || {};

window.nsGmx.Utils.formatDate = function(dt, fstr) {
    function pz(n) {
        var s = n + '';
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

    fstr = fstr || 'DD.MM.YYYY hh:mm';

    return fstr.replace(/YYYY/g, dt.getFullYear())
        .replace(/MM/g, pz(dt.getMonth() + 1))
        .replace(/DD/g, pz(dt.getDate()))
        .replace(/hh/g, pz(dt.getHours()))
        .replace(/mm/g, pz(dt.getMinutes()));
};

window.nsGmx.Utils.formatDateUTC = function(dt, fstr) {
    function pz(n) {
        var s = n + '';
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

    fstr = fstr || 'DD.MM.YYYY hh:mm';

    return fstr.replace(/YYYY/g, dt.getUTCFullYear())
        .replace(/MM/g, pz(dt.getUTCMonth() + 1))
        .replace(/DD/g, pz(dt.getUTCDate()))
        .replace(/hh/g, pz(dt.getUTCHours()))
        .replace(/mm/g, pz(dt.getUTCMinutes()));
};
