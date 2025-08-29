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
        //技能确定
        if (!_status.characterlist) lib.skill.pingjian.initList();
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
            filter(event, player) {
                return player.countCards('j') && player.countCards('h') >= 2;
            },
            direct: true,
            content() {
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
                cardUsable(card, player, num) {
                    if (card.name == 'sha') return num + 1;
                },
            },
            trigger: { player: 'phaseZhunbeiBegin' },
            forced: true,
            content() {
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
        chooseCharacterBefore() {
            if (!_status.characterlist) lib.skill.pingjian.initList();
            game.decadeDouDiZhu = {
                hasZhuSkill: () => false,
                $dieAfter() {
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
                dieAfter() {
                    game.checkResult();
                    const player = this;
                    if (player.identity === 'fan' && game.me.identity === 'fan' && game.me !== player) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                },
                dieAfter2() {
                    if (this.identity != 'fan') return;
                    const player = this, target = game.findPlayer(current => current !== player && current.identity == 'fan');
                    if (target) target.chooseDrawRecover(2);
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
            get.rawAttitude = function (from, to) {
                if (!from || !to) return 0;
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
            lib.onover.push(function (bool) {
                var num = game.max_beishu * 100 * (game.zhu == game.me ? 2 : 1);
                var numx = game.max_beishu * 100;
                if (bool == undefined) {
                    for (var i of game.filterPlayer2()) i.chat('+0');
                }
                else {
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
                }
            });
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    "step 0"
                    ui.arena.classList.add('choose-character');
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
                    game.broadcastAll(function () {
                        if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局倍数：' + game.max_beishu * 100;
                    });
                    for (var i of game.players) {
                        i.identity = (game.winner == i ? 'zhu' : 'fan');
                        i.OriginalSkills = game.doudizhuSkills.randomRemove(10);
                        i.OriginalCharacters = _status.characterlist.randomRemove(game.winner == i ? 5 : 3);
                        i.setIdentity();
                        i.identityShown = true;
                        if (i.identity == 'zhu') game.zhu = i;
                    }
                    'step 4'
                    event.targets = game.players.sortBySeat(game.zhu).slice(0);
                    event.map = {};
                    'step 5'
                    var target = event.targets.shift();
                    event.target = target;
                    var list = target.OriginalSkills;
                    for (var i = 0; i < list.length; i++) list[i] = ['', '', 'skillCard_' + list[i]];
                    target.chooseButton(['请选择你的初始角色和技能', [target.OriginalCharacters, 'character'], [list, 'vcard']], true, 2).set('filterButton', button => {
                        return _status.event.player.OriginalCharacters.includes(button.link) === Boolean(!ui.selected.buttons.length);
                    });
                    'step 6'
                    if (result.bool) {
                        event.map[target.playerid] = [result.links[0], result.links[1][2].slice(10)];
                    }
                    if (event.targets.length) event.goto(5);
                    else {
                        for (var i of game.players) {
                            if (event.map[i.playerid]) {
                                i.init(event.map[i.playerid][0]);
                                _status.characterlist.addArray(i.OriginalCharacters.filter(j => j != event.map[i.playerid][0]));
                                i.addSkill(event.map[i.playerid].slice(1));
                            }
                            if (i == game.zhu) {
                                game.zhu.maxHp = game.zhu.maxHp + 1;
                                game.zhu.hp = game.zhu.hp + 1;
                                game.zhu.addSkill(['decade_feiyang', 'decade_bahu']);
                                game.zhu.update();
                            }
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