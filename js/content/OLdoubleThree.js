import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '欢乐3V3',
    mode: 'identity',
    intro: [
        '本模式为复刻Online的欢乐3V3模式',
        '初始每队共三名玩家，双方各分配九个武将，友方角色之前的手牌相互可见',
        '双方座次依次交替，第一个回合摸牌阶段少摸一张牌，六号位角色初始手牌为五张',
        '当一名角色死亡后，其所有存活友方角色各摸一张牌',
        '击败所有敌方阵营的角色获得游戏胜利',
    ],
    init: function () {
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
        lib.skill._OLdoubleThree_view = {
            ai: {
                viewHandcard: true,
                skillTagFilter: function (player, arg, target) {
                    return target != player && target.identity == player.identity;
                },
            },
        };
        lib.element.content.gameDraw = function () {
            for (var i of game.players) {
                i.directgain(get.cards(i.next == game.zhu ? 5 : 4));
            }
        };
        game.OLrule = {
            hasZhuSkill: () => false,
            dieAfter: function () {
                game.checkResult();
            },
            dieAfter2: function () {
                var identity = this.identity;
                var targets = game.filterPlayer(function (current) {
                    return current.identity == identity;
                });
                if (targets) game.asyncDraw(targets);
            },
        };
        for (var i in game.OLrule) lib.element.player[i] = game.OLrule[i];
        lib.configOL.number = 6;
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            game.zhu = game.players[get.rand(0, game.players.length - 1)];
            game.players.sortBySeat(game.zhu);
            lib.translate.fan = '龙';
            lib.translate.fan2 = '龙队';
            lib.translate.zhong = '虎';
            lib.translate.zhong2 = '虎队';
            for (var i of game.players.sortBySeat(game.zhu)) {
                for (var j in game.OLrule) i[j] = game.OLrule[j];
                i.setSeatNum(game.players.sortBySeat(game.zhu).indexOf(i) + 1);
                i.setNickname(get.cnNumber(game.players.sortBySeat(game.zhu).indexOf(i) + 1, true) + '号位');
                i.identity = (game.players.sortBySeat(game.zhu).indexOf(i) % 2 == 0 ? 'fan' : 'zhong');
                i.setIdentity();
                i.identityShown = true;
            }
            //设置态度值
            get.attitude = function (from, to) {
                if (from.identity == to.identity) return 10;
                return -10;
            };
            get.rawAttitude = function (from, to) {
                if (from.identity == to.identity) return 10;
                return -10;
            };
            game.showIdentity(true);
            game.checkResult = function () {
                if (!game.players.some(function (current) {
                    return current.identity == 'fan';
                })) game.over(game.me.identity == 'zhong');
                if (!game.players.some(function (current) {
                    return current.identity == 'zhong';
                })) game.over(game.me.identity == 'fan');
                if (game.me.isAlive() && !game.players.some(function (current) {
                    return current.identity == game.me.identity;
                })) {
                    ui.create.system('投降', function () {
                        game.log(game.me, '投降');
                        game.over(false);
                    }, true);
                }
            };
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    'step 0'
                    if (!_status.characterlist) lib.skill.pingjian.initList();
                    ui.arena.classList.add('choose-character');
                    'step 1'
                    var getCharacter = function (list) {
                        var getNum = function (name) {
                            var num;
                            switch (game.getRarity(name)) {
                                case 'junk': num = 1; break;
                                case 'rare': num = 3; break;
                                case 'epic': num = 4; break;
                                case 'legend': num = 5; break;
                                default: num = 2; break;
                            }
                            return num;
                        };
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
                    var characters = _status.characterlist.slice(0).randomGets(9);
                    event.characters = characters;
                    var dialog;
                    if (event.swapnodialog) {
                        dialog = ui.dialog;
                        event.swapnodialog(dialog, list);
                        delete event.swapnodialog;
                    }
                    else {
                        var str = '我方将池';
                        dialog = ui.create.dialog(str, 'hidden', [characters, 'character']);
                    }
                    dialog.setCaption('我方将池');
                    game.me.chooseButton(dialog, true).set('onfree', true);

                    ui.create.cheat = function () {
                        _status.createControl = ui.cheat2;
                        ui.cheat = ui.create.control('更换', function () {
                            if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) {
                                return;
                            }
                            if (game.changeCoin) {
                                game.changeCoin(-3);
                            }

                            characters = _status.characterlist.slice(0).randomGets(9);
                            event.characters = characters;

                            var buttons = ui.create.div('.buttons');
                            var node = _status.event.dialog.buttons[0].parentNode;
                            _status.event.dialog.buttons = ui.create.buttons(characters, 'character', buttons);
                            _status.event.dialog.content.insertBefore(buttons, node);
                            buttons.animate('start');
                            node.remove();
                            game.uncheck();
                            game.check();
                        });
                        delete _status.createControl;
                    };
                    if (lib.onfree) {
                        lib.onfree.push(function () {
                            event.dialogxx = ui.create.characterDialog('heightset');
                            if (ui.cheat2) {
                                ui.cheat2.animate('controlpressdownx', 500);
                                ui.cheat2.classList.remove('disabled');
                            }
                        });
                    }
                    else {
                        event.dialogxx = ui.create.characterDialog('heightset');
                    }

                    ui.create.cheat2 = function () {
                        ui.cheat2 = ui.create.control('自由选将', function () {
                            if (this.dialog == _status.event.dialog) {
                                if (game.changeCoin) {
                                    game.changeCoin(50);
                                }
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
                                if (game.changeCoin) {
                                    game.changeCoin(-10);
                                }
                                this.backup = _status.event.dialog;
                                _status.event.dialog.close();
                                _status.event.dialog = _status.event.parent.dialogxx;
                                this.dialog = _status.event.dialog;
                                this.dialog.open();
                                game.uncheck();
                                game.check();
                                if (ui.cheat) {
                                    ui.cheat.classList.add('disabled');
                                }
                            }
                        });
                        if (lib.onfree) {
                            ui.cheat2.classList.add('disabled');
                        }
                    }
                    if (!_status.brawl || !_status.brawl.chooseCharacterFixed) {
                        if (!ui.cheat && get.config('change_choice'))
                            ui.create.cheat();
                        if (!ui.cheat2 && get.config('free_choose'))
                            ui.create.cheat2();
                    }
                    'step 2'
                    if (ui.cheat) {
                        ui.cheat.close();
                        delete ui.cheat;
                    }
                    if (ui.cheat2) {
                        ui.cheat2.close();
                        delete ui.cheat2;
                    }
                    var getCharacter = function (list) {
                        var getNum = function (name) {
                            var num;
                            switch (game.getRarity(name)) {
                                case 'junk': num = 1; break;
                                case 'rare': num = 3; break;
                                case 'epic': num = 4; break;
                                case 'legend': num = 5; break;
                                default: num = 2; break;
                            }
                            return num;
                        };
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
                    event.characters.remove(result.links[0]);
                    game.me.init(result.links[0]);
                    _status.characterlist.remove(result.links[0]);
                    for (var i of game.players) {
                        if (i != game.me) {
                            if (i.identity == game.me.identity) {
                                var choose = getCharacter(event.characters).randomGet();
                                event.characters.remove(choose);
                                i.init(choose);
                                _status.characterlist.remove(choose);
                            }
                            else i.init(_status.characterlist.randomRemove());
                        }
                    }
                    'step 3'
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                });
            };
        },
    },
};

export default brawl;