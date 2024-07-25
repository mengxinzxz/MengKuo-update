import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '十周年血战',
    mode: 'identity',
    intro: [
        '本模式为2V2三局两胜制，所有角色的体力上限视为1（护甲不变）',
        '本模式每个人拥有8个选将框，本局游戏的所有对局均从中选择自己未选择过的武将进行游戏',
        '新的一局游戏开始时，一三号和二四号分别交换座位',
        '本模式中所有增加体力上限和减少体力上限的效果均失效',
    ],
    init: function () {
        game.gameDraw = function (player, num) {
            var next = game.createEvent('gameDraw');
            next.player = player || game.me;
            if (num == undefined) next.num = 4;
            else next.num = num;
            next.setContent(function () {
                for (var i of game.players) i.directgain(get.cards(game.players.indexOf(i) + 1 == game.players.length ? 5 : 4));
            });
            return next;
        };
        lib.element.content.loseMaxHp = function () { };
        lib.element.content.gainMaxHp = function () { };
        lib.configOL.number = 4;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        for (var name in lib.character) {
            if (get.infoHujia(lib.character[name][2])) lib.character[name][2] = '1/1/' + get.infoHujia(lib.character[name][2]);
            else lib.character[name][2] = 1;
        }
        if (!_status.characterlist) lib.skill.pingjian.initList();
        lib.skill._draw_less = {
            ruleSkill: true,
            charlotte: true,
            trigger: { player: 'phaseDrawBegin' },
            filter: function (event, player) {
                return !event.numFixed && game.phaseNumber == 1 && event.num > 0 && !game.drawless;
            },
            direct: true,
            firstDo: true,
            priority: Infinity,
            content: function () {
                game.drawless = true;
                trigger.num--;
            },
        };
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            game.bolRules = {
                dieAfter2: function (source) {
                    var friend;
                    for (var i = 0; i < game.players.length; i++) {
                        if (game.players[i].side == this.side) {
                            friend = game.players[i]; break;
                        }
                    }
                    if (friend) {
                        var next = game.createEvent('versusDraw');
                        next.setContent(function () {
                            'step 0'
                            player.chooseBool('是否摸一张牌？');
                            'step 1'
                            if (result.bool) player.draw();
                        });
                        next.player = friend;
                    }
                },
                getFriends: function (func) {
                    var self = false;
                    if (func === true) {
                        func = null;
                        self = true;
                    }
                    return game.filterPlayer(function (current) {
                        if (!self && current == this) return false;
                        return current.identity == this.identity;
                    });
                },
                isFriendOf: function (player) {
                    return this.getFriends(true).includes(player);
                },
                getEnemies: function (func) {
                    const identity = this.identity;
                    return game.filterPlayer(function (current) {
                        return current.identity != identity;
                    });
                },
                isEnemyOf: function (player) {
                    return this.getEnemies(true).includes(player);
                },
                hasZhuSkill: () => false,
                dieAfter: function (source) {
                    game.checkResult();
                },
            };
            for (var i in game.bolRules) lib.element.player[i] = game.bolRules[i];
            lib.translate.fan = '龙';
            lib.translate.fan2 = '龙队';
            lib.translate.zhong = '虎';
            lib.translate.zhong2 = '虎队';
            game.fanzhongNum = [0, 0];
            game.broadcastAll(function () {
                if (get.is.phoneLayout()) ui.xuezhanInfo = ui.create.div('.touchinfo.left', ui.window);
                else ui.xuezhanInfo = ui.create.div(ui.gameinfo);
                ui.xuezhanInfo.innerHTML = '龙虎比分：' + game.fanzhongNum[0] + '/' + game.fanzhongNum[1];
            });
            var first = game.players.randomGet();
            game.players.sortBySeat(first);
            _status.roundStart = first;
            game.zhu = first;
            for (var target of game.players) {
                for (var i in game.bolRules) target[i] = game.bolRules[i];
                target.characterStorage = _status.characterlist.randomRemove(8);
                target.identity = ([0, 3].includes(game.players.indexOf(target)) ? 'fan' : 'zhong');
                target.side = ([0, 3].includes(game.players.indexOf(target)) ? 114514 : 1919810);
                target.setIdentity();
                target.identityShown = true;
                target.setSeatNum(game.players.indexOf(target) + 1);
                target.setNickname(get.cnNumber(game.players.indexOf(target) + 1, true) + '号位');
            }
            get.attitude = function (from, to) {
                var identity = game.me.identity;
                if (from.identity == to.identity) return 10;
                return -10;
            };
            get.rawAttitude = function (from, to) {
                var identity = game.me.identity;
                if (from.identity == to.identity) return 10;
                return -10;
            };
            game.showIdentity(true);
            _status.identityShown = true;
            game.checkResult = function () {
                var list = [];
                for (var i of game.players) {
                    if (!list.includes(i.identity)) list.push(i.identity);
                }
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
                            target.setNickname(get.cnNumber(game.players.sortBySeat(game.zhu).indexOf(target) + 1, true) + '号位');
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
                        _status.event.player = first;
                        _status.event.step = 0;
                        _status.roundStart = first;
                        game.phaseNumber = 0;
                        game.roundNumber = 0;
                        game.updateRoundNumber();
                        game.chooseCharacter();
                        game.gameDraw();
                    }
                }
            };
            //选将
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.ai = function (player, list) {
                    player.init(list.randomGet());
                };
                next.setContent(function () {
                    'step 0'
                    ui.arena.classList.add('choose-character');
                    'step 1'
                    var createDialog = ['选将阶段（第' + get.cnNumber(game.fanzhongNum[0] + game.fanzhongNum[1] + 1, true) + '回合）'];
                    createDialog.push('<div class="text center">你的武将</div>');
                    createDialog.push([game.me.characterStorage, 'character']);
                    var fellow = game.findPlayer(function (current) {
                        return current != game.me && current.identity == game.me.identity;
                    });
                    if (fellow) {
                        createDialog.push('<div class="text center">队友武将</div>');
                        createDialog.push([fellow.characterStorage, 'character']);
                    }
                    game.me.chooseButton(createDialog, true).set('filterButton', function (button) {
                        return _status.event.player.characterStorage.includes(button.link);
                    }).set('onfree', true);
                    'step 2'
                    var getNum = function (name) {
                        var num = 0;
                        if (name == 'chunyuqiong') num = 7.5;//淳于琼
                        else if (name == 'boss_zhaoyun') num = 10;//高达一号
                        else if (name == 'jin_simashi') num = 4;//晋司马师
                        else switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 2; break;
                            case 'epic': num = 3; break;
                            case 'legend': num = 4; break;
                        }
                        return num;
                    };
                    var getCharacter = function (list) {
                        var listx = [], num = 0;
                        for (var name of list) {
                            var numx = getNum(name);
                            if (numx > num) {
                                num = numx;
                                listx = [name];
                            }
                            else if (numx == num) listx.push(name);
                        }
                        return listx;
                    };
                    game.me.init(result.links[0]);
                    game.me.characterStorage.remove(result.links[0]);
                    for (var i of game.players) {
                        if (i != game.me) {
                            var initer = getCharacter(i.characterStorage).randomGet();
                            i.init(initer);
                            i.characterStorage.remove(initer);
                        }
                    }
                    'step 3'
                    if (lib.config.singleControlx) {
                        lib.setPopped(ui.create.system('手牌', null, true), function () {
                            var uiintro = ui.create.dialog('hidden');
                            var players = game.players.concat(game.dead);
                            for (var i = 0; i < players.length; i++) {
                                if (players[i].identity == game.me.identity && players[i] != game.me) {
                                    uiintro.add(get.translation(players[i]));
                                    var cards = players[i].getCards('h');
                                    if (cards.length) {
                                        uiintro.addSmall(cards, true);
                                    }
                                    else {
                                        uiintro.add('（无）');
                                    }
                                }
                            }
                            return uiintro;
                        }, 220);
                    }
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                });
            };
        },
    },
};

export default brawl;