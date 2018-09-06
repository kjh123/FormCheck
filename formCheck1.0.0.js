/**
 *  a Form Check plug
 *  @author     : Hui
 *  @date       : 18-09-02
 *  @license    : MIT
 *  @GitHub     : https://github.com/kjh123/FormCheck
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        root.formCheck = factory(root.jQuery);
    }
}(this, function ($) {
    function formCheck() {
        this.form = $("#FormCheck");
        this.data = [];
        this.ignore = ['required', 'sometime', 'sometimes'];
        this.regex = {
            "idcard": /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
            "phone": /^(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/,
            "email": /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/,
            "url": /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        };
        this.init();
    }

    formCheck.prototype.init = function () {
        var self = this;
        $(document).ready(function() {
            self.enable();
        });
    };

    formCheck.prototype.getData = function () {
        this.data = [];
        var data = this.form.serializeArray();
        for (var k of data) {
            var rules = $("input[name=" + k.name + "]").data('rules') || $("select[name=" + k.name + "]").data('rules') || $("textarea[name=" + k.name + "]").data('rules');
            if (rules === undefined) continue;
            rules.value = k.value;
            this.data.push(rules);
        }
    };

    formCheck.prototype.verify = function (rule, value, args) {
        switch (rule) {
            case 'length':
                if(args[0] === 'eq' && value.length != parseInt(args[1])) return '长度不正确';
                if(args[1] !== undefined && (value.length < args[0] || value.length > args[1])) return '长度应该在'+ args[0] + '到' + args[1] + '个字符之间';
                if(value.length < args[0]) return '长度应该不小于' + args[0] + '位';
                break;
            case 'int':
                if(isNaN(value)) return '必须是一个数字';
                if(args[0] === 'eq' && value != parseInt(args[1])) return '的值不正确';
                if(args[1] !== undefined && (parseInt(value) < parseInt(args[0]) || parseInt(value) > parseInt(args[1]))) return '应该大于'+ args[0] + '并且小于' + args[1];
                if(value < args[0]) return '值应该不小于' + args[0];
                break;
            case 'in':
                if(args === undefined) return '缺少指定参数';
                if($.inArray(value, args) === -1) return '不在指定范围内';
                break;
            case 'eq':
                if(args[0] != value) return '不正确';
                break;
            case 'max':
            case 'lt':
                if(isNaN(value)) return '必须是一个数字';
                if(parseInt(value) >= parseInt(args[0])) return '应该小于' + args[0];
                break;
            case 'min':
            case 'gt':
                if(isNaN(value)) return '必须是一个数字';
                if(parseInt(value) <= parseInt(args[0])) return '应该大于' + args[0];
                break;
            case 'mobile':
            case 'phone':
                if(!this.regex.phone.test(value)) return '格式不正确';
                break;
            case 'idcard':
                if(!this.regex.idcard.test(value)) return '格式不正确';
                break;
            case 'url':
                if(!this.regex.url.test(value)) return '格式不正确';
                break;
            case 'email':
                if(!this.regex.email.test(value)) return '格式不正确';
                break;
            case 'sometimes':
            case 'sometime':
            case 'required': return true;
            default : return '未定义的规则 ' + rule;
        }
        return true;
    };
    
    formCheck.prototype.parse = function (rules,value) {
        if(value.length === 0) return '不能为空';
        for (var rule of rules) {
            if(rule.indexOf(':') > -1) {
                var arr = rule.split(':');
                var args = arr[1].split(',');
                rule = arr[0];
            }
            if($.inArray(rule, this.ignore) !== -1) continue;
            return this.verify(rule, value, args);
        }
        return true;
    };

    formCheck.prototype.check = function () {
        this.getData();
        for (var v of this.data) {
            // 检查规则
            // console.log(this.data);
            if(v.rules[0].indexOf('sometime') > -1 && v.value.length === 0) continue;
            var res = this.parse(v.rules, v.value);
            if( res !== true) {
                return v.attribute + ' ' + res;
            }
        }
        return true;
    };

    formCheck.prototype.enable = function() {
        var self = this;
        this.form.on('submit', function(event) {
            var response = self.check();
            if(response !== true) {
                layer.open({
                    content: response
                    ,type: 0
                    ,btn: '知道了'
                });
                return false;
            }
        });
    };

    return new formCheck();
}));