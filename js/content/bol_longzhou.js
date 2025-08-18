import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '龙舟会战',
    mode: 'identity',
    intro: [
        '本模式为复刻OL经典模式龙舟会战，单将模式，禁用手气卡',
        '模式规则：本模式共分三关' +
        '<br>敌人数目：2/4/6（不同势力之间均为敌对关系，但会优先攻击玩家方）' +
        '<br>敌人初始手牌数：4/5/5' +
        '<br>敌人初始体力/体力上限加成：0/1/1' +
        '<br>三关均通过后游戏胜利。',
        '牌堆替换：【桃】替换为【粽】，【酒】替换为【雄黄酒】，【五谷丰登】和【桃园结义】替换为【力争上游】，【无中生有】替换为【同舟共济】，【南蛮入侵】和【万箭齐发】替换为【逆水行舟】，【诸葛连弩】替换为【连弩】。',
        '关于选将：' +
        '<br>选将框中会随机挑选五张势力相同的武将牌供玩家选择，选将势力可在扩展页面自由选择' +
        '<br>此模式中神武将的势力和玩家选择的势力相同',
        '武将等阶特权（等阶可在扩展页面自由选择）：' +
        '<br>一阶：无特权' +
        '<br>二阶：初始手牌数+1' +
        '<br>三阶：初始手牌数+1，初始体力/体力上限+1' +
        '<br>四阶：初始手牌数+2，初始体力/体力上限+1' +
        '<br>五阶：初始手牌数+2，初始体力/体力上限+2，获得技能【艾叶】（艾叶：限定技，当你处于濒死状态时，你可以弃置所有牌，然后复原你的武将牌，摸两张牌，将体力回复至2点）',
        '本模式中所有武将都拥有特殊的家族技能：' +
        '<br>魏·魏业：回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色须弃置一张牌，否则你摸一张牌。' +
        '<br>蜀·蜀义：你使用【杀】上限+1；出牌阶段结束时，若你于此阶段使用【杀】次数不少于2，摸一张牌。' +
        '<br>吴·吴耀：回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。' +
        '<br>群·群心：锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1' +
        '<br>晋·晋势：摸牌阶段结束时，你可以展示你于此阶段内因摸牌而获得的牌。若这些牌的花色均不同，则你摸一张牌。',
        '队友死亡后，会激活势力专属城池技能：' +
        '<br>魏·许昌：锁定技，当你受到伤害后，你摸一张牌。' +
        '<br>蜀·成都：锁定技，当你使用【杀】造成伤害后，你摸一张牌。' +
        '<br>吴·武昌：锁定技，当你使用装备牌时，你摸一张牌。' +
        '<br>群·邺城：锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。' +
        '<br>晋·洛阳：锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
        '击杀奖惩：击杀不同势力的角色和队友各摸一张牌；击杀队友的角色弃置所有牌。',
        '禁用将池：左慈，布骘，蔡文姬，大乔，徐晃，黄皓，灵雎，SP贾诩(OL)，司马师(手杀)，神貂蝉，神邓艾，标袁术(OL)',
    ],
    init: function () {
        if (!_status.characterlist) lib.skill.pingjian.initList();
        for (var i in lib.skill) {
            if (lib.skill[i].changeSeat) {
                lib.skill[i] = { audio: false };
                if (lib.translate[i + '_info']) lib.translate[i + '_info'] = '此模式下不可用';
                if (lib.translate[i + '_info_identity']) lib.translate[i + '_info_identity'] = '此模式下不可用';
                if (lib.dynamicTranslate[i]) lib.dynamicTranslate[i] = () => '此模式下不可用';
            }
        }
        _status.characterlist.removeArray(["sp_jiaxu", 'buzhi', "shen_diaochan", 'shen_dengai', "sp_guanyu", "simashi", "huanghao", 'ol_yuanshu']);
        for (var name of ["lingju", "zuoci", "xuhuang", "caiwenji", 'daqiao']) {
            _status.characterlist.removeArray(_status.characterlist.filter(i => i.indexOf(name) != -1));
        }
        lib.configOL.number = 4;
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        lib.config.singleControl = lib.config.extension_活动萌扩_singleControl;
        var pack = {
            character: {},
            card: {
                zong: {
                    image: 'ext:活动萌扩/image/zong.png',
                    fullimage: true,
                    type: 'basic',
                    cardcolor: 'red',
                    enable: function (card, player) {
                        return game.hasPlayer(function (target) {
                            return player.identity == target.identity && target.isDamaged();
                        });
                    },
                    filterTarget: function (card, player, target) {
                        return player.identity == target.identity && target.isDamaged();
                    },
                    content: function () {
                        target.recover();
                    },
                    ai: {
                        basic: {
                            order: function (card, player) {
                                if (player.hasSkillTag('pretao')) return 5;
                                return 2;
                            },
                            useful: [8, 6.5, 5, 4],
                            value: [8, 6.5, 5, 4],
                        },
                        result: {
                            player: function (player, target) {
                                return get.recoverEffect(target, player, player);
                            },
                        },
                        tag: {
                            recover: 1,
                        },
                    },
                },
                xionghuangjiu: {
                    image: 'ext:活动萌扩/image/xionghuangjiu.png',
                    fullimage: true,
                    type: "basic",
                    enable: function (event, player) {
                        return !player.hasSkill('jiu');
                    },
                    lianheng: true,
                    logv: false,
                    savable: function (card, player, dying) {
                        return dying == player;
                    },
                    usable: 1,
                    selectTarget: -1,
                    modTarget: true,
                    filterTarget: function (card, player, target) {
                        return target == player;
                    },
                    content: function () {
                        if (target.isDying()) {
                            target.recover();
                            if (_status.currentPhase == target) {
                                target.getStat().card.jiu--;
                            }
                        }
                        else {
                            if (cards && cards.length) {
                                card = cards[0];
                            }
                            game.broadcastAll(function (target, card, gain2) {
                                if (!target.storage.jiu) target.storage.jiu = 0;
                                target.storage.jiu++;
                                target.addSkill('jiu');
                                game.addVideo('jiuNode', target, true);
                                if (!target.node.jiu && lib.config.jiu_effect) {
                                    target.node.jiu = ui.create.div('.playerjiu', target.node.avatar);
                                    target.node.jiu2 = ui.create.div('.playerjiu', target.node.avatar2);
                                }
                                if (gain2 && card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                    card.clone.moveDelete(target);
                                }
                            }, target, card, target == targets[0]);
                            if (target == targets[0]) {
                                if (card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                    game.addVideo('gain2', target, get.cardsInfo([card]));
                                }
                            }
                        }
                    },
                    ai: {
                        basic: {
                            useful: function (card, i) {
                                if (_status.event.player.hp > 1) {
                                    if (i == 0) return 5;
                                    return 1;
                                }
                                if (i == 0) return 7.3;
                                return 3;
                            },
                            value: function (card, player, i) {
                                if (player.hp > 1) {
                                    if (i == 0) return 5;
                                    return 1;
                                }
                                if (i == 0) return 7.3;
                                return 3;
                            },
                        },
                        order: function () {
                            return get.order({ name: 'sha' }) + 0.2;
                        },
                        result: {
                            target: function (player, target) {
                                if (target && target.isDying()) return 2;
                                if (lib.config.mode == 'stone' && !player.isMin()) {
                                    if (player.getActCount() + 1 >= player.actcount) return 0;
                                }
                                var shas = player.getCards('h', 'sha');
                                if (shas.length > 1 && player.getCardUsable('sha') > 1) {
                                    return 0;
                                }
                                var card;
                                if (shas.length) {
                                    for (var i = 0; i < shas.length; i++) {
                                        if (lib.filter.filterCard(shas[i], target)) {
                                            card = shas[i]; break;
                                        }
                                    }
                                }
                                else if (player.hasSha() && player.needsToDiscard()) {
                                    if (player.countCards('h', 'hufu') != 1) {
                                        card = { name: 'sha' };
                                    }
                                }
                                if (card) {
                                    if (game.hasPlayer(function (current) {
                                        return (get.attitude(target, current) < 0 &&
                                            target.canUse(card, current, true, true) &&
                                            !current.getEquip('baiyin') &&
                                            get.effect(current, card, target) > 0);
                                    })) {
                                        return 1;
                                    }
                                }
                                return 0;
                            },
                        },
                        tag: {
                            save: 1
                        },
                    },
                },
                tongzhougongji: {
                    image: 'ext:活动萌扩/image/tongzhougongji.png',
                    fullimage: true,
                    enable: true,
                    type: 'trick',
                    selectTarget: -1,
                    filterTarget: function (card, player, target) {
                        return player.identity == target.identity;
                    },
                    content: function () {
                        target.draw('nodelay');
                    },
                    ai: {
                        basic: {
                            order: 9,
                            useful: 3,
                            value: 4,
                        },
                        result: {
                            target: 1,
                        },
                        tag: {
                            draw: 1,
                            multitarget: 1,
                        },
                    },
                },
                lizhengshangyou: {
                    image: 'ext:活动萌扩/image/lizhengshangyou.png',
                    fullimage: true,
                    type: 'trick',
                    enable: true,
                    selectTarget: -1,
                    filterTarget: true,
                    content: function () {
                        target.draw(player.identity == target.identity ? game.countGroup() : 1, 'nodelay');
                    },
                    ai: {
                        basic: {
                            order: 7,
                            useful: 5,
                            value: 7,
                        },
                        result: {
                            target: function (player, target) {
                                return player.identity == target.identity ? 100 : 1;
                            },
                        },
                        tag: {
                            draw: 3,
                            multitarget: 1,
                        },
                    },
                },
                nishuixingzhou: {
                    image: 'ext:活动萌扩/image/nishuixingzhou.png',
                    fullimage: true,
                    enable: true,
                    type: 'trick',
                    filterTarget: function (card, player, target) {
                        return player.identity != target.identity;
                    },
                    content: function () {
                        for (var i of game.filterPlayer(function (current) {
                            return target.identity == current.identity;
                        })) {
                            player.line(i);
                            i.damage();
                        }
                    },
                    ai: {
                        basic: {
                            order: 7.2,
                            useful: 7,
                            value: 7.5,
                        },
                        result: {
                            target: -1,
                        },
                        tag: {
                            damage: 1
                        },
                    },
                },
                liannu: {
                    image: 'ext:活动萌扩/image/liannu.png',
                    fullimage: true,
                    type: 'equip',
                    subtype: 'equip1',
                    ai: {
                        order: function () {
                            return get.order({ name: 'sha' }) - 0.1;
                        },
                        equipValue: function (card, player) {
                            if (player._liannu_temp) return 1;
                            player._liannu_temp = true;
                            var result = function () {
                                if (!game.hasPlayer(function (current) {
                                    return get.distance(player, current) <= 1 && player.canUse('sha', current) && get.effect(current, { name: 'sha' }, player, player) > 0;
                                })) {
                                    return 1;
                                }
                                if (player.hasSha() && _status.currentPhase == player) {
                                    if (player.getEquip('liannu') && player.countUsed('sha') || player.getCardUsable('sha') == 0) {
                                        return 10;
                                    }
                                }
                                var num = player.countCards('h', 'sha');
                                if (num > 1) return 6 + num;
                                return 3 + num;
                            }();
                            delete player._liannu_temp;
                            return result;
                        },
                        basic: {
                            equipValue: 5
                        },
                        tag: {
                            valueswap: 1
                        },
                    },
                    skills: ['liannu_skill'],
                },
            },
            skill: {
                //非同身份不能救助
                _longzhou_save: {
                    charlotte: true,
                    ruleSkill: true,
                    mod: {
                        cardSavable: function (card, player, target) {
                            if (player.identity != target.identity) return false;
                        },
                    },
                },
                //家族技能
                _LZ_jiazu_wei: {
                    trigger: { player: 'phaseBegin' },
                    direct: true,
                    filter: function (event, player) {
                        return player.identity == 'wei' && player.countCards('he') > 0;
                    },
                    content: function () {
                        'step 0'
                        player.chooseCardTarget({
                            prompt: get.prompt2(event.name),
                            filterCard: lib.filter.cardDiscardable,
                            filterTarget: function (card, player, target) {
                                return player.identity != target.identity;
                            },
                            position: 'he',
                            ai1: function (card) {
                                return 6 - get.value(card);
                            },
                            ai2: function (target) {
                                var player = _status.event.player;
                                return (2 - get.sgn(get.attitude(player, target))) / (target.countCards('he') + 1);
                            },
                        });
                        'step 1'
                        if (result.bool) {
                            player.logSkill(event.name, result.targets);
                            player.discard(result.cards);
                            result.targets[0].chooseToDiscard('弃置一张牌，或令' + get.translation(player) + '摸一张牌', 'he').ai = lib.skill.zhiheng.check;
                        }
                        else event.finish();
                        'step 2'
                        if (!result.bool) player.draw();
                    },
                },
                _LZ_jiazu_shu: {
                    mod: {
                        cardUsable: function (card, player, num) {
                            if (card.name == 'sha' && player.identity == 'shu') return num + 1;
                        },
                    },
                    trigger: { player: 'phaseUseEnd' },
                    forced: true,
                    filter: function (event, player) {
                        return player.identity == 'shu' && player.getHistory('useCard', function (evt) {
                            return evt.card && evt.card.name == 'sha' && evt.getParent('phaseUse') == event;
                        }).length > 1;
                    },
                    content: function () {
                        player.draw();
                    },
                },
                _LZ_jiazu_wu: {
                    trigger: { player: 'phaseEnd' },
                    forced: true,
                    filter: function (event, player) {
                        return player.identity == 'wu' && player.countCards('h') != player.hp;
                    },
                    content: function () {
                        player.draw();
                    },
                },
                _LZ_jiazu_qun: {
                    trigger: { player: 'phaseDiscardBegin' },
                    forced: true,
                    filter: function (event, player) {
                        return player.identity == 'qun' && (player.isDamaged() || player.countCards('h') - player.hp > 1);
                    },
                    content: function () {
                        var num = 0;
                        if (player.isDamaged()) num++;
                        if (player.countCards('h') - player.hp > 1) num++;
                        player.addMark('LZqunxin_temp', num, false);
                        player.addTempSkill('LZqunxin_temp', 'phaseDiscardEnd');
                    },
                },
                _LZ_jiazu_jin: {
                    trigger: { player: 'phaseDrawEnd' },
                    filter: function (event, player) {
                        var hs = player.getCards('h');
                        return player.identity == 'jin' && hs.length > 0 && player.getHistory('gain', function (evt) {
                            if (evt.getParent().name != 'draw' || evt.getParent('phaseDraw') != event) return false;
                            for (var i of evt.cards) {
                                if (hs.includes(i)) return true;
                            }
                            return false;
                        }).length > 0;
                    },
                    check: function (event, player) {
                        var hs = player.getCards('h'), cards = [], suits = [];
                        player.getHistory('gain', function (evt) {
                            if (evt.getParent().name != 'draw' || evt.getParent('phaseDraw') != event) return false;
                            for (var i of evt.cards) {
                                if (hs.includes(i)) {
                                    cards.add(i);
                                    suits.add(get.suit(i, player));
                                }
                            }
                        });
                        return cards.length == suits.length;
                    },
                    content: function () {
                        var hs = player.getCards('h'), cards = [], suits = [];
                        player.getHistory('gain', function (evt) {
                            if (evt.getParent().name != 'draw' || evt.getParent('phaseDraw') != trigger) return false;
                            for (var i of evt.cards) {
                                if (hs.includes(i)) {
                                    cards.add(i);
                                    suits.add(get.suit(i, player));
                                }
                            }
                        });
                        player.showCards(cards, get.translation(player) + '发动了【晋势】');
                        if (cards.length == suits.length) player.draw();
                    },
                },
                LZqunxin_temp: {
                    noGlobal: true,
                    onremove: true,
                    mod: {
                        maxHandcard: function (player, num) {
                            return num + player.countMark('LZqunxin_temp');
                        },
                    },
                },
                _LZ_jiazu_awaken_wei: {
                    popup: '许昌',
                    intro: {
                        content: '锁定技，当你受到伤害后，你摸一张牌。',
                    },
                    trigger: { player: 'damageEnd' },
                    forced: true,
                    filter: function (event, player) {
                        return player._LZ_jiazuAwaken && player.identity == 'wei';
                    },
                    content: function () {
                        player.draw();
                    },
                },
                _LZ_jiazu_awaken_shu: {
                    popup: '成都',
                    intro: {
                        content: '锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
                    },
                    trigger: { source: 'damageSource' },
                    forced: true,
                    filter: function (event, player) {
                        return player._LZ_jiazuAwaken && player.identity == 'shu' && event.card && event.card.name == 'sha';
                    },
                    content: function () { player.draw() },
                },
                _LZ_jiazu_awaken_wu: {
                    popup: '武昌',
                    intro: {
                        content: '锁定技，当你使用装备牌时，你摸一张牌。',
                    },
                    trigger: { player: 'useCard' },
                    forced: true,
                    filter: function (event, player) {
                        return player._LZ_jiazuAwaken && player.identity == 'wu' && get.type(event.card) == 'equip';
                    },
                    content: function () {
                        player.draw();
                    },
                },
                _LZ_jiazu_awaken_qun: {
                    popup: '邺城',
                    intro: {
                        content: '锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
                    },
                    trigger: { player: 'useCardToPlayered' },
                    forced: true,
                    filter: function (event, player) {
                        if (!player._LZ_jiazuAwaken || player.identity != 'qun' || !event.isFirstTarget || get.type(event.card, 'trick') != 'trick') return false;
                        for (var i = 0; i < event.targets.length; i++) {
                            if (event.targets[i] != player) return true;
                        }
                        return false;
                    },
                    content: function () {
                        player.draw();
                    },
                },
                _LZ_jiazu_awaken_jin: {
                    popup: '洛阳',
                    intro: {
                        content: '锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
                    },
                    trigger: { player: 'phaseJieshuBegin' },
                    forced: true,
                    filter: function (event, player) {
                        if (!player._LZ_jiazuAwaken || player.identity != 'jin') return false;
                        var hs = player.getCards('h'), suits = [];
                        if (hs.length < 3) return true;
                        for (var i of hs) {
                            suits.add(get.suit(i, player));
                            if (suits.length > 2) return false;
                        }
                        return true;
                    },
                    content: function () {
                        player.draw();
                    },
                },
                //觉醒二段技能
                _LZ_jiazu_awaken: {
                    trigger: { global: 'die' },
                    forced: true,
                    filter: function (event, player) {
                        return !player._LZ_jiazuAwaken && event.player.identity == player.identity;
                    },
                    content: function () {
                        player._LZ_jiazuAwaken = true;
                        var name = '_LZ_jiazu_awaken_' + player.identity;
                        if (lib.skill[name]) player.markSkill(name);
                    },
                },
                //艾叶
                LZ_aiye: {
                    charlotte: true,
                    unique: true,
                    enable: 'chooseToUse',
                    mark: true,
                    limited: true,
                    skillAnimation: true,
                    animationColor: 'wood',
                    filter: function (event, player) {
                        if (event.type == 'dying') {
                            if (player != event.dying) return false;
                            return true;
                        }
                        return false;
                    },
                    content: function () {
                        'step 0'
                        player.awakenSkill('LZ_aiye');
                        player.discard(player.getCards('he'));
                        'step 1'
                        player.link(false);
                        player.turnOver(false);
                        'step 2'
                        player.draw(2);
                        if (player.hp < 2) player.recover(2 - player.hp);
                    },
                    ai: {
                        order: 0.1,
                        save: true,
                        skillTagFilter: function (player, arg, target) {
                            return target == player;
                        },
                        result: { player: 1 },
                    },
                },
                liannu_skill: {
                    equipSkill: true,
                    audio: 'zhuge',
                    firstDo: true,
                    trigger: { player: 'useCard1' },
                    forced: true,
                    filter: function (event, player) {
                        return !event.audioed && event.card.name == 'sha' && player.countUsed('sha', true) > 1 && event.getParent().type == 'phase';
                    },
                    content: function () {
                        trigger.audioed = true;
                    },
                    mod: {
                        cardUsable: function (card, player, num) {
                            var cardx = player.getEquip('liannu');
                            if (card.name == 'sha' && (!cardx || player.hasSkill('liannu_skill', null, false) || (!_status.liannu_temp && !ui.selected.cards.includes(cardx)))) {
                                return num + 3;
                            }
                        },
                        cardEnabled2: function (card, player) {
                            if (!_status.event.addCount_extra || player.hasSkill('liannu_skill', null, false)) return;
                            if (card && card == player.getEquip('liannu')) {
                                try {
                                    var cardz = get.card();
                                }
                                catch (e) {
                                    return;
                                }
                                if (!cardz || cardz.name != 'sha') return;
                                _status.liannu_temp = true;
                                var bool = lib.filter.cardUsable(get.autoViewAs({ name: 'sha' }, ui.selected.cards.concat([card])), player);
                                delete _status.liannu_temp;
                                if (!bool) return false;
                            }
                        },
                    },
                },
            },
            translate: {
                _LZ_jiazu_wei: '魏业',
                _LZ_jiazu_wei_info: '回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色选择一项：①弃置一张牌；②你摸一张牌。',
                _LZ_jiazu_shu: '蜀义',
                _LZ_jiazu_shu_info: '你使用【杀】上限+1；出牌阶段结束时，若你于此阶段使用【杀】的次数不少于2，摸一张牌。',
                _LZ_jiazu_wu: '吴耀',
                _LZ_jiazu_wu_info: '回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。',
                _LZ_jiazu_qun: '群心',
                _LZ_jiazu_qun_info: '锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1',
                _LZ_jiazu_jin: '晋势',
                _LZ_jiazu_jin_info: '摸牌阶段结束时，你可以展示你于此阶段内因摸牌而获得的牌。若这些牌的花色均不同，则你摸一张牌。',
                _LZ_jiazu_awaken_wei: '许昌',
                _LZ_jiazu_awaken_wei_info: '锁定技，当你受到伤害后，你摸一张牌。',
                _LZ_jiazu_awaken_shu: '成都',
                _LZ_jiazu_awaken_shu_info: '锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
                _LZ_jiazu_awaken_wu: '武昌',
                _LZ_jiazu_awaken_wu_info: '锁定技，当你使用装备牌时，你摸一张牌。',
                _LZ_jiazu_awaken_qun: '邺城',
                _LZ_jiazu_awaken_qun_info: '锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
                _LZ_jiazu_awaken_jin: '洛阳',
                _LZ_jiazu_awaken_jin_info: '锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
                zong: '粽',
                zong_info: '出牌阶段，对自己或队友使用，目标角色回复1点体力。',
                xionghuangjiu: '雄黄酒',
                xionghuangjiu_info: '①出牌阶段对自己使用，本回合使用的下一张【杀】伤害+1；②当你处于濒死状态时，对自己使用，你回复1点体力。',
                tongzhougongji: '同舟共济',
                tongzhougongji_info: '出牌阶段，对自己和队友使用，目标角色各摸一张牌。',
                lizhengshangyou: '力争上游',
                lizhengshangyou_info: '出牌阶段，对所有角色使用，你和与你势力相同的角色各摸x张牌，其他角色摸一张牌（x为当前场上势力数）。',
                nishuixingzhou: '逆水行舟',
                nishuixingzhou_info: '出牌阶段，对一名与你势力不同的角色使用，对其和与其势力相同的角色各造成1点伤害。',
                LZ_aiye: '艾叶',
                LZ_aiye_info: '限定技，当你处于濒死状态时，你可以弃置所有牌，然后复原你的武将牌，摸两张牌，将体力回复至2点。',
                liannu: '连弩',
                liannu_skill: '连弩',
                liannu_info: '锁定技，出牌阶段，你使用【杀】的次数上限+3。',
                liannu_skill_info: '锁定技，出牌阶段，你使用【杀】的次数上限+3。',
            },
        };
        game.bolLoadPack(pack);
    },
    content: {
        submode: 'normal',
        //牌堆替换
        cardPile: function () {
            for (var i = 0; i < lib.card.list.length; i++) {
                switch (lib.card.list[i][2]) {
                    case 'tao': lib.card.list[i][2] = 'zong'; break;
                    case 'jiu': lib.card.list[i][2] = 'xionghuangjiu'; break;
                    case 'wuzhong': lib.card.list[i][2] = 'tongzhougongji'; break;
                    case 'zhuge': lib.card.list[i][2] = 'liannu'; break;
                    case 'wugu': case 'taoyuan': lib.card.list[i][2] = 'lizhengshangyou'; break;
                    case 'nanman': case 'wanjian': lib.card.list[i][2] = 'nishuixingzhou'; break;
                    case 'bingliang': case 'lebu': case 'shandian': lib.card.list.splice(i--, 1); break;
                }
            }
            return lib.card.list;
        },
        //更改游戏配置
        chooseCharacterBefore: function () {
            //游戏初始阵型
            game.statusNum = 1;
            if (!lib.config.extension_活动萌扩_chooseGroup) lib.config.extension_活动萌扩_chooseGroup = 'wei';
            if (!lib.config.extension_活动萌扩_getLevel) lib.config.extension_活动萌扩_getLevel = '1';
            var choice = lib.config.extension_活动萌扩_chooseGroup;
            var list = [];
            var groupList = ['wei', 'shu', 'wu', 'qun', 'jin'].randomSort();
            groupList.remove(choice);
            groupList = groupList.randomGets(1);
            for (var i of [choice].addArray(groupList)) {
                for (var j = 1; j <= 2; j++) {
                    list.push(i);
                }
            }
            var zhenxing = list;
            game.players = game.players.sortBySeat([game.me, game.me[game.players.indexOf(game.me) % 2 == 0 ? 'previous' : 'pnext']].randomGet());
            _status.firstAct = game.zhu = game.players[0];
            var current = _status.firstAct, currentSeat = 0;
            //覆盖一些设置
            game.LZelement = {
                getFriends: function (func) {
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
                isFriendOf: function (player) {
                    return this.getFriends(true).includes(player);
                },
                getEnemies: function (func) {
                    var player = this, identity = player.identity;
                    return game.filterPlayer(function (current) {
                        return current.identity != identity;
                    });
                },
                isEnemyOf: function (player) {
                    return this.getEnemies(true).includes(player);
                },
                logAi: function () { },
                hasZhuSkill: function (skill) {
                    return false;
                },
                dieAfter: function (source) {
                    if (source) {
                        if (source.identity != this.identity) {
                            var fellow = game.findPlayer(function (current) {
                                return current != source && current.identity == source.identity;
                            })
                            if (fellow) fellow.draw('nodelay');
                            source.draw();
                        }
                        else source.discard(source.getCards('he'));
                    }
                    game.checkResult();
                },
            };
            for (var i in game.LZelement) lib.element.player[i] = game.LZelement[i];
            //定义座位号和座位号显示
            while (true) {
                for (var i in game.LZelement) current[i] = game.LZelement[i];
                current.identity = zhenxing[currentSeat];
                current.setSeatNum(currentSeat + 1);
                current.setNickname(get.cnNumber(currentSeat + 1, true) + '号位');
                current.setIdentity();
                current.identityShown = true;
                current.update();
                currentSeat++;
                current = current.next;
                if (current == _status.firstAct) break;
            }
            //设置态度值
            get.rawAttitude = function (from, to) {
                var identity = game.me.identity;
                if (!from || !to) return 0;
                if (from.identity == to.identity) return 10;
                if (from != to && (from.identity == identity || to.identity == identity)) return -10;
                return -7.5;
            };
            game.showIdentity(true);
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
                        if (game.statusNum == 3) game.over(true);
                        else {
                            game.statusNum++;
                            game.broadcastAll(function () {
                                if (ui.LongZhouInfo) ui.LongZhouInfo.innerHTML = '龙舟会战：第' + get.cnNumber(game.statusNum, true) + '回合';
                            });
                            ui.arena.setNumber(game.statusNum * 2 + 2);
                            var groupList = ['wei', 'shu', 'wu', 'qun', 'jin'].remove(game.me.identity);
                            groupList = groupList.randomGets(game.statusNum);
                            var tempNum = 3;
                            if (fellow && game.me.getSeatNum() > fellow.getSeatNum()) fellow.dataset.position = game.statusNum * 2 + 1;
                            while (game.dead.filter(function (target) {
                                return target.identity != game.me.identity;
                            }).length) {
                                var target = game.dead.filter(function (target) {
                                    return target.identity != game.me.identity;
                                })[0];
                                if (target) {
                                    target.revive(null, false);
                                    target.uninit();
                                    target.identity = groupList[game.players.addArray(game.filterPlayer2(function (current) {
                                        return current.identity == game.me.identity && !current.isAlive();
                                    })).length - 1 < 4 ? 0 : 1];
                                    target.setIdentity();
                                    target.identityShown = true;
                                    var listxx = [];
                                    for (var name of _status.characterlist) {
                                        if (lib.character[name][1] == target.identity) listxx.push(name);
                                    }
                                    var character = listxx.randomGet();
                                    _status.characterlist.remove(character);
                                    target.init(character);
                                    target.maxHp = target.maxHp + 1;
                                    target.hp = target.hp + 1;
                                    target.update();
                                    if (target.countCards('hejsx')) {
                                        var hs = target.getCards('hejsx')
                                        for (var i = 0; i < hs.length; i++) {
                                            hs[i].discard(false);
                                        }
                                    }
                                    target.directgain(get.cards(5));
                                    for (var i in game.LZelement) target[i] = game.LZelement[i];
                                    target.dataset.position = tempNum - game.me.getSeatNum();
                                    if (target._LZ_jiazuAwaken) delete target._LZ_jiazuAwaken;
                                    tempNum++;
                                }
                                else break;
                            }
                            for (var num = 1; num <= 2; num++) {
                                var listx = [];
                                for (var name of _status.characterlist) {
                                    if (lib.character[name][1] == groupList[game.statusNum - 1]) listx.push(name);
                                }
                                var character = listx.randomGet();
                                _status.characterlist.remove(character);
                                var target = game.addFellow(tempNum - game.me.getSeatNum(), character);
                                target.identity = groupList[game.statusNum - 1];
                                target.setIdentity();
                                target.identityShown = true;
                                target.maxHp = target.maxHp + 1;
                                target.hp = target.hp + 1;
                                target.update();
                                tempNum++;
                                target.directgain(get.cards(5));
                                for (var i in game.LZelement) target[i] = game.LZelement[i];
                            }
                            //清空技能记录
                            for (var player of game.players) {
                                player.removeSkill('counttrigger');
                                delete player.storage.counttrigger;
                            }
                            //分配座位号
                            var current;
                            if (game.me.isAlive()) current = ((fellow && game.me.next == fellow) ? game.me.next.next : game.me.next);
                            else current = fellow.next;
                            while (![game.me, fellow].includes(current)) {
                                current.setSeatNum(current.previous.getSeatNum() + 1);
                                current.setNickname(get.cnNumber(current.previous.getSeatNum() + 1, true) + '号位');
                                current = current.next;
                            }
                            //新的开始
                            while (_status.event.name != 'phaseLoop') {
                                _status.event = _status.event.parent;
                            }
                            game.resetSkills();
                            var first = game.findPlayer(function (current) {
                                return current.getSeatNum() && !game.hasPlayer(function (target) {
                                    if (!target.getSeatNum()) return false;
                                    return target.getSeatNum() < current.getSeatNum();
                                });
                            });
                            _status.paused = false;
                            _status.event.player = first;
                            _status.event.step = 0;
                            _status.roundStart = first;
                            game.phaseNumber = 0;
                            game.roundNumber = 0;
                            game.updateRoundNumber();
                        }
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
                    //神势力角色势力变更为玩家方势力
                    for (var name of _status.characterlist) {
                        if (lib.character[name][1] == 'shen') lib.character[name][1] = game.me.identity;
                    }
                    ui.arena.classList.add('choose-character');
                    //第一轮敌人初始化
                    for (var i of game.players) {
                        if (i.identity != game.me.identity) {
                            var character = _status.characterlist.filter(function (name) {
                                return lib.character[name][1] == i.identity;
                            }).randomGet();
                            _status.characterlist.remove(character);
                            i.init(character);
                        }
                    }
                    game.broadcastAll(function () {
                        if (get.is.phoneLayout()) ui.LongZhouInfo = ui.create.div('.touchinfo.left', ui.window);
                        else ui.LongZhouInfo = ui.create.div(ui.gameinfo);
                        ui.LongZhouInfo.innerHTML = '龙舟会战：第' + get.cnNumber(game.statusNum, true) + '回合';
                    });
                    'step 1'
                    //玩家方选将
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
                    var list = [];
                    for (var name of _status.characterlist) {
                        if (lib.character[name][1] == game.me.identity) list.push(name);
                    }
                    list = list.randomGets(10);
                    var aiList = list.randomRemove(5);
                    event.aiList = aiList;
                    var createDialog = [lib.config.singleControl ? '请选择你和队友的武将' : '请选择你的武将'];
                    createDialog.push('<div class="text center">玩家武将</div>');
                    createDialog.push([list, 'character']);
                    var fellow = game.findPlayer(function (current) {
                        return current != game.me && current.identity == game.me.identity;
                    });
                    if (fellow) {
                        if (lib.config.singleControl) {
                            game.addGlobalSkill('autoswap');
                            fellow._trueMe = game.me;
                        }
                        createDialog.push('<div class="text center">队友武将</div>');
                        createDialog.push([aiList, 'character']);
                    }
                    game.me.chooseButton(createDialog, (lib.config.singleControl ? 2 : 1), true).set('onfree', true).set('filterButton', function (button) {
                        if (!ui.selected.buttons.length) return _status.event.list.includes(button.link);
                        return _status.event.listx.includes(button.link);
                    }).set('ai', function (button) {
                        if (!ui.selected.buttons.length) return getCharacter(_status.event.list);
                        return getCharacter(_status.event.listx);
                    }).set('list', list).set('listx', aiList);
                    'step 2'
                    //玩家方初始化
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
                    switch (lib.config.extension_活动萌扩_getLevel) {
                        case '2':
                            game.me.directgain(get.cards(1));
                            break;
                        case '3':
                            game.me.directgain(get.cards(1));
                            game.me.maxHp = game.me.maxHp + 1;
                            game.me.hp = game.me.hp + 1;
                            game.me.update();
                            break;
                        case '4':
                            game.me.directgain(get.cards(2));
                            game.me.maxHp = game.me.maxHp + 1;
                            game.me.hp = game.me.hp + 1;
                            game.me.update();
                            break;
                        case '5':
                            game.me.addSkill('LZ_aiye');
                            game.me.directgain(get.cards(2));
                            game.me.maxHp = game.me.maxHp + 2;
                            game.me.hp = game.me.hp + 2;
                            game.me.update();
                            break;
                    }
                    var fellow = game.findPlayer(function (current) {
                        return current != game.me && current.identity == game.me.identity;
                    });
                    if (fellow) {
                        if (lib.config.singleControl) fellow.init(result.links[1]);
                        else fellow.init(getCharacter(event.aiList).randomGet());
                        switch (lib.config.extension_活动萌扩_getLevel) {
                            case '2':
                                fellow.directgain(get.cards(1));
                                break;
                            case '3':
                                fellow.directgain(get.cards(1));
                                fellow.maxHp = fellow.maxHp + 1;
                                fellow.hp = fellow.hp + 1;
                                fellow.update();
                                break;
                            case '4':
                                fellow.directgain(get.cards(2));
                                fellow.maxHp = fellow.maxHp + 1;
                                fellow.hp = fellow.hp + 1;
                                fellow.update();
                                break;
                            case '5':
                                fellow.addSkill('LZ_aiye');
                                fellow.directgain(get.cards(2));
                                fellow.maxHp = fellow.maxHp + 2;
                                fellow.hp = fellow.hp + 2;
                                fellow.update();
                                break;
                        }
                    }
                    if (!fellow || lib.config.singleControl) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                    'step 3'
                    if (lib.config.singleControl) {
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