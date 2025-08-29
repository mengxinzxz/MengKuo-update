import { lib, game, ui, get, ai, _status } from '../../../noname.js';
export function precontent(bilibilicharacter) {
    //颜色显示
    get.bolColor = function (str, color) {
        return '<span class=\'texiaotext\' style=\'color:' + color + '\'>' + str + '</span>';
    };
    //提示框--摘自扩展OL
    game.bol_say = function (str, num) {
        const showFunction = function () {
            if (game.game_bol_sayDialog_height == undefined) game.game_bol_sayDialog_height = -45;
            if (game.game_bol_sayDialog_num == undefined) game.game_bol_sayDialog_num = 0;
            game.game_bol_sayDialog_num++;
            var func = function () {
                game.game_bol_sayDialog_onOpened = true;
                game.game_bol_sayDialog_height += 45;
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
                dialog.style.top = 'calc(5% + ' + game.game_bol_sayDialog_height + 'px)';
                dialog.style['z-index'] = 999999;
                setTimeout(function () {
                    dialog.delete();
                    if (game.game_bol_sayDialog_height > ui.window.offsetHeight * 0.95 - dialog.offsetHeight * 2) game.game_bol_sayDialog_height = -45;
                    setTimeout(function () {
                        if (game.game_bol_sayDialog_num <= 0) game.game_bol_sayDialog_height = -45;
                    }, 250);
                }, 1500);
                setTimeout(function () {
                    delete game.game_bol_sayDialog_onOpened;
                }, 500);
            };
            var interval = setInterval(function () {
                if (game.game_bol_sayDialog_onOpened == undefined) {
                    func();
                    game.game_bol_sayDialog_num--;
                    clearInterval(interval);
                };
            }, 100);
        };
        ui.window ? showFunction() : lib.arenaReady.push(showFunction);
    };
    //节日判定
    game.isInSpringFestival = function () {
        const date = new Date(), time = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
        };
        return time.year == 2024 && time.month == 2 && time.day >= 10 && time.day <= 24;
    };
    //加载
    game.bol_loadPack = function (pack) {
        for (var i in pack) {
            for (var j in pack[i]) {
                lib[i][j] = pack[i][j];
                if (i == 'skill') game.finishSkill(j);
            }
        }
    };
    //武将
    game.bol_loadCharacter = function (pack) {
        for (var i in pack) lib.character[i] = pack[i];
    };
    //卡牌
    game.bol_loadCard = function (pack) {
        for (var i in pack) lib.card[i] = pack[i];
    };
    //技能
    game.bol_loadSkill = function (pack) {
        for (var i in pack) lib.skill[i] = pack[i];
        game.finishSkill(i);
    };
    //翻译(动态)
    game.bol_loadDyTrans = function (pack) {
        for (var i in pack) lib.dynamicTranslate[i] = pack[i];
    };
    //翻译
    game.bol_loadTrans = function (pack) {
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
    //编辑加载卡牌
    game.finishCard ??= function (libCardKey) {
        const mode = get.mode(),
            filterTarget = (card, player, target) => player == target && target.canEquip(card, true),
            aiBasicOrder = (card, player) => {
                const equipValue = get.equipValue(card, player) / 20;
                return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
            },
            aiBasicValue = (card, player, index, method) => {
                if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) {
                    return 0.01;
                }
                const info = get.info(card),
                    current = player.getEquip(info.subtype),
                    value = current && card != current && get.value(current, player);
                let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
                if (typeof equipValue == "function") {
                    if (method == "raw") {
                        return equipValue(card, player);
                    }
                    if (method == "raw2") {
                        return equipValue(card, player) - value;
                    }
                    return Math.max(0.1, equipValue(card, player) - value);
                }
                if (typeof equipValue != "number") {
                    equipValue = 0;
                }
                if (method == "raw") {
                    return equipValue;
                }
                if (method == "raw2") {
                    return equipValue - value;
                }
                return Math.max(0.1, equipValue - value);
            },
            aiResultTarget = (player, target, card) => get.equipResult(player, target, card);
        const info = `${libCardKey}_info`;
        if (lib.translate[`${info}_${mode}`]) {
            lib.translate[info] = lib.translate[`${info}_${mode}`];
        } else if (lib.translate[`${info}_zhu`] && (mode == "identity" || (mode == "guozhan" && _status.mode == "four"))) {
            lib.translate[info] = lib.translate[`${info}_zhu`];
        } else if (lib.translate[`${info}_combat`] && get.is.versus()) {
            lib.translate[info] = lib.translate[`${info}_combat`];
        }
        const card = lib.card[libCardKey];
        if (card.filterTarget && card.selectTarget == undefined) {
            card.selectTarget = 1;
        }
        if (card.autoViewAs) {
            if (!card.ai) {
                card.ai = {};
            }
            if (!card.ai.order) {
                card.ai.order = lib.card[card.autoViewAs].ai.order;
                if (!card.ai.order && lib.card[card.autoViewAs].ai.basic) {
                    card.ai.order = lib.card[card.autoViewAs].ai.basic.order;
                }
            }
        }
        if (card.type == "equip") {
            if (card.enable == undefined) {
                card.enable = true;
            }
            if (card.selectTarget == undefined) {
                card.selectTarget = -1;
            }
            if (card.filterTarget == undefined) {
                card.filterTarget = filterTarget;
            }
            if (card.modTarget == undefined) {
                card.modTarget = true;
            }
            if (card.allowMultiple == undefined) {
                card.allowMultiple = false;
            }
            if (card.content == undefined) {
                card.content = lib.element.content.equipCard;
            }
            if (card.toself == undefined) {
                card.toself = true;
            }
            if (card.ai == undefined) {
                card.ai = {
                    basic: {},
                };
            }
            if (card.ai.basic == undefined) {
                card.ai.basic = {};
            }
            if (card.ai.result == undefined) {
                card.ai.result = {
                    target: 1.5,
                };
            }
            if (card.ai.basic.order == undefined) {
                card.ai.basic.order = aiBasicOrder;
            }
            if (card.ai.basic.useful == undefined) {
                card.ai.basic.useful = 2;
            }
            if (card.subtype == "equip3") {
                if (card.ai.basic.equipValue == undefined) {
                    card.ai.basic.equipValue = 7;
                }
            } else if (card.subtype == "equip4") {
                if (card.ai.basic.equipValue == undefined) {
                    card.ai.basic.equipValue = 4;
                }
            } else if (card.ai.basic.equipValue == undefined) {
                card.ai.basic.equipValue = 1;
            }
            if (card.ai.basic.value == undefined) {
                card.ai.basic.value = aiBasicValue;
            }
            if (!card.ai.result.keepAI) {
                card.ai.result.target = aiResultTarget;
            }
        } else if (card.type == "delay" || card.type == "special_delay") {
            if (card.enable == undefined) {
                card.enable = true;
            }
            if (card.filterTarget == undefined) {
                card.filterTarget = lib.filter.judge;
            }
            if (card.content == undefined) {
                card.content = lib.element.content.addJudgeCard;
            }
            if (card.allowMultiple == undefined) {
                card.allowMultiple = false;
            }
        }
    };
}