import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '龙舟争渡',
    mode: 'identity',
    intro: [
        '本游戏为八人模式，分为魏蜀吴群四个势力，每个势力各两名角色',
        '所有角色视为拥有技能【艾叶】：当你进入濒死状态时，你将体力值回复至1点',
        '当一个势力的角色对另一个势力的角色造成1点伤害后，伤害来源所属势力获得1分，至多12分',
        '第三轮游戏开始时，分数最高的势力对应的所有角色获得游戏胜利',
        '本模式中刘琦，唐咨，黄权，苏飞均调整为模式专属版本，且玩家方将池必定含有其中与自己势力相同的专属武将',
    ],
    init() {
        lib.configOL.number = 8;
        lib.config.singleControly = lib.config.extension_活动萌扩_singleControly;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        //牌堆替换
        cardPile() {
            for (var i = 0; i < lib.card.list.length; i++) {
                switch (lib.card.list[i][2]) {
                    case 'tao': lib.card.list[i][2] = 'zong'; break;
                    case 'jiu': lib.card.list[i][2] = 'xionghuangjiu'; break;
                    case 'wuzhong': lib.card.list[i][2] = 'tongzhougongji'; break;
                    case 'zhuge': lib.card.list[i][2] = 'liannu'; break;
                    case 'wugu': case 'taoyuan': lib.card.list[i][2] = 'lizhengshangyou'; break;
                    case 'nanman': case 'wanjian': lib.card.list[i][2] = 'nishuixingzhou'; break;
                    case 'bingliang': case 'lebu': case 'shandian': lib.card.list.splice(i--, 1); break;
                }
            }
            return lib.card.list;
        },
        chooseCharacterBefore() {
            _status.mode = 'normal';
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        if (from.identity == to.identity) return 10;
                        return -10;
                    },
                },
                game: {
                    //死亡检查胜负情况
                    checkResult() { },
                    //计分
                    REidentity: {
                        wei: 0,
                        shu: 0,
                        wu: 0,
                        qun: 0,
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.player = game.me;
                        next.showConfig = true;
                        next.setContent(async function (event, trigger, player) {
                            ui.arena.classList.add('choose-character');
                            if (!_status.characterlist) lib.skill.pingjian.initList();
                            _status.characterlist = _status.characterlist.filter(name => {
                                const info = get.character(name);
                                return ['wei', 'shu', 'wu', 'qun'].includes(info.group) && !info.doubleGroup.length;
                            });
                            let zhuanshuCharacter = ['sp_liuqi', 'xf_huangquan', 'xf_tangzi', 'xf_sufei'];
                            let list = _status.characterlist.filter(name => get.character(name).group == player.identity).randomGets(12), zhuanshu = false;
                            if (zhuanshuCharacter.some(i => get.character(i).group === player.identity)) zhuanshu = true;
                            if (zhuanshu) {
                                let addx = zhuanshuCharacter.filter(name => get.character(name).group == player.identity);
                                list.randomRemove(addx.length);
                                list.addArray(addx);
                                list.randomSort();
                            }
                            let aiList = [];
                            if (!lib.config.singleControly) aiList.addArray(list.randomRemove(6));
                            const createDialog = event.dialog = ui.create.dialog(lib.config.singleControly ? '请选择你和队友的武将' : '请选择你的武将', "hidden");
                            if (!lib.config.singleControly) createDialog.add('<div class="text center">玩家武将</div>');
                            createDialog.add([list, 'character']);
                            const fellow = game.findPlayer(current => current != player && current.identity == player.identity);
                            if (fellow) {
                                if (lib.config.singleControly) {
                                    game.addGlobalSkill('autoswap');
                                    fellow._trueMe = player;
                                }
                                else {
                                    createDialog.add('<div class="text center">队友武将</div>');
                                    createDialog.add([aiList, 'character']);
                                }
                            }
                            if (lib.onfree) {
                                lib.onfree.push(() => {
                                    event.dialogxx = ui.create.characterDialog('heightset', name => {
                                        const info = get.character(name);
                                        return info.doubleGroup.length > 0 || info.group !== game.me.identity;
                                    });
                                    if (ui.cheat2) {
                                        ui.cheat2.animate('controlpressdownx', 500);
                                        ui.cheat2.classList.remove('disabled');
                                    }
                                });
                            }
                            else {
                                event.dialogxx = ui.create.characterDialog('heightset', name => {
                                    const info = get.character(name);
                                    return info.doubleGroup.length > 0 || info.group !== player.identity;
                                });
                            }
                            ui.create.cheat = function () {
                                _status.createControl = ui.cheat2;
                                ui.cheat = ui.create.control('更换', function () {
                                    if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) return;
                                    let list = _status.characterlist.filter(name => get.character(name).group == player.identity && !aiList.includes(name)).randomGets(12);
                                    const replaceList = zhuanshuCharacter.filter(name => get.character(name).group === game.me.identity && !aiList.includes(name));
                                    if (replaceList.length > 0) {
                                        list.randomRemove(replaceList.length);
                                        list.addArray(replaceList);
                                        list.randomSort();
                                    }
                                    if (!lib.config.singleControly) list.randomRemove(6);
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    _status.event.dialog.buttons = ui.create.buttons(list, 'character', buttons);
                                    _status.event.dialog.content.insertBefore(buttons, node);
                                    buttons.animate('start');
                                    node.remove();
                                    game.uncheck();
                                    game.check();
                                });
                                delete _status.createControl;
                            };
                            ui.create.cheat2 = function () {
                                ui.cheat2 = ui.create.control('自由选将', function () {
                                    if (this.dialog == _status.event.dialog) {
                                        this.dialog.close();
                                        _status.event.dialog = this.backup;
                                        this.backup.open();
                                        delete this.backup;
                                        game.uncheck();
                                        game.check();
                                        if (ui.cheat) {
                                            ui.cheat.animate('controlpressdownx', 500);
                                            ui.cheat.classList.remove('disabled');
                                        }
                                    }
                                    else {
                                        this.backup = _status.event.dialog;
                                        _status.event.dialog.close();
                                        _status.event.dialog = _status.event.parent.dialogxx;
                                        this.dialog = _status.event.dialog;
                                        this.dialog.open();
                                        game.uncheck();
                                        game.check();
                                        if (ui.cheat) ui.cheat.classList.add('disabled');
                                    }
                                });
                                if (lib.onfree) ui.cheat2.classList.add('disabled');
                            }
                            if (!ui.cheat) ui.create.cheat();
                            if (!ui.cheat2) ui.create.cheat2();
                            const result = await player.chooseButton(createDialog, (lib.config.singleControly ? 2 : 1), true).set('filterButton', button => {
                                const event = get.event();
                                if (lib.config.singleControly || (ui.cheat2 && ui.cheat2.dialog == event.getParent().dialog)) return true;
                                return (ui.selected.buttons.length > 0) === event.list.includes(button.link);
                            }).set('onfree', true).set('list', aiList).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            _status.characterlist.removeArray(result.links);
                            game.addRecentCharacter(...result.links);
                            player.init(result.links[0]);
                            fellow?.init(result.links[1] || (list => {
                                let listx = [], num = 0;
                                for (const name of list) {
                                    const numx = get.rank(name, true);
                                    if (numx > num) {
                                        num = numx;
                                        listx = [name];
                                    }
                                    else if (numx == num) listx.push(name);
                                }
                                return listx;
                            })(aiList).randomGet());
                            for (const i of game.players) {
                                if (!(i === player || i === fellow)) {
                                    i.init(_status.characterlist.filter(name => get.character(name).group == i.identity).randomRemove());
                                }
                                i.markSkill('_REaiye');
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    card: {
                        zong: {
                            image: 'ext:活动萌扩/image/zong.png',
                            fullimage: true,
                            type: 'basic',
                            cardcolor: 'red',
                            enable(card, player) {
                                return game.hasPlayer(function (target) {
                                    return player.identity == target.identity && target.isDamaged();
                                });
                            },
                            filterTarget(card, player, target) {
                                return player.identity == target.identity && target.isDamaged();
                            },
                            content() {
                                target.recover();
                            },
                            ai: {
                                basic: {
                                    order(card, player) {
                                        if (player.hasSkillTag('pretao')) return 5;
                                        return 2;
                                    },
                                    useful: [8, 6.5, 5, 4],
                                    value: [8, 6.5, 5, 4],
                                },
                                result: {
                                    player(player, target) {
                                        return get.recoverEffect(target, player, player);
                                    },
                                },
                                tag: {
                                    recover: 1,
                                },
                            },
                        },
                        xionghuangjiu: {
                            image: 'ext:活动萌扩/image/xionghuangjiu.png',
                            fullimage: true,
                            type: "basic",
                            enable(event, player) {
                                return !player.hasSkill('jiu');
                            },
                            lianheng: true,
                            logv: false,
                            usable: 1,
                            selectTarget: -1,
                            modTarget: true,
                            filterTarget(card, player, target) {
                                return target == player;
                            },
                            content() {
                                if (cards && cards.length) card = cards[0];
                                game.broadcastAll(function (target, card, gain2) {
                                    if (!target.storage.jiu) target.storage.jiu = 0;
                                    target.storage.jiu++;
                                    target.addSkill('jiu');
                                    game.addVideo('jiuNode', target, true);
                                    if (!target.node.jiu && lib.config.jiu_effect) {
                                        target.node.jiu = ui.create.div('.playerjiu', target.node.avatar);
                                        target.node.jiu2 = ui.create.div('.playerjiu', target.node.avatar2);
                                    }
                                    if (gain2 && card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                        card.clone.moveDelete(target);
                                    }
                                }, target, card, target == targets[0]);
                                if (target == targets[0]) {
                                    if (card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                        game.addVideo('gain2', target, get.cardsInfo([card]));
                                    }
                                }
                            },
                            ai: {
                                basic: {
                                    useful(card, i) {
                                        if (_status.event.player.hp > 1) {
                                            if (i == 0) return 5;
                                            return 1;
                                        }
                                        if (i == 0) return 7.3;
                                        return 3;
                                    },
                                    value(card, player, i) {
                                        if (player.hp > 1) {
                                            if (i == 0) return 5;
                                            return 1;
                                        }
                                        if (i == 0) return 7.3;
                                        return 3;
                                    },
                                },
                                order() {
                                    return get.order({ name: 'sha' }) + 0.2;
                                },
                                result: {
                                    target(player, target) {
                                        if (lib.config.mode == 'stone' && !player.isMin()) {
                                            if (player.getActCount() + 1 >= player.actcount) return 0;
                                        }
                                        var shas = player.getCards('h', 'sha');
                                        if (shas.length > 1 && player.getCardUsable('sha') > 1) {
                                            return 0;
                                        }
                                        var card;
                                        if (shas.length) {
                                            for (var i = 0; i < shas.length; i++) {
                                                if (lib.filter.filterCard(shas[i], target)) {
                                                    card = shas[i]; break;
                                                }
                                            }
                                        }
                                        else if (player.hasSha() && player.needsToDiscard()) {
                                            if (player.countCards('h', 'hufu') != 1) {
                                                card = { name: 'sha' };
                                            }
                                        }
                                        if (card) {
                                            if (game.hasPlayer(function (current) {
                                                return (get.attitude(target, current) < 0 &&
                                                    target.canUse(card, current, true, true) &&
                                                    !current.getEquip('baiyin') &&
                                                    get.effect(current, card, target) > 0);
                                            })) {
                                                return 1;
                                            }
                                        }
                                        return 0;
                                    },
                                },
                            },
                        },
                        tongzhougongji: {
                            image: 'ext:活动萌扩/image/tongzhougongji.png',
                            fullimage: true,
                            enable: true,
                            type: 'trick',
                            selectTarget: -1,
                            filterTarget(card, player, target) {
                                return player.identity == target.identity;
                            },
                            content() {
                                target.draw('nodelay');
                            },
                            ai: {
                                basic: {
                                    order: 9,
                                    useful: 3,
                                    value: 4,
                                },
                                result: {
                                    target: 1,
                                },
                                tag: {
                                    draw: 1,
                                    multitarget: 1,
                                },
                            },
                        },
                        lizhengshangyou: {
                            image: 'ext:活动萌扩/image/lizhengshangyou.png',
                            fullimage: true,
                            type: 'trick',
                            enable: true,
                            selectTarget: -1,
                            filterTarget: true,
                            content() {
                                target.draw(player.identity == target.identity ? game.countGroup() : 1, 'nodelay');
                            },
                            ai: {
                                basic: {
                                    order: 7,
                                    useful: 5,
                                    value: 7,
                                },
                                result: {
                                    target(player, target) {
                                        return player.identity == target.identity ? 100 : 1;
                                    },
                                },
                                tag: {
                                    draw: 3,
                                    multitarget: 1,
                                },
                            },
                        },
                        nishuixingzhou: {
                            image: 'ext:活动萌扩/image/nishuixingzhou.png',
                            fullimage: true,
                            enable: true,
                            type: 'trick',
                            filterTarget(card, player, target) {
                                return player.identity != target.identity;
                            },
                            content() {
                                for (var i of game.filterPlayer(function (current) {
                                    return target.identity == current.identity;
                                })) {
                                    player.line(i);
                                    i.damage();
                                }
                            },
                            ai: {
                                basic: {
                                    order: 7.2,
                                    useful: 7,
                                    value: 7.5,
                                },
                                result: {
                                    target: -1,
                                },
                                tag: {
                                    damage: 1
                                },
                            },
                        },
                        liannu: {
                            image: 'ext:活动萌扩/image/liannu.png',
                            fullimage: true,
                            type: 'equip',
                            subtype: 'equip1',
                            ai: {
                                order() {
                                    return get.order({ name: 'sha' }) - 0.1;
                                },
                                equipValue(card, player) {
                                    if (player._liannu_temp) return 1;
                                    player._liannu_temp = true;
                                    var result = function () {
                                        if (!game.hasPlayer(function (current) {
                                            return get.distance(player, current) <= 1 && player.canUse('sha', current) && get.effect(current, { name: 'sha' }, player, player) > 0;
                                        })) {
                                            return 1;
                                        }
                                        if (player.hasSha() && _status.currentPhase == player) {
                                            if (player.getEquip('liannu') && player.countUsed('sha') || player.getCardUsable('sha') == 0) {
                                                return 10;
                                            }
                                        }
                                        var num = player.countCards('h', 'sha');
                                        if (num > 1) return 6 + num;
                                        return 3 + num;
                                    }();
                                    delete player._liannu_temp;
                                    return result;
                                },
                                basic: {
                                    equipValue: 5
                                },
                                tag: {
                                    valueswap: 1
                                },
                            },
                            skills: ['liannu_skill'],
                        },
                    },
                    character: {
                        sp_liuqi: ['male', ['shu', 'qun'].randomGet(), 3, ['RElzwenji', 'RElztunjiang'], []],
                        xf_tangzi: ['male', ['wei', 'wu'].randomGet(), 4, ['RElzxingzhao'], []],
                        xf_huangquan: ['male', ['wei', 'shu'].randomGet(), 3, ['RElzdianhu', 'xinfu_jianji'], []],
                        xf_sufei: ['male', ['wu', 'qun'].randomGet(), 4, ['RElzlianpian'], []],
                    },
                    skill: {
                        _REaiye: {
                            ruleSkill: true,
                            trigger: { player: 'dying' },
                            filter(event, player) {
                                return player.hp < 1;
                            },
                            forced: true,
                            content() {
                                player.recover(1 - player.hp);
                            },
                            marktext: '叶',
                            intro: {
                                markcount(storage, player) {
                                    return game.REidentity[player.identity];
                                },
                                content(storage, player) {
                                    return '<li>当你进入濒死状态时，你将体力值回复至1点<br><li>当前' + lib.translate[player.identity + '2'] + '分数：' + game.REidentity[player.identity] + '分';
                                },
                            },
                        },
                        _REgain: {
                            ruleSkill: true,
                            trigger: { source: 'damageSource' },
                            filter(event, player) {
                                return event.player.identity != player.identity;
                            },
                            forced: true,
                            firstDo: true,
                            content() {
                                'step 0'
                                game.REidentity[player.identity] += trigger.num;
                                'step 1'
                                if (game.REidentity[player.identity] > 12) game.REidentity[player.identity] = 12;
                                'step 2'
                                player.chat('我们有' + game.REidentity[player.identity] + '分啦');
                                for (var i of game.players) i.markSkill('_REaiye');
                            },
                        },
                        _REwin: {
                            ruleSkill: true,
                            trigger: { global: 'roundStart' },
                            filter(event, player) {
                                return game.roundNumber >= 3;
                            },
                            forced: true,
                            content() {
                                var list = Object.keys(game.REidentity).sort((a, b) => game.REidentity[b] - game.REidentity[a]);
                                var winner = [list[0]], winnerLog = [list[0] + '2'];
                                for (var i = 1; i < list.length; i++) {
                                    if (game.REidentity[list[0]] == game.REidentity[list[i]]) {
                                        winner.push(list[i]);
                                        winnerLog.push(list[i] + '2');
                                    }
                                    else break;
                                }
                                game.log('本局游戏', '#g' + get.translation(winnerLog), '获胜');
                                game.over(winner.includes(game.me.identity));
                            },
                        },
                        liannu_skill: {
                            equipSkill: true,
                            audio: 'zhuge',
                            firstDo: true,
                            trigger: { player: 'useCard1' },
                            forced: true,
                            filter(event, player) {
                                return !event.audioed && event.card.name == 'sha' && player.countUsed('sha', true) > 1 && event.getParent().type == 'phase';
                            },
                            content() {
                                trigger.audioed = true;
                            },
                            mod: {
                                cardUsable(card, player, num) {
                                    var cardx = player.getEquip('liannu');
                                    if (card.name == 'sha' && (!cardx || player.hasSkill('liannu_skill', null, false) || (!_status.liannu_temp && !ui.selected.cards.includes(cardx)))) {
                                        return num + 3;
                                    }
                                },
                                cardEnabled2(card, player) {
                                    if (!_status.event.addCount_extra || player.hasSkill('liannu_skill', null, false)) return;
                                    if (card && card == player.getEquip('liannu')) {
                                        try {
                                            var cardz = get.card();
                                        }
                                        catch (e) {
                                            return;
                                        }
                                        if (!cardz || cardz.name != 'sha') return;
                                        _status.liannu_temp = true;
                                        var bool = lib.filter.cardUsable(get.autoViewAs({ name: 'sha' }, ui.selected.cards.concat([card])), player);
                                        delete _status.liannu_temp;
                                        if (!bool) return false;
                                    }
                                },
                            },
                        },
                        //龙舟四将
                        RElzwenji: {
                            audio: 'spwenji',
                            trigger: { player: 'phaseUseBegin' },
                            direct: true,
                            filter(event, player) {
                                return game.hasPlayer(function (current) {
                                    return current != player && current.countCards('he') && current.identity == player.identity;
                                });
                            },
                            content() {
                                'step 0'
                                player.chooseTarget(get.prompt2('RElzwenji'), function (card, player, target) {
                                    return target != player && target.identity == player.identity;
                                });
                                'step 1'
                                if (result.bool) {
                                    var target = result.targets[0];
                                    event.target = target;
                                    player.logSkill('RElzwenji', target);
                                    target.chooseCard('he', true, '问计：将一张牌交给' + get.translation(player));
                                }
                                else event.finish();
                                'step 2'
                                if (result.bool) {
                                    player.addTempSkill('spwenji_respond');
                                    player.storage.spwenji_respond = result.cards[0].name;
                                    target.give(result.cards, player, true);
                                }
                            },
                        },
                        RElzlianpian: {
                            global: 'RElzlianpian_ai',
                            audio: 'xinfu_lianpian',
                            trigger: { global: 'useCardToPlayered' },
                            filter(event, player) {
                                if (!lib.skill.RElztunjiang.filterx(event, player)) return false;
                                if (!event.targets || !event.targets.length || !event.isFirstTarget || !event.isPhaseUsing(event.player)) return false;
                                var evt = event.player.getLastUsed(1);
                                if (!evt || !evt.targets || !evt.targets.length || !evt.isPhaseUsing(event.player)) return false;
                                for (var i = 0; i < event.targets.length; i++) {
                                    if (evt.targets.includes(event.targets[i])) return true;
                                }
                                return false;
                            },
                            frequent: true,
                            logTarget: 'player',
                            content() {
                                trigger.player.draw();
                            },
                            subSkill: {
                                ai: {
                                    mod: {
                                        aiOrder(player, card, num) {
                                            if (player != _status.currentPhase || player.getHistory('useCard').length < 1 || !game.hasPlayer(function (current) {
                                                return current.identity == player.identity && current.hasSkill('RElzlianpian');
                                            })) return;
                                            if (player.isPhaseUsing()) {
                                                var evt = player.getLastUsed();
                                                if (evt && evt.targets && evt.targets.length && evt.isPhaseUsing(player) && game.hasPlayer(function (current) {
                                                    return evt.targets.includes(current) && player.canUse(card, current) && get.effect(current, card, player, player) > 0;
                                                })) return num + 10;
                                            }
                                        },
                                    },
                                },
                            },
                        },
                        RElztunjiang: {
                            audio: 'sptunjiang',
                            trigger: { global: 'phaseJieshuBegin' },
                            filter(event, player) {
                                return event.player.isAlive() && !event.player.getStat('damage') && lib.skill.RElztunjiang.filterx(event, player);
                            },
                            filterx(event, player) {
                                return event.player.identity == player.identity;
                            },
                            direct: true,
                            content() {
                                'step 0'
                                player.chooseTarget(function (card, player, target) {
                                    return target == player || target == _status.event.source;
                                }, '屯江：请选择一个目标令其摸两张牌').set('ai', function (target) {
                                    return 114514 - target.countCards();
                                }).set('source', trigger.player);
                                'step 1'
                                if (result.targets.length) {
                                    player.logSkill('RElztunjiang', result.targets[0]);
                                    result.targets[0].draw(2);
                                }
                            },
                        },
                        RElzdianhu: {
                            audio: 'xinfu_dianhu',
                            inherit: 'xinfu_dianhu',
                            content() {
                                'step 0'
                                player.chooseTarget('请选择【点虎】的目标', lib.translate.RElzdianhu_info, true, function (card, player, target) {
                                    return target.identity != player.identity && !target.hasSkill('RElzdianhu2');
                                }).set('ai', function (target) {
                                    var att = get.attitude(_status.event.player, target);
                                    if (att < 0) return -att + 3;
                                    return Math.random();
                                });
                                'step 1'
                                if (result.bool) {
                                    var target = result.targets[0];
                                    player.line(target, 'green');
                                    game.log(target, '成为了', '#g【点虎】', '的目标');
                                    target.storage.RElzdianhu2 = player;
                                    target.addSkill('RElzdianhu2');
                                }
                            },
                        },
                        RElzdianhu2: {
                            charlotte: true,
                            onremove: true,
                            mark: 'character',
                            intro: { content: '当你受到来自$或其队友的1点伤害后，伤害来源摸一张牌' },
                            audio: 'xinfu_dianhu',
                            trigger: { player: 'damageAfter' },
                            filter(event, player) {
                                if (player.storage.RElzdianhu2 && player.storage.RElzdianhu2.isIn()) return event.source.identity == player.storage.RElzdianhu2.identity;
                                return false;
                            },
                            forced: true,
                            content() {
                                var target = player.storage.RElzdianhu2;
                                target.logSkill('RElzdianhu', trigger.source);
                                trigger.source.draw(trigger.num);
                            },
                            ai: {
                                threaten(player, target) {
                                    if (game.hasPlayer(function (current) {
                                        return current == target.storage.RElzdianhu2 && current.identity == player.identity;
                                    })) return 2.5;
                                },
                            },
                        },
                        RElzxingzhao: {
                            derivation: 'xunxun',
                            group: ['RElzxingzhao_xunxun', 'RElzxingzhao_1', 'RElzxingzhao_2'],
                            audio: 'xinfu_xingzhao',
                            trigger: { global: 'useCard' },
                            filter(event, player) {
                                return game.REidentity[player.identity] >= 4 && event.player.identity == player.identity;
                            },
                            forced: true,
                            logTarget: 'player',
                            content() {
                                trigger.player.draw();
                            },
                            subSkill: {
                                xunxun: {
                                    trigger: { global: 'phaseDrawBegin1' },
                                    filter(event, player) {
                                        return game.REidentity[player.identity] >= 2 && event.player.identity == player.identity;
                                    },
                                    direct: true,
                                    content() {
                                        'step 0'
                                        trigger.player.chooseBool(get.prompt2('xunxun'));
                                        'step 1'
                                        if (result.bool) {
                                            trigger.player.logSkill('RElzxingzhao');
                                            var next = game.createEvent('RElzxingzhao_xunxun');
                                            next.player = trigger.player;
                                            next.setContent(lib.skill.xunxun.content);
                                        }
                                    },
                                },
                                '1': {
                                    audio: 'xinfu_xingzhao2',
                                    trigger: { global: '_REwinBefore' },
                                    filter(event, player) {
                                        return game.REidentity[player.identity] >= 8;
                                    },
                                    forced: true,
                                    skillAnimation: true,
                                    animationColor: 'water',
                                    content() {
                                        trigger.cancel();
                                        game.log('本局游戏', '#g' + get.translation(player.identity + '2'), '获胜');
                                        game.over(game.me.identity == player.identity);
                                    },
                                },
                                '2': {
                                    audio: 'xinfu_xingzhao2',
                                    trigger: { global: 'phaseDiscardBefore' },
                                    filter(event, player) {
                                        return game.REidentity[player.identity] >= 6 && event.player.identity == player.identity;
                                    },
                                    forced: true,
                                    logTarget: 'player',
                                    content() {
                                        trigger.cancel();
                                        game.log(trigger.player, '跳过了弃牌阶段');
                                    },
                                },
                            },
                        },
                    },
                    translate: {
                        zong: '粽',
                        zong_info: '出牌阶段，对自己或队友使用，目标角色回复1点体力。',
                        xionghuangjiu: '雄黄酒',
                        xionghuangjiu_info: '出牌阶段对自己使用，本回合使用的下一张【杀】伤害+1。',
                        tongzhougongji: '同舟共济',
                        tongzhougongji_info: '出牌阶段，对自己和队友使用，目标角色各摸一张牌。',
                        lizhengshangyou: '力争上游',
                        lizhengshangyou_info: '出牌阶段，对所有角色使用，你和与你势力相同的角色各摸x张牌，其他角色摸一张牌（x为当前场上势力数）。',
                        nishuixingzhou: '逆水行舟',
                        nishuixingzhou_info: '出牌阶段，对一名与你势力不同的角色使用，对其和与其势力相同的角色各造成1点伤害。',
                        liannu: '连弩',
                        liannu_skill: '连弩',
                        liannu_info: '锁定技，出牌阶段，你使用【杀】的次数上限+3。',
                        liannu_skill_info: '锁定技，出牌阶段，你使用【杀】的次数上限+3。',
                        _REaiye: '艾叶',
                        RElzwenji: '问计',
                        RElzwenji_info: '出牌阶段开始时，你可以令队友交给你一张牌。你于本回合内使用与该牌名称相同的牌时不能被其他角色响应。',
                        RElzlianpian: '联翩',
                        RElzlianpian_info: '你或队友于出牌阶段使用牌连续指定同一名角色为目标后，你可以令使用者摸一张牌。',
                        RElztunjiang: '屯江',
                        RElztunjiang_info: '你或队友的回合结束时，若其于本回合内未造成过伤害，则你可以令你或令其摸两张牌。',
                        RElzdianhu: '点虎',
                        RElzdianhu2: '点虎',
                        RElzdianhu_info: '锁定技，游戏开始时，你选择一名敌方角色。你或队友对其造成1点伤害后，摸一张牌。',
                        RElzxingzhao: '兴棹',
                        RElz_xunxun: '恂恂',
                        RElzxingzhao_info: '锁定技，若本局游戏中你和队友造成的伤害数总和：<br><li>不少于2，你和队友视为拥有技能〖恂恂〗；<br><li>不少于4，你和队友使用装备牌时摸一张牌；<br><li>不少于6，你和队友跳过弃牌阶段；<br><li>不少于8，游戏即将结束时，你和队友成为唯一的第一名。',
                    },
                    element: {
                        player: {
                            logAi() { },
                            getFriends(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer";
                                var self = false;
                                if (func === true) {
                                    func = null;
                                    self = true;
                                }
                                return game[method](function (current) {
                                    if (!self && current == player) return false;
                                    return current.identity == player.identity;
                                }, [], includeOut);
                            },
                            getEnemies(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer";
                                return game[method](function (current) {
                                    return current.identity != this.identity;
                                }, [], includeOut);
                            },
                            isFriendOf(player, includeDie, includeOut) {
                                return this.getFriends(true, includeDie, includeOut).includes(player);
                            },
                            isEnemyOf(player, includeDie, includeOut) {
                                return this.getEnemies(true, includeDie, includeOut).includes(player);
                            },
                            dieAfter() { },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.character, changeFunction.lib.character);
            Object.assign(lib.card, changeFunction.lib.card);
            for (const i in changeFunction.lib.card) game.finishCard(i);
            Object.assign(lib.skill, changeFunction.lib.skill);
            for (const i in changeFunction.lib.skill) game.finishSkill(i);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            //定义阵容
            let target = game.players.randomGet(), list = ['wei', 'shu', 'wu', 'qun', 'wei', 'shu', 'wu', 'qun'];
            game.zhu = _status.firstAct = target;
            game.players.sortBySeat(target);
            for (const i of game.players) {
                i.identity = list.randomRemove();
                Object.assign(i, changeFunction.lib.element.player);
                i.setSeatNum(game.players.indexOf(i) + 1);
                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                i.setIdentity();
                i.identityShown = true;
            }
            game.showIdentity(true);
        },
    },
};
export default brawl;