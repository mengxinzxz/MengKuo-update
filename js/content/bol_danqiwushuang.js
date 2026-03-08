import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '单骑无双',
    mode: 'identity',
    intro: [
        '1对1挑战模式，过程中可以成长变强，制定针对对手的策略，击败对手，赢取胜利',
        '游戏开始时，所有玩家可以查看三个备选武将并开始抢先手，双方依次竞价抢先手，若有玩家出最高价则立刻结束，无玩家抢先手则随机先后手',
        '牌局进行过程中，双方玩家可获得【成长】，成长包括战法、技能、手牌三种类型',
        '在每个回合，双方均可获得1枚虎符，可在购买阶段中使用虎符购买成长，商店可消耗1枚虎符手动刷新，每名玩家至多拥有2个额外技能',
    ],
    init() {
        lib.configOL.number = 2;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            //函数覆盖
            const originFunction = {
                lib: {
                    element: {
                        player: {
                            init: lib.element.player.init,
                            uninit: lib.element.player.uninit,
                        },
                    },
                },
            };
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return from.identity === to.identity ? 10 : -10;
                    },
                    //获取战法价值
                    ZhanFaCost(zhanfa2, first) {
                        let zhanfa = zhanfa2.slice(zhanfa2.startsWith('skillcard_') ? 'skillcard_'.length : 0);
                        if (first || lib.translate[zhanfa]?.includes('喜从天降')) return 0;
                        if (_status._hufu_skillcardShopping?.[zhanfa]) return _status._hufu_skillcardShopping[zhanfa].cost || 1;
                        return { 'zf_common': 1, 'zf_rare': 2, 'zf_epic': 3, 'zf_legend': 4 }[lib.zhanfa.getRarity(zhanfa)] || 1;
                    },
                    //获取获得的虎符数
                    HuFuGainNum(event, player) {
                        let num = 1, isRound = game.roundNumber > 3;
                        if (game.roundNumber === 3 && lib.onround.every(i => i(event, player))) {
                            isRound = _status.roundSkipped;
                            if (_status.isRoundFilter) {
                                isRound = _status.isRoundFilter(event, player);
                            }
                            else if (_status.seatNumSettled) {
                                let seatNum = player.getSeatNum();
                                if (seatNum != 0) {
                                    if (get.itemtype(_status.lastPhasedPlayer) != "player" || seatNum < _status.lastPhasedPlayer.getSeatNum()) isRound = true;
                                    _status.lastPhasedPlayer = player;
                                }
                            }
                            else if (player === _status.roundStart) isRound = true;
                        }
                        if (isRound) num++;
                        num += player.getSkills(null, null, false).reduce((sum, skill) => sum + (lib.skill[skill]?.getExtraDanQiHuFu?.(player) ?? 0), 0);
                        return num;
                    },
                    //获取商店的商品数
                    HuFuShopNum(player) {
                        return 3 + player.getSkills(null, null, false).reduce((sum, skill) => sum + (lib.skill[skill]?.getExtraDanQiShop ?? 0), 0);
                    },
                    //获取商店刷新的物品品质
                    HuFuShopping(player, extra) {
                        let list = [...lib.zhanfa.getList()];
                        if (extra) {
                            list.addArray(Object.keys(_status._hufu_skillcardShopping).map(item => {
                                const info = _status._hufu_skillcardShopping[item];
                                switch (info.type) {
                                    case 'card':
                                        return [lib.translate[lib.card[item].type] ?? '', `${info.cost}虎符`, item, info.nature];
                                    case 'skill':
                                        return ['技能', `${info.cost}虎符`, `skillcard_${item}`];
                                    default:
                                        return item;
                                }
                            }));
                        }
                        let round = game.roundNumber + 1;
                        return list.filter(zhanfa2 => {
                            let zhanfa;
                            let sum = (() => {
                                if (Array.isArray(zhanfa2)) {
                                    zhanfa = zhanfa2[2].slice(zhanfa2[2].startsWith('skillcard_') ? 'skillcard_'.length : 0);
                                    return _status._hufu_skillcardShopping[zhanfa].cost || 1;
                                }
                                zhanfa = zhanfa2;
                                return { 'zf_common': 1, 'zf_rare': 2, 'zf_epic': 3, 'zf_legend': 4 }[lib.zhanfa.getRarity(zhanfa)] || 1;
                            })();
                            if (player.hasSkill(zhanfa, null, false, false)) return false;
                            switch (Math.sign(round - 3)) {
                                case -1: return sum <= 2;
                                case 0: return sum <= 3;
                                case 1: return true;
                            }
                        });
                    },
                },
                game: {
                    //检测胜负
                    checkResult() {
                        game.over(game.players.includes(game.me._trueMe || game.me));
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            ui.arena.classList.add('choose-character');
                            if (!_status.characterlist) lib.skill.pingjian.initList();
                            _status.HDcharacterlist = _status.characterlist.slice();
                            const map = lib.characterReplace, list3 = Object.values(map).flat(), getBeiShu = { '一倍': 1, '两倍': 2, '三倍': 3, '不叫': 0 };
                            for (const name in lib.characterReplace) {
                                lib.characterReplace[name] = lib.characterReplace[name].filter(i => _status.characterlist.includes(i));
                            }
                            for (const i of game.players) {
                                i.characterlist = _status.HDcharacterlist.filter(name => {
                                    return map[name] || !list3.includes(name);
                                }).randomGets(3);
                                _status.HDcharacterlist.removeArray(i.characterlist);
                            }
                            const dialog = event.dialog = ui.create.dialog('你的初始武将', [player.characterlist, 'character']);
                            await game.delay(2.5);
                            if (!_status.auto) dialog.content.childNodes[0].textContent = `抢先手阶段`;
                            if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '抢先手阶段';
                            let target = game.players.randomGet(), beginner = target, control = ['一倍', '两倍', '三倍', '不叫'];
                            while (true) {
                                const result = await target.chooseControl(control).set('ai', () => {
                                    return _status.event.controls.randomGet();
                                }).set('prompt', '是否' + (control.length == 4 ? '叫' : '抢') + '先手？').forResult();
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
                                if (bool !== undefined) {
                                    const num = game.max_beishu * 100;
                                    for (const i of game.filterPlayer2()) {
                                        i.chat((((i === (game.me._trueMe || game.me)) === bool) ? '+' : '-') + num);
                                    }
                                    game.bol_say(`战斗${bool ? '胜利' : '失败'}，${bool ? '获得' : '失去'}${num}萌币`);
                                    game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + num * (bool ? 1 : -1));
                                }
                                else {
                                    game.bol_say('战斗平局，萌币不发生变化');
                                }
                            });
                            game.players.sortBySeat(game.zhu);
                            game.players.forEach((i, index) => {
                                i.setSeatNum(index + 1);
                                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                                i.identity = (game.zhu == i ? 'fan' : 'zhong');
                                i.characterlist.addArray(_status.HDcharacterlist.filter(name => {
                                    return map[name] || !list3.includes(name);
                                }).randomGets(index + 1));
                                _status.HDcharacterlist.removeArray(i.characterlist);
                            });
                            game.showIdentity();
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
                            if (!_status.auto) {
                                dialog.content.childNodes[0].textContent = `请选择你的武将`;
                                const buttons = ui.create.div('.buttons');
                                const node = dialog.buttons[0].parentNode;
                                dialog.buttons = ui.create.buttons(player.characterlist, 'characterx', buttons);
                                dialog.content.insertBefore(buttons, node);
                                buttons.addTempClass('start');
                                node.remove();
                                game.uncheck();
                                game.check();
                            }
                            if (lib.onfree) {
                                lib.onfree.push(() => {
                                    event.dialogxx = ui.create.characterDialog('heightset');
                                    if (ui.cheat2) {
                                        ui.cheat2.addTempClass('controlpressdownx', 500);
                                        ui.cheat2.classList.remove('disabled');
                                    }
                                });
                            }
                            else event.dialogxx = ui.create.characterDialog('heightset');
                            ui.create.cheat = function () {
                                _status.createControl = ui.cheat2;
                                ui.cheat = ui.create.control('更换', function () {
                                    if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) return;
                                    const characters = game.me.characterlist = [..._status.HDcharacterlist, ...game.me.characterlist].randomGets(game.me.characterlist.length);
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    _status.event.dialog.buttons = ui.create.buttons(characters, 'characterx', buttons);
                                    _status.event.dialog.content.insertBefore(buttons, node);
                                    buttons.addTempClass('start');
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
                                            ui.cheat.addTempClass('controlpressdownx', 500);
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
                            const result2 = await player.chooseButton(dialog, true).set('ai', button => {
                                const { player, getCharacter } = get.event();
                                return getCharacter(player.characterlist).includes(button.link) ? get.rank(button.link, true) : -1;
                            }).set('onfree', true).set('getCharacter', getCharacter).forResult();
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
                            delete _status.HDcharacterlist;
                            if (lib.skill.olfeiyang) {
                                lib.skill.olfeiyang.skillAnimation = false;
                                game.zhu.next.addSkill('olfeiyang');
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    skill: {
                        _hufu: {
                            trigger: { player: 'phaseBefore' },
                            silent: true,
                            firstDo: true,
                            priority: Infinity,
                            async content(event, trigger, player) {
                                const targets = game.filterPlayer();
                                if (!targets.length) return;
                                //获取虎符
                                for (const i of targets) i.addMark('danqi_hufu', get.HuFuGainNum(trigger, i));
                                //角色成长
                                let first = false;
                                if (!_status._hufu_skillcardShopping) {
                                    first = true;
                                    _status._hufu_skillcardShopping = {
                                        sha: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        sha: {
                                            type: 'card',
                                            cost: 1,
                                            nature: 'thunder',
                                        },
                                        shan: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        wuxie: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        guohe: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        shunshou: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        huogong: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        lebu: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        wuzhong: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        shandian: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        qinggang: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        qinglong: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        cixiong: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        guanshi: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        renwang: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                        tengjia: {
                                            type: 'card',
                                            cost: 1,
                                        },
                                        bagua: {
                                            type: 'card',
                                            cost: 2,
                                        },
                                    };
                                    if (lib.characterPack?.standard) {
                                        for (const name in lib.characterPack.standard) {
                                            for (const skill of lib.characterPack.standard[name].skills) {
                                                if (_status._hufu_skillcardShopping[skill] || !lib.skill[skill] || lib.skill[skill].zhuSkill || (lib.skill[skill].ai && (lib.skill[skill].ai.combo || lib.skill[skill].ai.neg || lib.skill[skill].ai.halfneg))) continue;
                                                _status._hufu_skillcardShopping[skill] ??= {
                                                    type: 'skill',
                                                    cost: 1,
                                                    character: name,
                                                };
                                                lib.card[`skillcard_${skill}`] = {
                                                    fullimage: true,
                                                    image: `character:${name}`,
                                                    basic: {
                                                        useful: [10, 10, 10],
                                                        value: [10, 10, 10],
                                                    },
                                                };
                                                lib.translate[`skillcard_${skill}`] = lib.translate[skill];
                                                lib.translate[`skillcard_${skill}_info`] = lib.translate[`${skill}_info`];
                                            }
                                        }
                                    }
                                    if (lib.characterPack?.shenhua) {
                                        for (const name in lib.characterPack.shenhua) {
                                            for (const skill of lib.characterPack.shenhua[name].skills) {
                                                if (_status._hufu_skillcardShopping[skill] || !lib.skill[skill] || lib.skill[skill].zhuSkill || (lib.skill[skill].ai && (lib.skill[skill].ai.combo || lib.skill[skill].ai.neg || lib.skill[skill].ai.halfneg))) continue;
                                                _status._hufu_skillcardShopping[skill] = {
                                                    type: 'skill',
                                                    cost: 2,
                                                    character: name,
                                                };
                                                lib.card[`skillcard_${skill}`] = {
                                                    fullimage: true,
                                                    image: `character:${name}`,
                                                    basic: {
                                                        useful: [10, 10, 10],
                                                        value: [10, 10, 10],
                                                    },
                                                };
                                                lib.translate[`skillcard_${skill}`] = lib.translate[skill];
                                                lib.translate[`skillcard_${skill}_info`] = lib.translate[`${skill}_info`];
                                            }
                                        }
                                    }
                                }
                                let map = {}, locals = targets.slice();
                                let humans = targets.filter(current => current === game.me || current.isOnline());
                                locals.removeArray(humans);
                                const eventId = get.id(), time = ((lib.configOL && lib.configOL.choose_timeout) ? parseInt(lib.configOL.choose_timeout) : 10) * 1000;
                                const send = (current, eventId) => {
                                    lib.skill['_hufu'].chooseButton(current, first, eventId);
                                    game.resume();
                                };
                                event._global_waiting = true;
                                for (const i of targets) i.showTimer(time);
                                if (humans.length > 0) {
                                    const solve = function (resolve, reject) {
                                        return function (result, player) {
                                            if (result?.links?.length) map[player.playerid] = result.links;
                                            resolve();
                                        };
                                    };
                                    await Promise.all(humans.map(current => {
                                        return new Promise((resolve, reject) => {
                                            if (current.isOnline()) {
                                                current.send(send, current, eventId);
                                                current.wait(solve(resolve, reject));
                                            }
                                            else {
                                                const next = lib.skill['_hufu'].chooseButton(current, first, eventId);
                                                const solver = solve(resolve, reject);
                                                if (_status.connectMode) game.me.wait(solver);
                                                return next.forResult().then(result => {
                                                    if (_status.connectMode) game.me.unwait(result, current);
                                                    else solver(result, current);
                                                });
                                            }
                                        });
                                    })).catch(() => { });
                                    game.broadcastAll('cancel', eventId);
                                }
                                if (locals.length > 0) {
                                    for (const current of locals) {
                                        const result = await lib.skill['_hufu'].chooseButton(current, first).forResult();
                                        if (result?.links?.length) map[current.playerid] = result.links;
                                    }
                                }
                                delete event._global_waiting;
                                for (const i of targets) i.hideTimer();
                                //获得奖励
                                for (const i of targets) {
                                    if ((map[i.playerid] ?? []).length > 0) {
                                        for (const zhanfa of map[i.playerid]) {
                                            const num = get.ZhanFaCost(zhanfa[2], first);
                                            if (num > 0) i.removeMark('danqi_hufu', num);
                                            i.addZhanfa(zhanfa[2]);
                                        }
                                    }
                                }
                            },
                            chooseButton(player, first, eventId) {
                                const event = get.event(), func = () => {
                                    const event = get.event();
                                    const controls_freeze = [
                                        () => {
                                            const evt = get.event(), player = evt.player;
                                            if (evt.dialog?.buttons) {
                                                for (const item of evt.dialog?.buttons) item.classList.toggle('glow');
                                                if (!player._freeze_links) player._freeze_links = evt.dialog.buttons.map(i => i.link);
                                                else delete player._freeze_links;
                                            }
                                            return;
                                        },
                                    ];
                                    const controls_replace = [
                                        () => {
                                            const evt = get.event(), player = evt.player;
                                            if ((player.hasMark('danqi_hufu') || player.hasMark('shop_refresh')) && evt.dialog?.buttons) {
                                                player.removeMark(player.hasMark('shop_refresh') ? 'shop_refresh' : 'danqi_hufu', 1, !player.hasMark('shop_refresh'));
                                                if (evt.dialog?.buttons) {
                                                    const buttons = ui.create.div('.buttons');
                                                    const node = evt.dialog.buttons[0].parentNode;
                                                    evt.dialog.buttons = ui.create.buttons(get.HuFuShopping(player, !first).randomGets(get.HuFuShopNum(player)).map(skill => {
                                                        if (Array.isArray(skill)) return skill;
                                                        const num = get.ZhanFaCost(skill, evt.forced);
                                                        return ['', `${num}虎符`, skill, ''];
                                                    }), 'vcard', buttons);
                                                    evt.dialog.buttons.forEach(but => but.classList.add(`zf_${lib.zhanfa.getRarity(but.link[2])}`));
                                                    evt.dialog.content.insertBefore(buttons, node);
                                                    buttons.addTempClass('start');
                                                    node.remove();
                                                    game.uncheck();
                                                    game.check();
                                                }
                                            }
                                            return;
                                        },
                                    ];
                                    if (!first) {
                                        event.controls = [
                                            ui.create.control(controls_freeze.concat(['冻结', 'stayleft'])),
                                            ui.create.control(controls_replace.concat(['替换', 'stayleft'])),
                                        ];
                                    }
                                };
                                if (player.isMine()) func();
                                else if (event.isOnline()) event.player.send(func);
                                let list = (() => {
                                    if (player._freeze_links) {
                                        let list = player._freeze_links.slice();
                                        delete player._freeze_links;
                                        return list;
                                    }
                                    return get.HuFuShopping(player, !first).randomGets(get.HuFuShopNum(player)).map(skill => {
                                        if (Array.isArray(skill)) return skill;
                                        const num = get.ZhanFaCost(skill, first);
                                        return ['', `${num}虎符`, skill, ''];
                                    })
                                })();
                                return player.chooseButton(['请选择你要获得的战法', [list, 'vcard']], first).set('filterButton', button => {
                                    const player = get.player();
                                    return player.countMark('danqi_hufu') >= get.ZhanFaCost(button.link[2], get.event().forced);
                                }).set('processAI', () => {
                                    const { player, list, forced } = get.event();
                                    let canChoice = list.filter(zhanfa => player.countMark('danqi_hufu') >= get.ZhanFaCost(zhanfa[2], first));
                                    if (!forced && !canChoice.length) return { bool: false };
                                    canChoice.sort((a, b) => {
                                        let getNum = function (zhanfa) {
                                            if (lib.translate[zhanfa]?.includes('喜从天降')) return 114514 * (forced ? -1919810 : 1919810);
                                            return lib.card[zhanfa].value ?? get.value({ name: zhanfa });
                                        };
                                        return getNum(b[2]) - getNum(a[2]);
                                    });
                                    let gains = [], sum = 0, add = 0;
                                    for (let choice of canChoice) {
                                        const zhanfa = choice[2], cost = get.ZhanFaCost(zhanfa[2], forced);
                                        if (lib.translate[zhanfa]?.includes('喜从天降')) {
                                            add += { '喜从天降': 1, '喜从天降Ⅱ': 2 }[lib.translate[zhanfa]] || 0;
                                        }
                                        if ((!forced && (lib.card[zhanfa].value ?? get.value({ name: zhanfa })) <= 0) || player.countMark('danqi_hufu') + add < sum + cost) break;
                                        gains.push(choice);
                                        sum += cost;
                                        if (forced) break;
                                    }
                                    return {
                                        bool: first || !!gains.length,
                                        links: gains,
                                    };
                                }).set('list', list).set('custom', {
                                    add: {
                                        confirm(bool) {
                                            if (bool !== true) return;
                                            const event = get.event().parent;
                                            if (Array.isArray(event.controls)) event.controls.forEach(i => i.close());
                                            if (ui.confirm) ui.confirm.close();
                                            game.uncheck();
                                        },
                                        button() {
                                            const event = get.event();
                                            if (event.dialog?.buttons?.length) {
                                                event.dialog.buttons.forEach(but => but.classList.add(`zf_${lib.zhanfa.getRarity(but.link[2])}`));
                                            }
                                        },
                                    },
                                    replace: {
                                        button(button) {
                                            const event = get.event(), player = event.player;
                                            if (!event.isMine() || !event.filterButton(button)) return;
                                            if (player._freeze_links) {
                                                player._freeze_links.remove(button.link);
                                                if (!player._freeze_links.length) delete player._freeze_links;
                                            }
                                            const zhanfa = button.link[2].slice(button.link[2].startsWith('skillcard_') ? 'skillcard_'.length : 0)
                                            const num = get.ZhanFaCost(zhanfa, event.forced);
                                            if (num > 0) player.removeMark('danqi_hufu', num);
                                            if (_status._hufu_skillcardShopping?.[zhanfa]) {
                                                const info = _status._hufu_skillcardShopping[zhanfa];
                                                switch (info.type) {
                                                    case 'card':
                                                        player.directgain([game.createCard2(zhanfa, lib.suit.randomGet(), get.rand(1, 13), info.nature)], true);
                                                        break;
                                                    case 'skill':
                                                        if (Array.isArray(player.storage['zhanfa_skill']) && player.storage['zhanfa_skill'][0].length + 1 > player.storage['zhanfa_skill'][1]) {
                                                            let control, dialog, controls = ui.controls.slice();
                                                            controls.forEach(i => i.hide());
                                                            control = ui.create.control('取消', () => {
                                                                if (ui.dialog === dialog) {
                                                                    dialog.close();
                                                                    control.close();
                                                                    controls.forEach(i => i.show());
                                                                }
                                                            });
                                                            dialog = ui.create.dialog(`选择失去一个技能以获得【${lib.translate[`${zhanfa}_ab`] || get.translation(zhanfa).slice(0, 2)}】`, 'hidden');
                                                            for (const skill of player.storage['zhanfa_skill'][0]) {
                                                                const item = dialog.add(`<div class='popup text pointerdiv' style='width:calc(100% - 10px);display:inline-block'>${get.skillTranslation(skill, player, false)}</div>`);
                                                                item.firstChild.link = skill;
                                                                item.firstChild.addEventListener(lib.config.touchscreen ? "touchend" : "click", function () {
                                                                    dialog.close();
                                                                    control.close();
                                                                    controls.forEach(i => i.show());
                                                                    player.storage['zhanfa_skill'][0].remove(this.link);
                                                                    player.removeSkill(this.link);
                                                                    player.popup(this.link);
                                                                    game.log(player, '失去了战法技能', `#g【${get.translation(this.link)}】`);
                                                                    player.storage['zhanfa_skill'][0].push(zhanfa);
                                                                    player.addAdditionalSkill('zhanfa_skill', zhanfa, true);
                                                                    player.popup(zhanfa);
                                                                    game.log(player, '获得了战法技能', `#g【${get.translation(zhanfa)}】`);
                                                                });
                                                            }
                                                            dialog.forcebutton = true;
                                                            dialog.classList.add('forcebutton');
                                                            dialog.open();
                                                        }
                                                        else {
                                                            player.storage['zhanfa_skill'] ??= [[], 2];
                                                            player.storage['zhanfa_skill'][0].push(zhanfa);
                                                            player.addAdditionalSkill('zhanfa_skill', zhanfa, true);
                                                            player.popup(zhanfa);
                                                            game.log(player, '获得了战法技能', `#g【${get.translation(zhanfa)}】`);
                                                        }
                                                        break;
                                                }
                                            }
                                            else player.addZhanfa(zhanfa);
                                            if (event.forced) ui.click.ok();
                                            const buttons = ui.create.div('.buttons');
                                            const node = event.dialog.buttons[0].parentNode;
                                            let list = event.dialog.buttons.slice();
                                            list.remove(button);
                                            list = list.map(i => i.link);
                                            if (zhanfa === 'zf_shangdao') {
                                                list.add(get.HuFuShopping(player, !event.forced).filter(skill => {
                                                    return !list.some(l => skill === l[2]);
                                                }).map(skill => {
                                                    if (Array.isArray(skill)) return skill;
                                                    const num = get.ZhanFaCost(skill, event.forced);
                                                    return ['', `${num}虎符`, skill, ''];
                                                }).randomGet());
                                            }
                                            if (!list.length) ui.click.ok();
                                            event.dialog.buttons = ui.create.buttons(list, 'vcard', buttons);
                                            event.dialog.buttons.forEach(but => but.classList.add(`zf_${lib.zhanfa.getRarity(but.link[2])}`));
                                            event.dialog.content.insertBefore(buttons, node);
                                            buttons.addTempClass('start');
                                            node.remove();
                                            game.uncheck();
                                            game.check();
                                        },
                                    },
                                }).set('id', eventId).set('_global_waiting', true);
                            },
                        },
                        shop_refresh: {
                            marktext: '<span style="text-decoration: line-through;">💰</span>',
                            intro: { content: '可免费刷新#次' },
                        },
                    },
                    translate: {
                        fan: '先',
                        fan2: '先手',
                        zhong: '后',
                        zhong2: '后手',
                        _hufu: '虎符',
                        shop_refresh: '刷新',
                    },
                    element: {
                        player: {
                            logAi() { },
                            dieAfter() {
                                game.checkResult();
                            },
                            init() {
                                const player = originFunction.lib.element.player.init.apply(this, arguments);
                                player._danqi_skills = [];
                                return player;
                            },
                            uninit() {
                                const player = originFunction.lib.element.player.uninit.apply(this, arguments);
                                player._danqi_skills = [];
                                return player;
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
            game.players.forEach(i => Object.assign(i, changeFunction.lib.element.player));
            game.showIdentity();
            //战法--零元购
            lib.zhanfa.add({
                id: 'zf_zerorefresh1',
                rarity: 'common',
                translate: '零元购Ⅰ',
                info: '可免费刷新四次商店',
                card: { value: 0 },
                skill: {
                    init(player) {
                        player.addMark('shop_refresh', 4);
                    },
                },
            });
            lib.zhanfa.add({
                id: 'zf_zerorefresh2',
                rarity: 'rare',
                translate: '零元购Ⅱ',
                info: '每次购买均可免费刷新一次商店',
                card: { value: 0 },
                skill: {
                    trigger: { player: ['chooseButtonBegin', 'chooseButtonEnd'] },
                    filter(event, player) {
                        return event.getParent().name === '_hufu';
                    },
                    silent: true,
                    async content(event, trigger, player) {
                        player[event.triggername.endsWith('Begin') ? 'addMark' : 'removeMark']('shop_refresh', 1, false);
                    },
                },
            });
            //战法--商道
            lib.zhanfa.add({
                id: 'zf_shangdao',
                rarity: 'rare',
                translate: '商道',
                info: '商店物品数+1',
                card: { value: 4 },
                skill: {
                    getExtraDanQiShop: 1,
                },
            });
            //战法--兵权在握
            lib.zhanfa.add({
                id: 'zf_bingquanzaiwo1',
                rarity: 'rare',
                translate: '兵权在握Ⅰ',
                info: '若虎符数大于3，则每回合获得的虎符+1',
                card: { value: 3 },
                skill: {
                    getExtraDanQiHuFu(player) {
                        return player.countMark('danqi_hufu') > 3 ? 1 : 0;
                    },
                },
            });
            lib.zhanfa.add({
                id: 'zf_bingquanzaiwo2',
                rarity: 'epic',
                translate: '兵权在握Ⅱ',
                info: '自己的回合获得的虎符+1',
                card: { value: 6 },
                skill: {
                    getExtraDanQiHuFu(player) {
                        return get.event().getParent('phase').player === player ? 1 : 0;
                    },
                },
            });
            lib.zhanfa.add({
                id: 'zf_bingquanzaiwo3',
                rarity: 'legend',
                translate: '兵权在握Ⅲ',
                info: '每回合获得的虎符+1',
                card: { value: 8 },
                skill: {
                    getExtraDanQiHuFu: () => 2,
                },
            });
            //战法--运筹帷幄
            lib.zhanfa.add({
                id: 'zf_yunchouweiwo',
                rarity: 'rare',
                translate: '运筹帷幄',
                info: '技能槽数量+1',
                card: { value: 2 },
                skill: {
                    getExtraDanQiHuFu(player) {
                        player.storage['zhanfa_skill'] ??= [[], 2];
                        player.storage['zhanfa_skill'][1]++;
                    },
                },
            });
        },
    },
};
export default brawl;