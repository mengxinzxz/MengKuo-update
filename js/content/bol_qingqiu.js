import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '青丘弄琴',
    mode: 'identity',
    intro: [
        '本扩展为复刻手杀山海志异模式中的青丘弄琴，游戏共分为三局，玩家与另一名角色组成盟军与本模式boss青女(九尾狐)对抗',
        '<span class=\'texiaotext\' style=\'color:#FF0000\'>盟军默认为4血白板</span>，且游戏开始时从随机三个技能中选择一个作为初始技能',
        '盟军默认拥有技能【祀邪】（准备阶段，你可以从随机三个技能中获得一个技能，然后若你的非【祀邪】技能数大于3，则你选择失去一个非【祀邪】的技能）',
        '每个阶段的boss拥有不同的血量上限和技能，击杀boss后boss进行重整，boss于其回合开始时复活',
        '<span class=\'texiaotext\' style=\'color:#FF0000\'>一阶段boss【堕魔】数值累计+7，二阶段boss【堕魔】数值累计+12后亦会进入重整状态</span>，三个阶段【堕魔】数值均不重置',
        '击败三个形态的boss后盟军获得游戏胜利，盟军全员阵亡游戏失败',
    ],
    init() {
        var sheet = '{text-shadow:rgba(20,20,200,1) 0 0 2px,rgba(20,20,200,1) 0 0 5px,rgba(57, 123, 4,1) 0 0 5px,rgba(20,20,200,1) 0 0 5px,black 0 0 1px;}';
        lib.init.sheet('.player .identity[data-color="HuNv"]' + sheet);
        lib.configOL.number = 3;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        lib.config.singleControlx = lib.config.extension_活动萌扩_singleControlx;
        lib.config.levelSkills = lib.config.extension_活动萌扩_levelSkills;
        var pack = {
            character: {
                boss_qingnv1: ['female', 'qun', 3, ['HuNv_duomo', 'HuNv_meihuo'], ['ext:活动萌扩/image/boss_qingnv1.jpg']],
                boss_qingnv2: ['female', 'qun', 4, ['HuNv_duomo', 'HuNv_meihuo', 'HuNv_yushou'], ['ext:活动萌扩/image/boss_qingnv2.jpg']],
                boss_qingnv3: ['female', 'qun', 5, ['HuNv_duomo', 'HuNv_meihuo', 'HuNv_yushou', 'HuNv_qinyun', 'HuNv_duanwei'], ['ext:活动萌扩/image/boss_qingnv3.jpg']],
            },
            skill: {
                _HuNv_revive: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { global: 'phaseAfter' },
                    filter(event, player) {
                        return player == game.HuNv && player.isDead() && (game.players.length == 1 || event.player.getSeatNum() == 2);
                    },
                    forceDie: true,
                    direct: true,
                    lastDo: true,
                    priority: -Infinity,
                    content() {
                        'step 0'
                        player.revive();
                        game.HuNvRound++;
                        game.broadcastAll(function () {
                            if (ui.LongZhouInfo) ui.LongZhouInfo.innerHTML = '青丘弄琴：第' + get.cnNumber(game.HuNvRound, true) + '回合';
                        });
                        'step 1'
                        player.init('boss_qingnv' + game.HuNvRound);
                        player.directgain(get.cards(4));
                    },
                },
                _HuNv_sixie: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { global: 'phaseBefore' },
                    filter(event, player) {
                        return game.phaseNumber == 0 && player.identity == 'cai';
                    },
                    direct: true,
                    content() {
                        'step 0'
                        var skills = game.HuNv_sixieSkills.filter(function (skill) {
                            return !player.hasSkill(skill);
                        }).randomGets(3);
                        if (!skills.length) { event.finish(); return; }
                        var getSkillDialog = function (skills, prompt) {
                            var dialog = ui.create.dialog('hidden', 'forcebutton');
                            if (prompt) dialog.addText(prompt);
                            for (var i = 0; i < skills.length; i++) {
                                dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                            }
                            dialog.addText(' <br> ');
                            return dialog;
                        };
                        var dialog = getSkillDialog(skills, '选择获得一个初始技能');
                        player.chooseControl(skills).set('dialog', dialog);
                        'step 1'
                        if (result.control) {
                            player.addSkillLog(result.control);
                            player.storage.HuNv_sixie.push(result.control);
                        }
                    },
                },
                HuNv_sixie: {
                    init(player) {
                        player.storage.HuNv_sixie = [];
                    },
                    charlotte: true,
                    superCharlotte: true,
                    trigger: { player: 'phaseZhunbeiBegin' },
                    direct: true,
                    content() {
                        'step 0'
                        var skills = game.HuNv_sixieSkills.filter(function (skill) {
                            return !player.hasSkill(skill);
                        }).randomGets(3);
                        if (!skills.length) { event.finish(); return; }
                        var getSkillDialog = function (skills, prompt) {
                            var dialog = ui.create.dialog('hidden', 'forcebutton');
                            if (prompt) dialog.addText(prompt);
                            for (var i = 0; i < skills.length; i++) {
                                dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                            }
                            dialog.addText(' <br> ');
                            return dialog;
                        };
                        var dialog = getSkillDialog(skills, '选择获得一个技能');
                        player.chooseControl(skills, 'cancel2').set('ai', function () {
                            var player = _status.event.player;
                            if (player.storage.HuNv_sixie.length == 3) return 'cancel2';
                            return skills.randomGet();
                        }).dialog = dialog;
                        'step 1'
                        if (result.control != 'cancel2') {
                            player.logSkill('HuNv_sixie');
                            player.addSkillLog(result.control);
                            player.storage.HuNv_sixie.push(result.control);
                            if (player.storage.HuNv_sixie.length > 3) player.chooseControl(player.storage.HuNv_sixie).prompt = '选择失去一个技能';
                            else event.finish();
                        }
                        else event.finish();
                        'step 2'
                        if (result.control) {
                            player.storage.HuNv_sixie.remove(result.control);
                            player.removeSkill(result.control);
                            player.popup(result.control);
                            game.log(player, '失去了技能', '#g【' + get.translation(result.control) + '】')
                        }
                    },
                },
                HuNv_duomo: {
                    init(player) {
                        if (!player.storage.HuNv_duomo) player.storage.HuNv_duomo = [0, 0, 0];
                    },
                    mark: true,
                    intro: {
                        markcount: () => undefined,
                        content(storage) {
                            return '<li>准备阶段摸' + storage[0] + '张牌' +
                                '<br><li>使用【杀】的次数上限+' + storage[1] +
                                '<br><li>手牌上限+' + storage[2];
                        },
                    },
                    mod: {
                        cardUsable(card, player, num) {
                            if (card.name == 'sha') return num + player.storage.HuNv_duomo[1];
                        },
                        maxHandcard(player, num) {
                            return num + player.storage.HuNv_duomo[2];
                        },
                    },
                    trigger: { global: 'logSkill', player: ['phaseZhunbeiBegin', 'phaseBegin'] },
                    filter(event, player) {
                        var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                        if (summer >= 15 && event.name != 'phaseZhunbei') return false;
                        if (event.name == 'phase') return true;
                        if (event.name == 'phaseZhunbei') return player.storage.HuNv_duomo[0] > 0;
                        return event.skill == 'HuNv_sixie' && event.player != player;
                    },
                    forced: true,
                    content() {
                        'step 0'
                        if (trigger.name == 'phaseZhunbei') {
                            player.draw(player.storage.HuNv_duomo[0]);
                            event.finish();
                            return;
                        }
                        var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                        player.storage.HuNv_duomo[summer % 3]++;
                        'step 1'
                        var summer = player.storage.HuNv_duomo[0] + player.storage.HuNv_duomo[1] + player.storage.HuNv_duomo[2];
                        var name = player.name, bool = false;
                        if (name == 'boss_qingnv1' && summer >= 7) bool = true;
                        if (name == 'boss_qingnv2' && summer >= 12) bool = true;
                        if (bool) player.die();
                    },
                },
                HuNv_meihuo: {
                    inherit: 'xianzhen',
                    content() {
                        'step 0'
                        player.chooseToCompare(target);
                        'step 1'
                        if (result.bool) {
                            player.storage.xianzhen = target;
                            player.addTempSkill('xianzhen2');
                        }
                        else {
                            player.addTempSkill('xianzhen3');
                        }
                    },
                },
                HuNv_yushou: {
                    trigger: { player: 'phaseUseBegin' },
                    filter(event, player) {
                        return player.hasValueTarget({ name: 'nanman', isCard: true });
                    },
                    forced: true,
                    locked: false,
                    content() {
                        player.chooseUseTarget(true, { name: 'nanman', isCard: true });
                    },
                },
                HuNv_qinyun: {
                    inherit: 'jijiu',
                },
                HuNv_duanwei: {
                    trigger: { player: 'phaseJudgeBegin' },
                    filter(event, player) {
                        return player.countCards('j') && player.countCards('h') > 1;
                    },
                    direct: true,
                    content() {
                        'step 0'
                        player.chooseToDiscard('h', 2, get.prompt2('HuNv_duanwei')).set('ai', function (card) {
                            return 6 - get.value(card);
                        }).logSkill = 'HuNv_duanwei';
                        'step 1'
                        if (result.bool) {
                            player.discardPlayerCard(player, 'j', true);
                        }
                    },
                },
            },
            translate: {
                boss_qingnv1: '青女',
                boss_qingnv2: '青女',
                boss_qingnv3: '九尾狐',
                HuNv_sixie: '祀邪',
                HuNv_sixie_info: '准备阶段，你可以从随机三个技能中获得一个技能，然后若你的技能数超过三个，则你须选择失去一个技能。',
                HuNv_duomo: '堕魔',
                HuNv_duomo_info: '锁定技，其他角色发动【祀邪】后，或你的回合开始时，你依次获得“准备阶段摸一张牌”/“使用【杀】的次数上限+1”/“手牌上限+1”的效果（每项至多获得5次）。',
                HuNv_meihuo: '魅惑',
                HuNv_meihuo_info: '出牌阶段限一次，你可以与一名角色拼点。若你赢，你本回合无视与该角色的距离，无视该角色的防具且对其使用【杀】没有次数限制；若你没赢，你本回合不能使用【杀】。',
                HuNv_yushou: '驭兽',
                HuNv_yushou_info: '出牌阶段开始时，你视为使用一张【南蛮入侵】。',
                HuNv_qinyun: '琴韵',
                HuNv_qinyun_info: '你的回合外，你可以将一张红色牌当作【桃】使用。',
                HuNv_duanwei: '断尾',
                HuNv_duanwei_info: '判定阶段开始时，若你的判定区有牌，则你可以弃置两张手牌，然后弃置你判定区的一张牌。',
            },
        };
        game.bolLoadPack(pack);
    },
    content: {
        submode: 'normal',
        //更改游戏配置
        chooseCharacterBefore() {
            //游戏初始加载
            game.HuNvRound = 1;
            game.HuNv_sixieSkills = [];
            lib.translate.HuNv = '敌';
            lib.translate.HuNv2 = '妖狐';
            lib.translate.cai = '盟';
            lib.translate.cai2 = '盟军';
            //覆盖一些设置
            game.HNelement = {
                getFriends(func) {
                    var self = false;
                    if (func === true) {
                        func = null;
                        self = true;
                    }
                    var player = this, identity = player.identity;
                    return game.filterPlayer(function (current) {
                        if (!self && current == player) return false;
                        return current.identity == identity;
                    });
                },
                isFriendOf(player) {
                    return this.getFriends(true).includes(player);
                },
                getEnemies(func) {
                    var player = this, identity = player.identity;
                    return game.filterPlayer(function (current) {
                        return current.identity != identity;
                    });
                },
                isEnemyOf(player) {
                    return this.getEnemies(true).includes(player);
                },
                logAi() { },
                hasZhuSkill(skill) {
                    return false;
                },
                dieAfter(source) {
                    game.checkResult();
                },
            };
            for (var i in game.HNelement) lib.element.player[i] = game.HNelement[i];
            //定义阵容
            var target = game.players.filter(function (current) {
                return current != game.me;
            }).randomGet();
            game.HuNv = target;
            game.players.sortBySeat(target.next);
            for (var i of game.players) {
                i.identity = (target == i ? 'HuNv' : 'cai');
                i.setIdentity();
                i.identityShown = true;
                i.setSeatNum(game.players.indexOf(i) + 1);
                if (!i.node.seat) i.setNickname(get.cnNumber(i.seatNum, true) + '号位');
                if (i.getSeatNum() == 1) {
                    _status.roundStart = i;
                    game.zhu = i;
                }
                for (var j in game.HNelement) i[j] = game.HNelement[j];
            }
            //设置态度值
            get.rawAttitude = function (from, to) {
                if (!from || !to) return 0;
                if (from.identity == to.identity) return 10;
                return -10;
            };
            game.showIdentity(true);
            _status.identityShown = true;
            //死亡检查胜负情况
            game.checkResult = function () {
                if (!game.players.some(function (current) {
                    return current.identity == game.me.identity;
                })) game.over(false);
                else {
                    var fellow = game.players.filter(function (current) {
                        return current.identity == game.me.identity && current != game.me;
                    })[0];
                    if (!fellow || !fellow.isAlive()) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                    var list = [];
                    for (var i of game.players) if (!list.includes(i.identity)) list.push(i.identity);
                    if (list.length == 1) {
                        if (game.HuNvRound == 3) game.over(true);
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
                    //初始化将池
                    var characters = [];
                    for (var name in lib.character) {
                        if (['boss_qingnv1', 'boss_qingnv2', 'boss_qingnv3'].includes(name)) continue;
                        if (!lib.character[name]) continue;
                        if (lib.filter.characterDisabled(name)) continue;
                        if (lib.character[name][1] == 'shen') continue;
                        var skills = lib.character[name][3];
                        lib.character[name][2] = 4;
                        lib.character[name][3] = [];
                        if (lib.character[name][4]) lib.character[name][4].remove('hiddenSkill');
                        characters.push(name);
                        var getNum = function (name) {
                            var num;
                            switch (game.getRarity(name)) {
                                case 'junk': num = 0; break;
                                case 'rare': num = 2; break;
                                case 'epic': num = 3; break;
                                case 'legend': num = 4; break;
                                default: num = 1; break;
                            }
                            return num;
                        };
                        if (skills.length && getNum(name) >= lib.config.levelSkills) {
                            for (var i of skills) {
                                if (['huashen', 'rehuashen', 'xinsheng', 'rexinsheng', 'duanchang', 'pingjian', 'xinfu_pdgyingshi', 'dunshi', 'mbdanggu', 'mbmowang'].includes(i)) continue;
                                var info = get.info(i);
                                if (!info || info.charlotte || (info.unique && !info.gainable) || info.combo || info.juexingji || info.limited || info.zhuSkill || info.hiddenSkill || info.dutySkill) continue;
                                game.HuNv_sixieSkills.push(i);
                            }
                        }
                    }
                    _status.characterlist = characters;
                    ui.arena.classList.add('choose-character');
                    //第一轮敌人初始化
                    game.HuNv.init('boss_qingnv1');
                    game.broadcastAll(function () {
                        if (get.is.phoneLayout()) ui.LongZhouInfo = ui.create.div('.touchinfo.left', ui.window);
                        else ui.LongZhouInfo = ui.create.div(ui.gameinfo);
                        ui.LongZhouInfo.innerHTML = '青丘弄琴：第' + get.cnNumber(game.HuNvRound, true) + '回合';
                    });
                    'step 1'
                    //玩家方选将
                    var list = _status.characterlist.randomGets(6);
                    var aiList = list.randomRemove(3);
                    event.aiList = aiList;
                    var createDialog = [lib.config.singleControlx ? '请选择你和队友的形象' : '请选择你的形象'];
                    if (lib.config.singleControlx) createDialog.push('<div class="text center">玩家形象</div>');
                    createDialog.push([list, 'character']);
                    var fellow = game.findPlayer(function (current) {
                        return current != game.me && current.identity == game.me.identity;
                    });
                    if (fellow) {
                        if (lib.config.singleControlx) {
                            game.addGlobalSkill('autoswap');
                            fellow._trueMe = game.me;
                            createDialog.push('<div class="text center">队友形象</div>');
                            createDialog.push([aiList, 'character']);
                        }
                    }
                    game.me.chooseButton(createDialog, (lib.config.singleControlx ? 2 : 1), true).set('onfree', true).set('filterButton', function (button) {
                        if (!ui.selected.buttons.length) return _status.event.list.includes(button.link);
                        return _status.event.listx.includes(button.link);
                    }).set('list', list).set('listx', aiList);
                    'step 2'
                    //玩家方初始化
                    game.me.init(result.links[0]);
                    game.me.addSkill('HuNv_sixie');
                    var fellow = game.findPlayer(function (current) {
                        return current != game.me && current.identity == game.me.identity;
                    });
                    if (fellow) {
                        if (lib.config.singleControlx) fellow.init(result.links[1]);
                        else fellow.init(event.aiList.randomGet());
                        fellow.addSkill('HuNv_sixie');
                    }
                    if (!fellow || lib.config.singleControlx) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
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