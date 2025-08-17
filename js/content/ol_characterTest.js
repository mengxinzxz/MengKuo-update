import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '武将试炼<br><span style="font-size:22px;">（低配版）</span>',
    mode: 'identity',
    intro: [
        '四人局，单将模式，玩家为主公；二、三号位为反贼；四号位为忠臣',
        '游戏开始时，反贼和忠臣率先选将（三号位反贼选将范围默认为刘禅/刘备/荀彧/界鲁肃），然后玩家从八张武将牌中选择一张作为自己的武将牌',
        '其余条件同身份模式',
    ],
    init: function () {
        lib.configOL.number = 4;
        lib.config.mode_config.identity.double_character = false;
        lib.config.mode_config.identity.auto_mark_identity = false;
        lib.config.levelSkills = lib.config.extension_活动萌扩_levelSkills;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            game.players.sortBySeat(game.me);
            var targets = game.players.sortBySeat(game.me);
            game.zhu = game.me;
            game.me.identity = 'zhu';
            targets[1].identity = targets[2].identity = 'fan';
            targets[3].identity = 'zhong';
            for (const i of targets) {
                i.showIdentity();
                i.identityShown = true;
            }
            game.showIdentity(true);
            //加载将池
            if (!_status.characterlist) lib.skill.pingjian.initList();
            targets[1].init(_status.characterlist.randomRemove());
            targets[2].init(_status.characterlist.filter(i => {
                return ['liushan', 'xunyu', 'liubei', 'ol_lusu'].includes(i);
            }).randomRemove());
            targets[3].init(_status.characterlist.randomRemove());
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    'step 0'
                    ui.arena.classList.add('choose-character');
                    'step 1'
                    var dialog = ['请选择你的武将'];
                    dialog.push([get.originalCharacterList().randomGets(8), 'characterx']);
                    game.me.chooseButton(dialog, true).set('onfree', true);
                    //换将
                    ui.create.cheat = function () {
                        _status.createControl = ui.cheat2;
                        ui.cheat = ui.create.control('更换', function () {
                            if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) return;
                            characters = get.originalCharacterList().randomGets(8);
                            event.characters = characters;
                            var buttons = ui.create.div('.buttons');
                            var node = _status.event.dialog.buttons[0].parentNode;
                            _status.event.dialog.buttons = ui.create.buttons(characters, 'characterx', buttons);
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
                    //自由选将
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
                    game.me.init(result.links[0]);
                    'step 3'
                    setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                });
            };
        },
    },
};

export default brawl;