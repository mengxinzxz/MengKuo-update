import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '<span style="font-size:22px;">微信斗地主</span><br>额外技能',
    mode: 'identity',
    intro: [
        '游戏规则：<br>' +
        '从随机一名玩家开始依次开始叫分抢地主，玩家选择叫分倍数，叫分最多的玩家成为地主，最多为3倍，也可放弃叫分。<br>' +
        '每位玩家仅有一次叫分机会，且叫分必须大于上家的叫分，否则放弃叫分。<br>' +
        '叫分过程中，若有玩家叫分3倍则该玩家直接成为地主。<br>' +
        '若三名玩家都放弃叫分，第一个叫分的玩家以最低倍数成为地主。<br>' +
        '确认地主后，地主玩家成为一号位，其余玩家自动成为农民玩家。地主/农民初始拥有五/三个备选武将，所有玩家于选将同时从随机十个技能中选择一个作为自己的额外技能开始本局游戏<br>',
        '地主的初始体力上限和体力值+1，且拥有地主专属技能：<br>' +
        '【飞扬】：锁定技。①准备阶段，你摸一张牌。②你使用【杀】的额定次数+1。<br>' +
        '【跋扈】：判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。',
        '农民死亡后，其队友可以选择摸两张牌或回复1点体力',
    ],
    init() {
        lib.configOL.number = 3;
        lib.config.extension_活动萌扩_chooseSex ??= 'bol_unknown_male0';
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            //函数覆盖
            if (!_status.characterlist) lib.skill.pingjian.initList();
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return from.identity === to.identity ? 10 : -10;
                    },
                },
                game: {
                    //技能池
                    doudizhuSkills: (() => {
                        let characters = _status.characterlist, skills = [];
                        for (let i = 0; i < characters.length; i++) {
                            let name = characters[i], skillsx = lib.character[name]?.skills ?? [];
                            if (!skillsx.length) continue;
                            let list = skillsx.slice();
                            for (let j = 0; j < skillsx.length; j++) {
                                let info = get.info(skillsx[j]);
                                if (!info) {
                                    skillsx.splice(j, 1);
                                    list.splice(j--, 1);
                                    continue;
                                }
                                if (typeof info.derivation == 'string') list.push(info.derivation);
                                else if (Array.isArray(info.derivation)) list.addArray(info.derivation);
                            }
                            for (let j = 0; j < list.length; j++) {
                                if (skills.includes(list[j])) continue;
                                let info = lib.skill[list[j]];
                                if (!info || info.charlotte || info.zhuSkill || info.dutySkill || info.unique || info.juexingji || info.equipSkill || info.hiddenSkill || info.ai?.combo || info.ai?.neg) continue;
                                skills.push(list[j]);
                                lib.card['skillCard_' + list[j]] = {
                                    fullimage: true,
                                    image: 'character:' + name,
                                };
                                lib.translate['skillCard_' + list[j]] = lib.translate[list[j]];
                                lib.translate['skillCard_' + list[j] + '_info'] = lib.translate[list[j] + '_info'];
                            }
                        }
                        return skills;
                    })(),
                    //倍率相关
                    max_beishu: 1,
                    //胜负检测
                    checkResult() {
                        const identity = game.players.map(i => i.identity).unique();
                        if (identity.length === 1) game.over(get.population(game.me.identity) > 0);
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            game.broadcastAll(list => {
                                for (const name in lib.characterReplace) {
                                    lib.characterReplace[name] = lib.characterReplace[name].filter(i => list.includes(i));
                                }
                            }, _status.characterlist);
                            const map = lib.characterReplace, list3 = Object.values(map).flat();
                            let list = _status.characterlist.filter(name => map[name] || !list3.includes(name));
                            let target = game.players.randomGet(), beginner = target, control = ['一倍', '两倍', '三倍', '不叫'], getBeiShu = { '一倍': 1, '两倍': 2, '三倍': 3, '不叫': 0 };
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
                                i.OriginalSkills = game.doudizhuSkills.randomRemove(10);
                                i.OriginalCharacters = list.randomRemove(game.zhu == i ? 5 : 3);
                            });
                            game.showIdentity();
                            let map2 = {}, choosed = [];
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
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    list.addArray(game.me.OriginalCharacters);
                                    const list2 = game.me.OriginalCharacters = list.randomRemove(game.me.OriginalCharacters.length);
                                    _status.event.dialog.buttons = ui.create.buttons(list2, 'characterx', buttons);
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
                            ui.arena.classList.add('choose-character');
                            for (const target of game.players.slice().sortBySeat(player)) {
                                const dialog = event.dialog = ui.create.dialog('请选择你的初始角色和技能', 'hidden');
                                dialog.add([target.OriginalCharacters, 'character']);
                                dialog.add([target.OriginalSkills.map(name => ['', '', 'skillCard_' + name]), 'vcard']);
                                if (target === game.me) {
                                    if (!ui.cheat) ui.create.cheat();
                                    if (!ui.cheat2) ui.create.cheat2();
                                }
                                const result2 = await target.chooseButton(dialog, true, 2).set('filterButton', button => {
                                    const { choosed: list } = get.event(), choice = button.link, goon = !!ui.selected.buttons.length === Array.isArray(choice);
                                    if (list.includes(choice) || !goon) return false;
                                    return (!ui.selected.buttons.length) ? true : !(get.character(ui.selected.buttons[0].link)?.skills ?? []).includes(choice[2]);
                                }).set('choosed', choosed).forResult();
                                if (ui.cheat) {
                                    ui.cheat.close();
                                    delete ui.cheat;
                                }
                                if (ui.cheat2) {
                                    ui.cheat2.close();
                                    delete ui.cheat2;
                                }
                                if (result2?.bool && result2.links?.length) {
                                    choosed.add(result2.links[0]);
                                    map2[target.playerid] = [result2.links[0], result2.links[1][2].slice(10)];
                                }
                            }
                            for (const i of game.players) {
                                delete i.max_beishu
                                if (map2[i.playerid]?.length > 0) {
                                    if (i === game.me) game.addRecentCharacter(map2[i.playerid][0]);
                                    _status.characterlist.remove(map2[i.playerid][0]);
                                    i.init(map2[i.playerid][0]);
                                    i.addSkill(map2[i.playerid][1]);
                                }
                                if (i === game.zhu) {
                                    game.zhu.maxHp = game.zhu.maxHp + 1;
                                    game.zhu.hp = game.zhu.hp + 1;
                                    game.zhu.addSkill(['decade_feiyang', 'decade_bahu']);
                                    game.zhu.update();
                                }
                            }
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
                                    if (card.name == 'sha') return num + 1;
                                },
                            },
                            trigger: { player: 'phaseZhunbeiBegin' },
                            forced: true,
                            content() {
                                player.draw();
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
                        decade_bahu_info: '锁定技。①准备阶段，你摸一张牌。②你使用【杀】的额定次数+1。',
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
                            dieAfter2() {
                                if (this.identity !== 'fan') return;
                                const player = this, target = game.findPlayer(current => current !== player && current.identity == 'fan');
                                if (target) target.chooseDrawRecover(2);
                            },
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
                Object.assign(i, changeFunction.lib.element.player);
            });
            game.showIdentity();
            if (get.is.phoneLayout()) ui.decade_ddzInfo = ui.create.div('.touchinfo.left', ui.window);
            else ui.decade_ddzInfo = ui.create.div(ui.gameinfo);
            ui.decade_ddzInfo.innerHTML = '抢地主阶段';
        },
    },
};
export default brawl;