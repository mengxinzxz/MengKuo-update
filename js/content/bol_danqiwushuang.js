import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '单骑无双<br><span style="font-size:22px;">施工ing</span>',
    mode: 'identity',
    intro: [
        '1对1挑战模式，过程中可以成长变强，制定针对对手的策略，击败对手，赢取胜利',
        '游戏开始时，所有玩家可以查看三个备选武将并开始抢先手，双方一次竞价抢先手，若有玩家出最高价则立刻结束，无玩家抢先手则随机先后手',
        '牌局进行过程中，双方玩家可获得【成长】，成长包括战法、技能、手牌三种类型<span class=\'texiaotext\' style=\'color:#FF0000\'>（目前由于时间原因，暂无技能和手牌成长道具，剩余内容敬请期待）</span>',
        '在每个回合，双方均可获得1枚虎符，可在购买阶段中使用虎符购买成长，商店可消耗1枚虎符手动刷新，每名玩家至多拥有2个额外技能',
    ],
        init() {
            lib.configOL.number = 2;
            this.addHuFuDisplay();
        },
        addHuFuDisplay() {
            if (!ui.hufuDisplay) {
                ui.hufuDisplay = ui.create.div('.hufu-display', ui.arena);
                ui.hufuDisplay.textContent = '当前虎符：0';
                if (!_status.hufuUpdateTimer) {
                    _status.hufuUpdateTimer = setInterval(() => {
                        if (ui.hufuDisplay && game.me) {
                            brawl.updateHuFuDisplay();
                        }
                    }, 1000);
                }
            }
        },
        updateHuFuDisplay() {
            if (ui.hufuDisplay && game.me) {
                const hufuCount = game.me.countMark('danqi_hufu') || 0;
                ui.hufuDisplay.textContent = `当前虎符：${hufuCount}`;
                console.log('虎符数量更新:', hufuCount, '玩家:', game.me.name);
            }
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
                    ZhanFaCost(zhanfa) {
                        if (game.phaseNumber === 0 || lib.translate[zhanfa]?.includes('喜从天降')) return 0;
                        return { 'common': 1, 'rare': 2, 'epic': 3, 'legend': 4 }[lib.zhanfa.getRarity(zhanfa)] || 1;
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
                    HuFuShopping(player) {
                        let list = lib.zhanfa.getList();
                        let round = game.roundNumber + 1;
                        return list.filter(zhanfa => {
                            let sum = { 'common': 1, 'rare': 2, 'epic': 3, 'legend': 4 }[lib.zhanfa.getRarity(zhanfa)] || 1;
                            if (get.itemtype(player) === 'player' && player.hasSkill(zhanfa, null, false, false)) return false;
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
                            game.broadcastAll(list => {
                                for (const name in lib.characterReplace) {
                                    lib.characterReplace[name] = lib.characterReplace[name].filter(i => list.includes(i));
                                }
                            }, _status.characterlist);
                            for (const i of game.players) {
                                i.characterlist = _status.HDcharacterlist.filter(name => {
                                    return map[name] || !list3.includes(name);
                                }).randomGets(3);
                                _status.HDcharacterlist.removeArray(i.characterlist);
                            }
                            const videoId = lib.status.videoId++;
                            game.broadcastAll((player, id) => {
                                const dialog = ui.create.dialog('你的初始武将', [player.characterlist, 'character']);
                                dialog.videoId = id;
                            }, player, videoId);
                            const time = get.utc();
                            await game.delay(2.5);
                            game.broadcastAll(id => {
                                const dialog = get.idDialog(id);
                                if (!_status.auto) dialog.content.childNodes[0].textContent = `抢先手阶段`;
                            }, videoId);
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
                                if (_status.hufuUpdateTimer) {
                                    clearInterval(_status.hufuUpdateTimer);
                                    delete _status.hufuUpdateTimer;
                                }
                            });
                            game.players.sortBySeat(game.zhu);
                            game.players.forEach((i, index) => {
                                i.setSeatNum(index + 1);
                                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                                i.identity = (game.zhu == i ? 'fan' : 'zhong');
                            });
                            game.showIdentity();
                            if (game.me && game.me.isMine()) {
                                brawl.updateHuFuDisplay();
                            }
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
                            game.broadcastAll((player, id) => {
                                const dialog = get.idDialog(id);
                                if (!_status.auto) {
                                    dialog.content.childNodes[0].textContent = `请选择你的武将`;
                                    const buttons = ui.create.div('.buttons');
                                    const node = dialog.buttons[0].parentNode;
                                    dialog.buttons = ui.create.buttons(player.characterlist, 'characterx', buttons);
                                    dialog.content.insertBefore(buttons, node);
                                    buttons.animate('start');
                                    node.remove();
                                    game.uncheck();
                                    game.check();
                                }
                            }, player, videoId);
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
                                    _status.event.dialog.buttons = ui.create.buttons(characters, 'characterx', buttons);
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
                            const result2 = await player.chooseButton(true).set('ai', button => {
                                const { player, getCharacter } = get.event();
                                return getCharacter(player.characterlist).includes(button.link) ? get.rank(button.link, true) : -1;
                            }).set('onfree', true).set('dialog', videoId).set('getCharacter', getCharacter).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            const time2 = 1000 - (get.utc() - time);
                            if (time2 > 0) await game.delay(0, time2);
                            game.broadcastAll('closeDialog', videoId);
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
                                if (game.me && game.me.isMine()) {
                                    brawl.updateHuFuDisplay();
                                }
                                //角色成长
                                let map = {}, locals = targets.slice();
                                let humans = targets.filter(current => current === game.me || current.isOnline());
                                locals.removeArray(humans);
                                const eventId = get.id(), time = ((lib.configOL && lib.configOL.choose_timeout) ? parseInt(lib.configOL.choose_timeout) : 10) * 1000;
                                const send = (current, eventId) => {
                                    lib.skill['_hufu'].chooseButton(current, eventId);
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
                                                const next = lib.skill['_hufu'].chooseButton(current, eventId);
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
                                        const result = await lib.skill['_hufu'].chooseButton(current).forResult();
                                        if (result?.links?.length) map[current.playerid] = result.links;
                                    }
                                }
                                delete event._global_waiting;
                                for (const i of targets) i.hideTimer();
                                //获得奖励
                                for (const i of targets) {
                                    if ((map[i.playerid] ?? []).length > 0) {
                                        for (const zhanfa of map[i.playerid]) {
                                            const num = get.ZhanFaCost(zhanfa[2]);
                                            if (num > 0) i.removeMark('danqi_hufu', num);
                                            i.addZhanfa(zhanfa[2]);
                                        }
                                    }
                                }
                                if (game.me && game.me.isMine()) {
                                    brawl.updateHuFuDisplay();
                                }
                            },
                            chooseButton(player, eventId) {
                                const event = get.event(), func = () => {
                                    const event = get.event();
                                    const controls_freeze = [
                                        () => {
                                            const evt = get.event(), player = evt.player;
                                            if (evt.dialog?.buttons) {
                                                for (const item of evt.dialog?.buttons) item.classList.toggle('selectedx');
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
                                                    evt.dialog.buttons = ui.create.buttons(get.HuFuShopping(player).randomGets(get.HuFuShopNum(player)).map(skill => {
                                                        const num = get.ZhanFaCost(skill);
                                                        return ['', num + '虎符', skill, ''];
                                                    }), 'vcard', buttons);
                                                    evt.dialog.buttons.forEach(but => but.classList.add(`zf_${lib.zhanfa.getRarity(but.link[2])}`));
                                                    evt.dialog.content.insertBefore(buttons, node);
                                                    buttons.animate('start');
                                                    node.remove();
                                                    game.uncheck();
                                                    game.check();
                                                }
                                            }
                                            return;
                                        },
                                    ];
                                    if (game.phaseNumber > 0) {
                                        event.controls = [
                                            ui.create.control(controls_freeze.concat(['冻结', 'stayleft'])),
                                            ui.create.control(controls_replace.concat(['替换', 'stayleft'])),
                                        ];
                                    }
                                };
                                if (player.isMine()) func();
                                else if (event.isOnline()) event.player.send(func);
                                let list = player._freeze_links || get.HuFuShopping(player).randomGets(get.HuFuShopNum(player)).map(skill => {
                                    const num = get.ZhanFaCost(skill);
                                    return ['', num + '虎符', skill, ''];
                                });
                                if (player._freeze_links) delete player._freeze_links;
                                return player.chooseButton(['请选择你要获得的战法', [list, 'vcard']], game.phaseNumber === 0).set('filterButton', button => {
                                    const player = get.player();
                                    return player.countMark('danqi_hufu') >= get.ZhanFaCost(button.link[2]);
                                }).set('processAI', () => {
                                    const { player, list, forced } = get.event();
                                    let canChoice = list.filter(zhanfa => player.countMark('danqi_hufu') >= get.ZhanFaCost(zhanfa[2]));
                                    if (!forced && !canChoice.length) return { bool: false };
                                    canChoice.sort((a, b) => {
                                        let getNum = function (zhanfa) {
                                            if (lib.translate[zhanfa]?.includes('喜从天降')) return 114514 * (forced ? -1919810 : 1919810);
                                            return lib.card[zhanfa].value || 0;
                                        };
                                        return getNum(b[2]) - getNum(a[2]);
                                    });
                                    console.log(canChoice);
                                    let gains = [], sum = 0, add = 0;
                                    for (let choice of canChoice) {
                                        const zhanfa = choice[2], cost = get.ZhanFaCost(zhanfa);
                                        if (lib.translate[zhanfa]?.includes('喜从天降')) {
                                            add += { '喜从天降': 1, '喜从天降Ⅱ': 2 }[lib.translate[zhanfa]] || 0;
                                        }
                                        if ((!forced && (lib.card[zhanfa].value || 0) <= 0) || player.countMark('danqi_hufu') + add < sum + cost) break;
                                        gains.push(choice);
                                        sum += cost;
                                        if (forced) break;
                                    }
                                    return {
                                        bool: forced || !!gains.length,
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
                                            const num = get.ZhanFaCost(button.link[2]);
                                            if (num > 0) player.removeMark('danqi_hufu', num);
                                            player.addZhanfa(button.link[2]);
                                            if (event.forced) ui.click.ok();
                                            const buttons = ui.create.div('.buttons');
                                            const node = event.dialog.buttons[0].parentNode;
                                            let list = event.dialog.buttons.slice();
                                            list.remove(button);
                                            list = list.map(i => i.link);
                                            if (button.link[2] === 'zf_shangdao') {
                                                list.add(get.HuFuShopping(player).filter(skill => {
                                                    return !list.some(l => skill === l[2]);
                                                }).map(skill => {
                                                    const num = get.ZhanFaCost(skill);
                                                    return ['', num + '虎符', skill, ''];
                                                }).randomGet());
                                            }
                                            if (!list.length) ui.click.ok();
                                            event.dialog.buttons = ui.create.buttons(list, 'vcard', buttons);
                                            event.dialog.buttons.forEach(but => but.classList.add(`zf_${lib.zhanfa.getRarity(but.link[2])}`));
                                            event.dialog.content.insertBefore(buttons, node);
                                            buttons.animate('start');
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
        },
    },
};
export default brawl;