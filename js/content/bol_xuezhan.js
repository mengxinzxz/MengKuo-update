import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '<span style="font-size:22px;">十周年血战</span>',
    mode: 'identity',
    intro: [
        '本模式为2V2三局两胜制，所有角色的体力上限视为1（护甲不变）',
        '本模式每个人拥有8个选将框，本局游戏的所有对局均从中选择自己未选择过的武将进行游戏',
        '新的一局游戏开始时，一三号和二四号分别交换座位',
        '本模式中所有增加体力上限和减少体力上限的效果均失效',
    ],
    init() {
        lib.configOL.number = 4;
        lib.config.mode_config.identity.dierestart = false;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        for (var name in lib.character) {
            if (get.infoHujia(lib.character[name][2])) lib.character[name][2] = '1/1/' + get.infoHujia(lib.character[name][2]);
            else lib.character[name][2] = 1;
        }
        _status.first_less = true;
        _status.first_less_forced = true;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            const changeFunction = {
                get: {
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        if (from.identity == to.identity) return 10;
                        return -10;
                    },
                },
                game: {
                    fanzhongNum: [0, 0],
                    gameDraw(player, num) {
                        const next = game.createEvent("gameDraw");
                        next.player = player || game.me;
                        next.num = function (player) {
                            return game.players[game.players.length - 1] === target ? 5 : 4;
                        };
                        next.setContent("gameDraw");
                        return next;
                    },
                    checkResult() {
                        var list = game.players.map(i => i.identity).unique();
                        if (list.length == 1) {
                            game.fanzhongNum[list[0] == 'fan' ? 0 : 1]++;
                            game.broadcastAll(function () {
                                if (ui.xuezhanInfo) ui.xuezhanInfo.innerHTML = '龙虎比分：' + game.fanzhongNum[0] + '/' + game.fanzhongNum[1];
                            });
                            if (game.fanzhongNum[0] >= 2) game.over(game.me.identity == 'fan');
                            else if (game.fanzhongNum[1] >= 2) game.over(game.me.identity == 'zhong');
                            else {
                                delete game.zhu;
                                for (var i of game.dead.slice(0)) i.revive(null, false);
                                game.players.sort(function (a, b) {
                                    return a.getSeatNum() - b.getSeatNum();
                                });
                                game.zhu = game.players[2];
                                game.players.sortBySeat(game.zhu);
                                for (var target of game.players.sortBySeat(game.zhu)) {
                                    target.setSeatNum(game.players.sortBySeat(game.zhu).indexOf(target) + 1);
                                    if (!target.node.seat) target.setNickname(get.cnNumber(target.seatNum, true) + '号位');
                                }
                                for (var player of game.players) {
                                    player.removeSkill('counttrigger');
                                    delete player.storage.counttrigger;
                                }
                                for (var i of game.players) {
                                    i.uninit();
                                    var hs = i.getCards('hejxs');
                                    game.addVideo('lose', i, [get.cardsInfo(hs), [], [], []]);
                                    for (var j of hs) j.discard(false);
                                }
                                while (_status.event.name != 'phaseLoop') {
                                    _status.event = _status.event.parent;
                                }
                                game.resetSkills();
                                var first = game.players[0];
                                _status.paused = false;
                                _status.event.player = first.previous;
                                _status.event.step = 0;
                                _status.roundStart = first;
                                game.phaseNumber = 0;
                                game.roundNumber = 0;
                                game.updateRoundNumber();
                                game.chooseCharacter();
                                game.gameDraw();
                            }
                        }
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            ui.arena.classList.add('choose-character');
                            const createDialog = event.dialog = ['选将阶段（第' + get.cnNumber(game.fanzhongNum[0] + game.fanzhongNum[1] + 1, true) + '回合）'];
                            createDialog.push('<div class="text center">你的武将</div>');
                            createDialog.push([game.me.characterStorage, 'character']);
                            const fellow = game.players.find(current => current != player && current.identity == player.identity);
                            if (fellow) {
                                createDialog.push('<div class="text center">队友武将</div>');
                                createDialog.push([fellow.characterStorage, 'character']);
                            }
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
                                    let characters = game.me.usedStorage.slice();
                                    let puts = game.me.characterStorage.slice().removeArray(i.usedStorage);
                                    _status.characterlist.addArray(puts);
                                    characters.addArray(_status.characterlist.randomRemove(8 - characters.length));
                                    game.me.characterStorage = characters;
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    _status.event.dialog.buttons = ui.create.buttons(characters, 'character', buttons);
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
                            const result = await player.chooseButton(createDialog, true).set('filterButton', button => {
                                const { list, player } = get.event();
                                return ![...list, ...player.usedStorage].includes(button.link);
                            }).set('list', fellow?.characterStorage ?? []).set('onfree', true).set('ai', button => get.rank(button.link, true)).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            game.addRecentCharacter(...result.links);
                            player.init(...result.links);
                            player.usedStorage.addArray(result.links);
                            for (const i of game.players) {
                                if (i != game.me) {
                                    i.characterStorage.removeArray(result.links);
                                    const initer = (list => {
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
                                    })(i.characterStorage.slice().removeArray(i.usedStorage)).randomGet();
                                    i.init(initer);
                                    i.usedStorage.add(initer);
                                }
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    translate: {
                        fan: '龙',
                        fan2: '龙队',
                        zhong: '虎',
                        zhong2: '虎队',
                    },
                    element: {
                        player: {
                            dieAfter() {
                                game.checkResult();
                            },
                            dieAfter2() {
                                let friend;
                                for (let i = 0; i < game.players.length; i++) {
                                    if (game.players[i].side == this.side) {
                                        friend = game.players[i]; break;
                                    }
                                }
                                if (friend) {
                                    const next = game.createEvent('versusDraw');
                                    next.setContent(function () {
                                        'step 0'
                                        player.chooseBool('是否摸一张牌？');
                                        'step 1'
                                        if (result.bool) player.draw();
                                    });
                                    next.player = friend;
                                }
                            },
                            $dieAfter() { },
                            getFriends(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                var self = false;
                                if (func === true) {
                                    func = null;
                                    self = true;
                                }
                                return game[method](function (current) {
                                    if (!self && current == player) return false;
                                    return current.identity == identity;
                                }, [], includeOut);
                            },
                            getEnemies(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                return game[method](function (current) {
                                    return current.identity != identity;
                                }, [], includeOut);
                            },
                            isFriendOf(player, includeDie, includeOut) {
                                return this.getFriends(true).includes(player);
                            },
                            isEnemyOf(player, includeDie, includeOut) {
                                return this.getEnemies(true).includes(player);
                            },
                        },
                        content: {
                            loseMaxHp() { },
                            gainMaxHp() { },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            Object.assign(lib.element.content, changeFunction.lib.element.content);
            game.broadcastAll(function () {
                if (get.is.phoneLayout()) ui.xuezhanInfo = ui.create.div('.touchinfo.left', ui.window);
                else ui.xuezhanInfo = ui.create.div(ui.gameinfo);
                ui.xuezhanInfo.innerHTML = '龙虎比分：' + game.fanzhongNum[0] + '/' + game.fanzhongNum[1];
            });
            const first = game.players.randomGet();
            game.players.sortBySeat(first);
            _status.roundStart = game.zhu = first;
            game.players.forEach((target, index) => {
                if (!_status.characterlist) lib.skill.pingjian.initList();
                target.usedStorage = [];
                target.characterStorage = _status.characterlist.randomRemove(8);
                target.identity = ([0, 3].includes(index) ? 'fan' : 'zhong');
                target.side = ([0, 3].includes(index) ? 114514 : 1919810);
                target.setIdentity();
                target.identityShown = true;
                target.setSeatNum(index + 1);
                if (!target.node.seat) target.setNickname(get.cnNumber(target.seatNum, true) + '号位');
                Object.assign(target, changeFunction.lib.element.player);
            });
            game.showIdentity(true);
            _status.identityShown = true;
        },
    },
};
export default brawl;