import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '微信斗地主',
    mode: 'identity',
    intro: [
        '游戏规则：<br>' +
        '所有角色为4血白板（性别请在扩展页面进行选择，群雄）。<br>' +
        '从随机一名玩家开始依次开始叫分抢地主，玩家选择叫分倍数，叫分最多的玩家成为地主，最多为3倍，也可放弃叫分。<br>' +
        '每位玩家仅有一次叫分机会，且叫分必须大于上家的叫分，否则放弃叫分。<br>' +
        '叫分过程中，若有玩家叫分3倍则该玩家直接成为地主。<br>' +
        '若三名玩家都放弃叫分，第一个叫分的玩家以最低倍数成为地主。<br>' +
        '确认地主后，地主玩家成为一号位，且初始体力上限和体力值+1。其余玩家自动成为农民玩家。然后地主/农民从随机十五个技能中选择三/两个作为自己的初始技能开始本局游戏<br>',
        '地主额外技能：<br>' +
        '【飞扬】：锁定技。①准备阶段，你摸一张牌。②你使用【杀】的额定次数+1。<br>' +
        '【跋扈】：判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。',
        '农民死亡后，其队友可以选择摸两张牌或回复1点体力',
    ],
    init: function () {
        if (!lib.config.extension_活动萌扩_chooseSex) lib.config.extension_活动萌扩_chooseSex = 'male';
        //空白角色
        if (!_status.characterlist) lib.skill.pingjian.initList();
        //男
        lib.character.bol_unknown_male0 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male0.jpg']];
        lib.translate.bol_unknown_male0 = '士兵';
        lib.character.bol_unknown_male1 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male1.jpg']];
        lib.translate.bol_unknown_male1 = '步兵';
        lib.character.bol_unknown_male2 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male2.jpg']];
        lib.translate.bol_unknown_male2 = '常山府军';
        lib.character.bol_unknown_male3 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male3.jpg']];
        lib.translate.bol_unknown_male3 = '江夏弓骑兵';
        lib.character.bol_unknown_male4 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male4.jpg']];
        lib.translate.bol_unknown_male4 = '太行山游侠';
        lib.character.bol_unknown_male5 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male5.jpg']];
        lib.translate.bol_unknown_male5 = '武林山隐伏';
        lib.character.bol_unknown_male6 = ['male', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_male6.jpg']];
        lib.translate.bol_unknown_male6 = '羽林内军';
        //女
        lib.character.bol_unknown_female0 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female0.jpg']];
        lib.translate.bol_unknown_female0 = '士兵';
        lib.character.bol_unknown_female1 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female1.jpg']];
        lib.translate.bol_unknown_female1 = '黑绸巫女';
        lib.character.bol_unknown_female2 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female2.jpg']];
        lib.translate.bol_unknown_female2 = '美人计';
        lib.character.bol_unknown_female3 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female3.jpg']];
        lib.translate.bol_unknown_female3 = '婆娑匠奴';
        lib.character.bol_unknown_female4 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female4.jpg']];
        lib.translate.bol_unknown_female4 = '武库清点';
        lib.character.bol_unknown_female5 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female5.jpg']];
        lib.translate.bol_unknown_female5 = '血婆娑巧手';
        lib.character.bol_unknown_female6 = ['female', 'qun', 4, [], ['ext:活动萌扩/image/bol_unknown_female6.jpg']];
        lib.translate.bol_unknown_female6 = '佣兵';
        var characters = _status.characterlist, skills = [];
        for (var i = 0; i < characters.length; i++) {
            var name = characters[i];
            if (!lib.character[name]) continue;
            var skillsx = lib.character[name][3].slice(0);
            var list = skillsx.slice(0);
            for (var j = 0; j < skillsx.length; j++) {
                var info = get.info(skillsx[j]);
                if (!info) {
                    skillsx.splice(j, 1);
                    list.splice(j--, 1);
                    continue;
                }
                if (typeof info.derivation == 'string') list.push(info.derivation);
                else if (Array.isArray(info.derivation)) list.addArray(info.derivation);
            }
            for (var j = 0; j < list.length; j++) {
                if (skills.includes(list[j])) continue;
                var info = get.info(list[j]);
                if (!info || info.charlotte || info.zhuSkill || info.dutySkill || info.unique || info.juexingji || info.equipSkill || info.hiddenSkill || (info.ai && info.ai.combo)) continue;
                skills.push(list[j]);
                lib.card['skillCard_' + list[j]] = {
                    fullimage: true,
                    image: 'character:' + name,
                };
                lib.translate['skillCard_' + list[j]] = lib.translate[list[j]];
                lib.translate['skillCard_' + list[j] + '_info'] = lib.translate[list[j] + '_info'];
            }
        }
        game.doudizhuSkills = skills;
        lib.configOL.number = 3;
        lib.config.mode_config.identity.double_character = false;
        lib.skill.decade_feiyang = {
            charlotte: true,
            trigger: { player: 'phaseJudgeBegin' },
            filter: function (event, player) {
                return player.countCards('j') && player.countCards('h') >= 2;
            },
            direct: true,
            content: function () {
                'step 0'
                player.chooseToDiscard(get.prompt2('decade_bahu'), 2).set('ai', function (card) {
                    return 6 - get.value(card);
                }).set('logSkill', 'decade_feiyang');
                'step 1'
                if (result.bool) player.discard(player.getCards('j'));
            },
        };
        lib.skill.decade_bahu = {
            charlotte: true,
            mod: {
                cardUsable: function (card, player, num) {
                    if (card.name == 'sha') return num + 1;
                },
            },
            trigger: { player: 'phaseZhunbeiBegin' },
            forced: true,
            content: function () {
                player.draw();
            },
        };
        lib.translate.decade_feiyang = '飞扬';
        lib.translate.decade_feiyang_info = '锁定技。①准备阶段，你摸一张牌。②你使用【杀】的额定次数+1。';
        lib.translate.decade_bahu = '跋扈';
        lib.translate.decade_bahu_info = '判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。';
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            if (!_status.characterlist) lib.skill.pingjian.initList();
            game.decadeDouDiZhu = {
                hasZhuSkill: () => false,
                $dieAfter: function () {
                    if (_status.video) return;
                    if (!this.node.dieidentity) {
                        var str = { zhu: '地主', fan: '农民' }[this.identity];
                        var node = ui.create.div('.damage.dieidentity', str, this);
                        ui.refresh(node);
                        node.style.opacity = 1;
                        this.node.dieidentity = node;
                    }
                    var trans = this.style.transform;
                    if (trans) {
                        if (trans.indexOf('rotateY') != -1) {
                            this.node.dieidentity.style.transform = 'rotateY(180deg)';
                        }
                        else if (trans.indexOf('rotateX') != -1) {
                            this.node.dieidentity.style.transform = 'rotateX(180deg)';
                        }
                        else {
                            this.node.dieidentity.style.transform = '';
                        }
                    }
                    else {
                        this.node.dieidentity.style.transform = '';
                    }
                },
                dieAfter: function () {
                    game.checkResult();
                },
                dieAfter2: function () {
                    if (this.identity != 'fan') return;
                    var player = this, target = game.findPlayer(function (current) {
                        return current != player && current.identity == 'fan';
                    });
                    if (target) {
                        if (target == game.me) {
                            ui.create.system('投降', function () {
                                game.log(game.me, '投降');
                                game.over(false);
                            }, true);
                        }
                        target.chooseDrawRecover(2);
                    }
                },
            };
            for (var i in game.decadeDouDiZhu) lib.element.player[i] = game.decadeDouDiZhu[i];
            for (var i of game.players) {
                for (var j in game.decadeDouDiZhu) i[j] = game.decadeDouDiZhu[j];
                i.identity = 'cai';
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
                if (!game.zhu.isAlive() || !game.players.some(function (current) {
                    return current.identity == 'fan';
                })) game.over((!game.zhu.isAlive() && game.me.identity == 'fan') || !game.players.some(function (current) {
                    return current.identity == 'fan';
                }) && game.me.identity == 'zhu');
            };
            game.broadcastAll(function () {
                if (get.is.phoneLayout()) ui.decade_ddzInfo = ui.create.div('.touchinfo.left', ui.window);
                else ui.decade_ddzInfo = ui.create.div(ui.gameinfo);
                ui.decade_ddzInfo.innerHTML = '抢地主阶段';
            });
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    "step 0"
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', 100);
                    ui.arena.classList.add('choose-character');
                    for (var i of game.players) {
                        if (i == game.me) i.init('bol_unknown_' + lib.config.extension_活动萌扩_chooseSex + get.rand(0, 6));
                        else i.init('bol_unknown_' + ['male', 'female'].randomGet() + get.rand(0, 6));
                    }
                    var target = game.players.randomGet();
                    event.control = ['一倍', '两倍', '三倍', '不叫'];
                    event.target = target;
                    event.beginner = target;
                    "step 1"
                    var control = event.control;
                    target.chooseControl(control).set('ai', function () {
                        return control.randomGet();
                    }).set('prompt', '是否' + (control.length == 4 ? '叫' : '抢') + '地主？');
                    "step 2"
                    var getBeiShu = function (control) {
                        switch (control) {
                            case '一倍': return 1; break;
                            case '两倍': return 2; break;
                            case '三倍': return 3; break;
                            case '不叫': return 0; break;
                        }
                    };
                    target.chat(result.control);
                    var num = event.control.indexOf(result.control);
                    target.max_beishu = getBeiShu(result.control);
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', target.max_beishu * 100);
                    if (result.control == '三倍') {
                        game.winner = target;
                        game.max_beishu = 3;
                    }
                    else {
                        if (target.next != event.beginner) game.delay(1.5);
                        if (result.control != '不叫') {
                            var temp = [];
                            for (var i = 0; i < event.control.length; i++) {
                                if (i > num) temp.push(event.control[i]);
                            }
                            event.control = temp;
                        }
                        if (target.next == event.beginner) {
                            if (event.control.length == 4) {
                                game.winner = event.beginner;
                                game.max_beishu = 1;
                            }
                            else {
                                var winner = game.findPlayer(function (current) {
                                    return !game.hasPlayer(function (currentx) {
                                        return current.max_beishu < currentx.max_beishu;
                                    });
                                });
                                game.winner = winner;
                                game.max_beishu = winner.max_beishu;
                            }
                        }
                        else {
                            event.target = target.next;
                            event.goto(1);
                        }
                    }
                    'step 3'
                    for (var i of game.players) {
                        i.identity = (game.winner == i ? 'zhu' : 'fan');
                        i.node.name.innerHTML = (game.winner == i ? '地主' : '农民');
                        i.OriginalSkills = game.doudizhuSkills.randomRemove(15);
                        i.setIdentity();
                        i.identityShown = true;
                        if (i.identity == 'zhu') game.zhu = i;
                    }
                    'step 4'
                    event.targets = game.players.sortBySeat(game.zhu).slice(0);
                    event.map = {};
                    game.zhu.maxHp = game.zhu.maxHp + 1;
                    game.zhu.hp = game.zhu.hp + 1;
                    game.zhu.update();
                    game.zhu.addSkill('decade_feiyang');
                    game.zhu.addSkill('decade_bahu');
                    'step 5'
                    var target = event.targets.shift();
                    event.target = target;
                    var list = target.OriginalSkills;
                    for (var i = 0; i < list.length; i++) list[i] = ['', '', 'skillCard_' + list[i]];
                    target.chooseButton(['请选择你的初始技能', [list, 'vcard']], true, game.zhu == target ? 3 : 2);
                    'step 6'
                    if (result.bool) {
                        var skills = [];
                        for (var i = 0; i < result.links.length; i++) {
                            skills.push(result.links[i][2].slice(10));
                        }
                        event.map[target.playerid] = skills;
                    }
                    if (event.targets.length) event.goto(5);
                    else {
                        for (var i of game.players) {
                            if (event.map[i.playerid]) i.addSkill(event.map[i.playerid]);
                        }
                    }
                    'step 7'
                    for (var i of game.players) delete i.max_beishu;
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                });
            };
        },
    },
};

export default brawl;