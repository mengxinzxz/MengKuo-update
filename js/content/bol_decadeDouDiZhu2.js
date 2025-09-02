import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '<span style="font-size:22px;">超级斗地主</span>',
    mode: 'identity',
    intro: [
        '游戏规则：<br>' +
        '游戏开始时，牌局将为玩家分发五张初始武将牌，玩家可以根据武将信息决定是否叫分抢地主。<br>' +
        '从随机一名玩家开始依次开始叫分抢地主，玩家选择叫分倍数，叫分最多的玩家成为地主，最多为3倍，也可放弃叫分。<br>' +
        '每位玩家仅有一次叫分机会，且叫分必须大于上家的叫分，否则放弃叫分。<br>' +
        '叫分过程中，若有玩家叫分3倍则该玩家直接成为地主。<br>' +
        '若三名玩家都放弃叫分，第一个叫分的玩家以最低倍数成为地主。<br>' +
        '确认地主后，地主玩家默认成为一号位，其余两位玩家自动成为农民玩家，两位农民玩家的选将框互相知悉，然后三位玩家依次可以选择是否明牌：若地主选择明牌，本局倍数翻1倍；若农民选择明牌，本局倍数翻0.5倍。<br>' +
        '所有角色的初始手牌数为十张。',
        '地主选将框在原有武将上额外增加两个随机武将，且获得地主技能：<br>' +
        '【飞扬】：判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。<br>' +
        '【跋扈】：锁定技，你的摸牌阶段的额定摸牌数为5，出牌阶段使用【杀】的额定次数+4。',
    ],
    init() {
        lib.configOL.number = 3;
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            //函数覆盖
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return from.identity === to.identity ? 10 : -10;
                    },
                },
                game: {
                    //倍率相关
                    decade_doudizhu: 1,
                    max_beishu: 1,
                    //胜负检测
                    checkResult() {
                        const identity = game.players.map(i => i.identity).unique();
                        if (identity.length === 1) game.over(get.population(game.me.identity) > 0);
                    },
                    //摸牌
                    gameDraw(player) {
                        const next = game.createEvent("gameDraw");
                        next.player = player || game.me;
                        next.num = 10;
                        next.setContent("gameDraw");
                        return next;
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            const map = lib.characterReplace, list3 = Object.values(map).flat(), getBeiShu = { '一倍': 1, '两倍': 2, '三倍': 3, '不叫': 0 };
                            for (const i of game.players) {
                                i.characterlist = _status.HDcharacterlist.filter(name => {
                                    return game._use_DDZname || map[name] || !list3.includes(name);
                                }).randomGets(5);
                                _status.HDcharacterlist.removeArray(i.characterlist);
                                const content = ['你的初始武将', [i.characterlist, 'character']];
                                await i.chooseControl('ok').set('dialog', content);
                            }
                            if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '抢地主阶段';
                            let target = game.players.randomGet(), beginner = target, control = ['一倍', '两倍', '三倍', '不叫'];
                            while (true) {
                                const result = await target.chooseControl(control).set('ai', () => {
                                    return _status.event.controls.randomGet();
                                }).set('prompt', '是否' + (control.length == 4 ? '叫' : '抢') + '地主？').forResult();
                                target.chat(result.control);
                                const num = control.indexOf(result.control);
                                target.max_beishu = getBeiShu[result.control];
                                if (result.control == '三倍') {
                                    game.zhu = target;
                                    game.max_beishu = 3;
                                    break;
                                }
                                else {
                                    await game.delay(1.5);
                                    if (result.control != '不叫') {
                                        let temp = [];
                                        for (var i = 0; i < control.length; i++) {
                                            if (i > num) temp.push(control[i]);
                                        }
                                        control = temp;
                                    }
                                    if (target.next == beginner) {
                                        if (control.length == 4) {
                                            game.zhu = beginner;
                                        }
                                        else {
                                            var winner = game.players.find(current => {
                                                return !game.players.some(currentx => current.max_beishu < currentx.max_beishu);
                                            });
                                            game.zhu = winner;
                                            game.max_beishu = winner.max_beishu;
                                        }
                                        break;
                                    }
                                    else target = target.next;
                                }
                            }
                            if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局票数：' + game.max_beishu * 100;
                            game.broadcastAll(list => {
                                for (const name in lib.characterReplace) {
                                    lib.characterReplace[name] = lib.characterReplace[name].filter(i => list.includes(i));
                                }
                            }, _status.characterlist);
                            game.zhu.characterlist.addArray((() => {
                                const gainList = _status.HDcharacterlist.filter(name => {
                                    return game._use_DDZname || map[name] || !list3.includes(name);
                                }).randomGets(2);
                                _status.HDcharacterlist.removeArray(gainList);
                                return gainList;
                            })());
                            lib.onover.push(bool => {
                                var numx = game.max_beishu * 100;
                                if (bool == undefined) {
                                    for (var i of game.filterPlayer2()) i.chat('+0');
                                }
                                else {
                                    const player = game.me;
                                    if (game.zhu.isAlive()) {
                                        for (var i of game.filterPlayer2()) {
                                            if (i == game.zhu) i.chat('+' + numx * 2);
                                            else i.chat('-' + numx);
                                        }
                                    }
                                    if (!game.zhu.isAlive()) {
                                        for (var i of game.filterPlayer2()) {
                                            if (i == game.zhu) i.chat('-' + numx * 2);
                                            else i.chat('+' + numx);
                                        }
                                    }
                                    const num = numx * (game.zhu === player ? 2 : 1);
                                    game.bol_say(`战斗${bool ? '胜利' : '失败'}，${bool ? '获得' : '失去'}${num}萌币`);
                                    game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + num * (bool ? 1 : -1));
                                }
                            });
                            game.players.sortBySeat(game.zhu);
                            game.players.forEach((i, index) => {
                                i.setSeatNum(index + 1);
                                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                                i.identity = (game.zhu == i ? 'zhu' : 'fan');
                                i.setIdentity();
                                i.identityShown = true;
                            });
                            ui.arena.classList.add('choose-character');
                            var getCharacter = function (list) {
                                var listx = [], num = 0;
                                for (var name of list) {
                                    var numx = get.rank(name, true);
                                    if (numx > num) {
                                        num = numx;
                                        listx = [name];
                                    }
                                    else if (numx == num) listx.push(name);
                                }
                                return listx;
                            };
                            var createDialog = ['请选择你的武将'];
                            if (player.identity == 'fan') {
                                var fellow = game.players.find(current => current != player && current.identity == 'fan');
                                createDialog.push('<div class="text center">玩家武将</div>');
                                createDialog.push([player.characterlist, game._use_DDZname ? 'character' : 'characterx']);
                                createDialog.push('<div class="text center">队友武将</div>');
                                createDialog.push([fellow.characterlist, 'character']);
                            }
                            else createDialog.push([player.characterlist, game._use_DDZname ? 'character' : 'characterx']);
                            if (lib.onfree) {
                                lib.onfree.push(() => {
                                    event.dialogxx = ui.create.characterDialog('heightset');
                                    if (ui.cheat2) {
                                        ui.cheat2.animate('controlpressdownx', 500);
                                        ui.cheat2.classList.remove('disabled');
                                    }
                                });
                            }
                            else event.dialogxx = ui.create.characterDialog('heightset');
                            ui.create.cheat = function () {
                                _status.createControl = ui.cheat2;
                                ui.cheat = ui.create.control('更换', function () {
                                    if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) return;
                                    const characters = game.me.characterlist = _status.HDcharacterlist.randomGets(game.me.characterlist.length);
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    _status.event.dialog.buttons = ui.create.buttons(characters, game._use_DDZname ? 'character' : 'characterx', buttons);
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
                            };
                            if (!ui.cheat) ui.create.cheat();
                            if (!ui.cheat2) ui.create.cheat2();
                            const result2 = await player.chooseButton(createDialog, true).set('filterButton', button => {
                                return !_status.event.list.includes(button.link);
                            }).set('onfree', true).set('ai', button => {
                                return getCharacter(get.player().characterlist).includes(button.link) ? get.rank(button.link, true) : -1;
                            }).set('list', fellow?.characterlist ?? []).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            game.addRecentCharacter(...result2.links);
                            _status.characterlist.removeArray(result2.links);
                            player.init(...result2.links);
                            for (var i of game.players) {
                                if (i !== player) {
                                    let list = i.characterlist.slice().removeArray(result2.links);
                                    let name = getCharacter(list).randomGet();
                                    _status.characterlist.remove(name);
                                    i.init(name);
                                }
                            }
                            game.zhu.maxHp = game.zhu.maxHp + 1;
                            game.zhu.hp = game.zhu.hp + 1;
                            game.zhu.update();
                            game.zhu.addSkill('decade_feiyang');
                            game.zhu.addSkill('decade_bahu');
                            for (const i of game.players) {
                                delete i.characterlist;
                                delete i.max_beishu;
                                const result3 = await i.chooseBool('超级斗地主：是否明牌？', '令本局游戏的倍数翻' + (game.zhu == player ? '1' : '0.5') + '倍').set('choice', Math.random() < 0.4).forResult();
                                if (result3?.bool) {
                                    i.chat('明牌');
                                    game.log(i, '选择', '#g明牌');
                                    i.addSkill('decade_dizhu_mingpai');
                                    game.decade_doudizhu += (game.zhu === i ? 1 : 0.5);
                                }
                                else {
                                    i.chat('不明牌');
                                    game.log(i, '选择', '#y不明牌');
                                }
                                await game.delay(1.5);
                            }
                            if (game.decade_doudizhu == 1) game.log('本局没有额外加倍');
                            else {
                                game.log('本局斗地主倍数翻' + game.decade_doudizhu + '倍');
                                game.max_beishu = game.max_beishu * game.decade_doudizhu;
                                if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局票数：' + game.max_beishu * 100;
                            }
                            if (!ui.giveupSystem && get.population(player.identity) === 1) {
                                ui.giveupSystem = ui.create.system('投降', function () {
                                    game.log(player, '投降');
                                    game.over(false);
                                }, true);
                            }
                            delete _status.HDcharacterlist;
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    skill: {
                        decade_feiyang: {
                            charlotte: true,
                            trigger: { player: 'phaseJudgeBegin' },
                            filter(event, player) {
                                return player.countCards('j') && player.countDiscardableCards(player, 'h') >= 2;
                            },
                            async cost(event, trigger, player) {
                                event.result = await player.chooseToDiscard(get.prompt2(event.skill), 2).set('ai', card => {
                                    return 6 - get.value(card);
                                }).set('logSkill', event.skill).forResult();
                            },
                            popup: false,
                            async content(event, trigger, player) {
                                await player.discard(player.getCards('j'));
                            },
                        },
                        decade_bahu: {
                            charlotte: true,
                            mod: {
                                cardUsable(card, player, num) {
                                    if (card.name == 'sha') return num + 4;
                                },
                            },
                            trigger: { player: 'phaseDrawBegin1' },
                            filter(event, player) {
                                return !event.numFixed;
                            },
                            forced: true,
                            content() {
                                trigger.num = 5;
                                trigger.numFixed = true;
                            },
                        },
                        decade_dizhu_mingpai: {
                            charlotte: true,
                            mark: true,
                            marktext: '牌',
                            intro: {
                                mark(dialog, content, player) {
                                    var hs = player.getCards('h');
                                    if (hs.length) {
                                        dialog.addText('明牌勇气可嘉，胜负代价更高！本局游戏倍数翻倍！');
                                        dialog.addSmall(hs);
                                    }
                                    else dialog.addText('无手牌');
                                },
                                content(content, player) {
                                    var hs = player.getCards('h');
                                    if (hs.length) return get.translation(hs);
                                    else return '无手牌';
                                },
                            },
                            global: 'decade_dizhu_mingpai_mingpai',
                            subSkill: {
                                mingpai: {
                                    ai: {
                                        viewHandcard: true,
                                        skillTagFilter(player, arg, target) {
                                            return target != player && target.hasSkill('decade_dizhu_mingpai');
                                        },
                                    },
                                },
                            },
                        },
                        _decade_doudizhu_view: {
                            ai: {
                                viewHandcard: true,
                                skillTagFilter(player, arg, target) {
                                    return target != player && target.identity == player.identity;
                                },
                            },
                        },
                    },
                    translate: {
                        cai: ' ',
                        zhu2: '地主',
                        fan2: '农民',
                        decade_feiyang: '飞扬',
                        decade_feiyang_info: '判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。',
                        decade_bahu: '跋扈',
                        decade_bahu_info: '锁定技，你的摸牌阶段的额定摸牌数为5，出牌阶段使用【杀】的额定次数+4。',
                        decade_dizhu_mingpai: '明牌',
                    },
                    element: {
                        player: {
                            logAi() { },
                            dieAfter() {
                                game.checkResult();
                                if (!ui.giveupSystem && get.population(game.me.identity) === 1) {
                                    ui.giveupSystem = ui.create.system('投降', function () {
                                        game.log(game.me, '投降');
                                        game.over(false);
                                    }, true);
                                }
                            },
                            dieAfter2() { },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.skill, changeFunction.lib.skill);
            for (const i in changeFunction.lib.skill) game.finishSkill(i);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            game.players.forEach(i => {
                i.identity = 'cai';
                i.setIdentity();
                i.identityShown = true;
                Object.assign(i, changeFunction.lib.element.player);
            });
            game.showIdentity(true);
            if (get.is.phoneLayout()) ui.decade_ddzInfo = ui.create.div('.touchinfo.left', ui.window);
            else ui.decade_ddzInfo = ui.create.div(ui.gameinfo);
            ui.decade_ddzInfo.innerHTML = '准备阶段';
            //选将加载
            if (!_status.characterlist) lib.skill.pingjian.initList();
            _status.HDcharacterlist = _status.characterlist.slice();
            if (lib.config.extension_活动萌扩_use_DDZname) {
                game._use_DDZname = true;
                var map = lib.config.extension_活动萌扩_DDZname || [
                    'shen_zhaoyun', 'shen_ganning', 'liuyan', 'xizhicai', 're_wuyi', 'xin_lingtong', 'zhoushan', 'chengui',
                    'dc_liuye', 'dc_tengfanglan', 'shen_machao', 'shen_zhangfei', 'shen_zhangjiao', 'shen_dengai', 're_liuzan', 'caojinyu',
                    're_sunyi', 'caomao', 'xushao', 'zhujianping', 'tenggongzhu', 'zhangxuan', 'dc_zhouxuān', 'zerong',
                    'dc_luotong', 'ruanji', 'dc_xujing', 'xuelingyun', 'yue_caiwenji', 'star_caoren'
                ];
                _status.HDcharacterlist = _status.HDcharacterlist.filter(name => map.includes(name));
            }
        },
    },
};
export default brawl;