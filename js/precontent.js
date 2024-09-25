import { lib, game, ui, get, ai, _status } from '../../../noname.js';

export function precontent(bilibilicharacter) {
    //判断是否有XX扩展
    game.TrueHasExtension = function (ext) {
        return lib.config.extensions && lib.config.extensions.includes(ext);
    };
    game.HasExtension = function (ext) {
        return game.TrueHasExtension(ext) && lib.config['extension_' + ext + '_enable'];
    };
    //颜色显示
    get.bolColor = function (str, color) {
        return '<span class=\'texiaotext\' style=\'color:' + color + '\'>' + str + '</span>';
    };
    //提示框--摘自扩展OL
    game.bolSay = function (str, num) {
        if (game.game_bolSayDialog_height == undefined) game.game_bolSayDialog_height = -45;
        if (game.game_bolSayDialog_num == undefined) game.game_bolSayDialog_num = 0;
        game.game_bolSayDialog_num++;
        var func = function () {
            game.game_bolSayDialog_onOpened = true;
            game.game_bolSayDialog_height += 45;
            var dialog = ui.create.dialog('hidden');
            dialog.classList.add('static');
            dialog.add('' + str + '');
            dialog.classList.add('popped');
            dialog.style['pointer-events'] = 'none';
            dialog.style['font-family'] = "'STXinwei','xinwei'";
            ui.window.appendChild(dialog);
            var width = str.length * 20;
            if (num != undefined) width -= num * 20;
            dialog._mod_height = -16;
            dialog.style.width = width + 'px';
            lib.placePoppedDialog(dialog, {
                clientX: (dialog.offsetLeft + dialog.offsetWidth / 2) * game.documentZoom,
                clientY: (dialog.offsetTop + dialog.offsetHeight / 4) * game.documentZoom
            });
            if (dialog._mod_height) dialog.content.firstChild.style.padding = 0;
            dialog.style.left = 'calc(50% - ' + (width + 16) / 2 + 'px' + ')';
            dialog.style.top = 'calc(5% + ' + game.game_bolSayDialog_height + 'px)';
            dialog.style['z-index'] = 999999;
            setTimeout(function () {
                dialog.delete();
                if (game.game_bolSayDialog_height > ui.window.offsetHeight * 0.95 - dialog.offsetHeight * 2) game.game_bolSayDialog_height = -45;
                setTimeout(function () {
                    if (game.game_bolSayDialog_num <= 0) game.game_bolSayDialog_height = -45;
                }, 250);
            }, 1500);
            setTimeout(function () {
                delete game.game_bolSayDialog_onOpened;
            }, 500);
        };
        var interval = setInterval(function () {
            if (game.game_bolSayDialog_onOpened == undefined) {
                func();
                game.game_bolSayDialog_num--;
                clearInterval(interval);
            };
        }, 100);
    };
    game.isInSpringFestival = function () {
        const date = new Date(), time = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
        };
        return time.year == 2024 && time.month == 2 && time.day >= 10 && time.day <= 24;
    };
    //加载
    game.bolLoadPack = function (pack) {
        for (var i in pack) {
            for (var j in pack[i]) {
                lib[i][j] = pack[i][j];
                if (i == 'skill') game.finishSkill(j);
            }
        }
    };
    //武将
    game.bolLoadCharacter = function (pack) {
        for (var i in pack) lib.character[i] = pack[i];
    };
    //卡牌
    game.bolLoadCard = function (pack) {
        for (var i in pack) lib.card[i] = pack[i];
    };
    //技能
    game.bolLoadSkill = function (pack) {
        for (var i in pack) lib.skill[i] = pack[i];
        game.finishSkill(i);
    };
    //翻译(动态)
    game.bolLoadDyTrans = function (pack) {
        for (var i in pack) lib.dynamicTranslate[i] = pack[i];
    };
    //翻译
    game.bolLoadTrans = function (pack) {
        for (var i in pack) lib.translate[i] = pack[i];
    };
    //点击显示
    get.mx_skillTips = function (tipname, id) {
        var dibeijing = ui.create.div('.bol-dibeijing', document.body);
        dibeijing.style.zIndex = 16;
        var skilltip = ui.create.div('.bol-skilltip', dibeijing);
        skilltip.innerHTML = tipname;
        var herf = document.getElementById(id);
        if (herf) {
            var left = herf.getBoundingClientRect().left;
            if (game.getBolPhone()) left += herf.offsetParent.offsetLeft;
            left += document.body.offsetWidth * 0.15;
            skilltip.style.left = left + 'px';
            skilltip.style.top = (herf.getBoundingClientRect().top + 30) + 'px';
        }
        dibeijing.listen(function (e) {
            e.stopPropagation();
            this.remove();
        })
    };
    get.mx_inform = function (str1, str2) {
        const id = Math.random().toString(36).slice(-8);
        return "<a id='" + id + "' style='color:unset' href=\"javascript:get.mx_skillTips('" + str2 + "','" + id + "');\">" + str1 + "※</a>";
    };
    //筛选没有同名替换的武将
    get.originalCharacterList = function (filter) {
        if (!_status.characterlist) lib.skill.pingjian.initList();
        if (filter == undefined) filter = () => true;
        if (typeof filter == 'string') filter = (i) => i == filter;
        if (!_status.mx_originalCharcter) {
            const map = (lib.characterReplace || {});
            _status.mx_originalCharcter = Object.keys(map).reduce((list, i) => {
                list.addArray(map[i].filter(j => j != i)); return list;
            }, []);
        }
        return _status.characterlist.slice().filter(i => filter(i) && !_status.mx_originalCharcter.includes(i));
    };
}