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
    init() {
        lib.configOL.number = 6;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        _status.first_less = true;
        _status.first_less_forced = true;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore() {
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        return (from.identity === to.identity) ? 10 : -10;
                    },
                },
                game: {
                    //游戏胜负
                    checkResult() {
                        if (!get.population('fan')) game.over(game.me.identity == 'zhong');
                        if (!get.population('zhong')) game.over(game.me.identity == 'fan');
                        if (get.population(game.me.identity) === 1 && game.players.includes(player)) {
                            ui.create.system('投降', function () {
                                game.log(game.me, '投降');
                                game.over(false);
                            }, true);
                        }
                    },
                    //摸牌
                    gameDraw(player) {
                        const next = game.createEvent("gameDraw");
                        next.player = player || game.me;
                        next.num = function (player) {
                            return game.players[game.players.length - 1] === player ? 5 : 4;
                        };
                        next.setContent("gameDraw");
                        return next;
                    },
                    //选将
                    chooseCharacter() {
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            if (!_status.characterlist) lib.skill.pingjian.initList();
                            ui.arena.classList.add('choose-character');
                            let characters = event.characters = _status.characterlist.randomGets(9);
                            let dialog;
                            if (event.swapnodialog) {
                                dialog = ui.dialog;
                                event.swapnodialog(dialog, list);
                                delete event.swapnodialog;
                            }
                            else {
                                let str = '我方将池';
                                dialog = ui.create.dialog(str, 'hidden', [characters, 'character']);
                            }
                            event.dialog = dialog;
                            dialog.setCaption('我方将池');
                            ui.create.cheat = function () {
                                _status.createControl = ui.cheat2;
                                ui.cheat = ui.create.control('更换', function () {
                                    if (ui.cheat2?.dialog == _status.event.dialog) return;
                                    characters = _status.characterlist.slice().randomGets(9);
                                    event.characters = characters;
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
                            if (lib.onfree) {
                                lib.onfree.push(function () {
                                    event.dialogxx = ui.create.characterDialog('heightset');
                                    if (ui.cheat2) {
                                        ui.cheat2.animate('controlpressdownx', 500);
                                        ui.cheat2.classList.remove('disabled');
                                    }
                                });
                            }
                            else event.dialogxx = ui.create.characterDialog('heightset');
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
                            if (!ui.cheat && get.config('change_choice')) ui.create.cheat();
                            if (!ui.cheat2 && get.config('free_choose')) ui.create.cheat2();
                            const result = await player.chooseButton(dialog, true).set('onfree', true).set('ai', button => get.rank(button.link, true)).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            const getCharacter = function (list) {
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
                            };
                            characters.remove(result.links[0]);
                            player.init(result.links[0]);
                            for (const i of game.players) {
                                if (i !== game.me) {
                                    if (i.identity == game.me.identity) {
                                        const choose = getCharacter(characters).randomGet();
                                        characters.remove(choose);
                                        _status.characterlist.remove(choose);
                                        i.init(choose);
                                    }
                                    else i.init(_status.characterlist.randomRemove());
                                }
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    skill: {
                        _OLdoubleThree_view: {
                            ai: {
                                viewHandcard: true,
                                skillTagFilter(player, arg, target) {
                                    return target !== player && target.identity == player.identity;
                                },
                            },
                        },
                    },
                    translate: {
                        fan: '龙',
                        fan2: '龙队',
                        zhong: '虎',
                        zhong2: '虎队',
                    },
                    element: {
                        player: {
                            logAi() { },
                            dieAfter() {
                                this.$dieAfter();
                                game.checkResult();
                            },
                            dieAfter2() {
                                const player = this, identity = player.identity;
                                const targets = game.filterPlayer(current => current.identity == identity);
                                if (targets.length > 0) game.asyncDraw(targets);
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
            //位置载入
            game.zhu = game.players.randomGet();
            game.players.sortBySeat(game.zhu);
            game.players.forEach((i, index) => {
                i.setSeatNum(index + 1);
                if (!i.node.seat) i.setNickname(get.cnNumber(i.getSeatNum(), true) + '号位');
                i.identity = (i.getSeatNum() % 2 === 0 ? 'fan' : 'zhong');
                i.setIdentity();
                i.identityShown = true;
                Object.assign(i, changeFunction.lib.element.player);
            });
            game.showIdentity(true);
        },
    },
};
export default brawl;