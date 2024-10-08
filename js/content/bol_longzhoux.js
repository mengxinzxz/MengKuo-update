import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '龙舟会战<br>2023',
    mode: 'identity',
    intro: [
        '本模式为复刻OL龙舟会战2023年版本，单将模式，禁用手气卡',
        '模式规则：本模式共分两关' +
        '<br>敌人数目：2/6（不同势力之间均为敌对关系，但会优先攻击玩家方）' +
        '<br>敌人初始等阶：第一关随机3，4阶，第二关随机3，4，5阶' +
        '<br>三关均通过后游戏胜利。',
        '牌堆替换：【酒】替换为【雄黄酒】，【五谷丰登】和【桃园结义】替换为【力争上游】，【无中生有】替换为【同舟共济】，【南蛮入侵】和【万箭齐发】替换为【逆水行舟】。',
        '关于选将：' +
        '<br>选将框中会随机挑选五张势力相同的武将牌供玩家选择，选将势力可在扩展页面自由选择' +
        '<br>此模式中神武将的势力和玩家选择的势力相同',
        '武将等阶特权（等阶可在扩展页面自由选择）：' +
        '<br>一阶：无特权' +
        '<br>二阶：初始手牌数+1' +
        '<br>三阶：初始手牌数+1，初始体力/体力上限+1，使用【杀】的额定次数+1' +
        '<br>四阶：初始手牌数+2，初始体力/体力上限+1，使用【杀】的额定次数+1' +
        '<br>五阶：初始手牌数+2，初始体力/体力上限+2，使用【杀】的额定次数+1，获得技能【重生】（仅玩家方获得，重生：限定技，当你处于濒死状态时，你可以弃置判定区内的所有牌，然后复原你的武将牌，摸五张牌，将体力回复至体力上限（至多为5））',
        '本模式中所有武将都拥有特殊的家族技能：' +
        '<br>魏·魏业：回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色须弃置一张牌，否则你摸一张牌。' +
        '<br>蜀·蜀义：出牌阶段结束时，若你于此阶段使用【杀】次数不少于2，摸一张牌。' +
        '<br>吴·吴耀：回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。' +
        '<br>群·群心：锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1' +
        '<br>晋·晋势：回合开始时，你可以弃置一张牌，从牌堆中随机获得一张与此牌花色相同的牌。',
        '队友死亡后，会激活势力专属城池技能：' +
        '<br>魏·许昌：锁定技，当你受到伤害后，你摸一张牌。' +
        '<br>蜀·成都：锁定技，当你使用【杀】造成伤害后，你摸一张牌。' +
        '<br>吴·武昌：锁定技，当你使用装备牌时，你摸一张牌。' +
        '<br>群·邺城：锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。' +
        '<br>晋·洛阳：锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
        '击杀奖惩：击杀不同势力的角色和队友各摸一张牌；击杀队友的角色弃置所有牌。',
        '禁用将池：左慈，布骘，蔡文姬，大乔，徐晃，黄皓(OL)，灵雎，SP贾诩(OL)，司马师(手杀)，神貂蝉，神邓艾，标袁术(OL)',
        '2023年龙舟会战新机制：粽子' +
        '<br>①所有角色于游戏开始时获得2个“粽”标记，玩家方随机使用一张装备牌，所有角色每造成1点伤害获得1个“棕”标记，击杀其他角色可获得该角色的所有“棕”标记' +
        '<br>②每一整局龙舟会战会随机进行一个有关“棕”标记的全局效果' +
        '<br>·大快朵颐：使用锦囊牌时失去2个“棕”标记，摸一张牌。' +
        '<br>·五味俱全：造成伤害时失去4个“棕”标记，令此伤害+1。' +
        '<br>·回味无穷：使用【杀】造成伤害后失去2个“棕”标记，摸一张牌。' +
        '<br>·珠翠之珍：使用装备牌时失去1个“棕”标记，摸一张牌。' +
        '<br>·津津有味：使用【桃】回复体力后失去4个“棕”标记，回复1点体力。' +
        '<br>·珍馐美馔：摸牌阶段开始时失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。' +
        '<br>·垂涎欲滴：结束阶段失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。' +
        '<br>·酒足饭饱：①若你的“棕”标记数：不小于2，摸牌阶段多摸一张牌；不小于4，使用牌无距离限制；不小于6，使用【杀】的额定次数+1。②结束阶段，你失去X个“棕”标记（X为你的“棕”标记数，向下取整）',
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
                    trigger: { player: 'phaseBegin' },
                    filter: function (event, player) {
                        var hs = player.getCards('h');
                        return player.identity == 'jin' && player.countCards('he');
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
                    direct: true,
                    content: function () {
                        'step 0'
                        player.chooseToDiscard('he', get.prompt2('_LZ_jiazu_jin')).set('ai', function (card) {
                            if (!get.cardPile2(function (cardx) {
                                return get.suit(cardx, false) == get.suit(card, player);
                            })) return -1;
                            return lib.skill.zhiheng.check(card);
                        }).logSkill = '_LZ_jiazu_jin';
                        'step 1'
                        if (result.bool) {
                            var suit = get.suit(result.cards[0], player);
                            var card = get.cardPile2(function (card) {
                                return get.suit(card, false) == suit;
                            });
                            if (card) player.gain(card, 'gain2');
                        }
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
                //重生
                LZ_chongsheng: {
                    charlotte: true,
                    unique: true,
                    enable: 'chooseToUse',
                    mark: true,
                    limited: true,
                    skillAnimation: true,
                    animationColor: 'orange',
                    filter: function (event, player) {
                        if (event.type == 'dying') {
                            if (player != event.dying) return false;
                            return true;
                        }
                        return false;
                    },
                    content: function () {
                        'step 0'
                        player.awakenSkill('LZ_chongsheng');
                        player.discard(player.getCards('j'));
                        'step 1'
                        player.link(false);
                        player.turnOver(false);
                        'step 2'
                        player.draw(5);
                        if (player.hp < 5) player.recover(5 - player.hp);
                    },
                    ai: {
                        order: 10,
                        save: true,
                        skillTagFilter: function (player, arg, target) {
                            if (player != target) return false;
                        },
                        result: { player: 1 },
                    },
                },
                //2023年新机制粽子
                //粽+全局效果
                _lz_zong_mark: {
                    mod: {
                        cardUsable: function (card, player, num) {
                            if (card.name == 'sha' && player.lz_levelNum && parseInt(player.lz_levelNum) >= 3) return num + 1;
                        },
                    },
                    marktext: '粽',
                    intro: { name2: '棕', content: 'mark' },
                    charlotte: true,
                    trigger: { source: ['damageBegin4', 'dieBegin'] },
                    filter: function (event, player) {
                        return event.name == 'damage' || event.player.countMark('_lz_zong_mark');
                    },
                    direct: true,
                    priority: 2023,
                    content: function () {
                        player.addMark('_lz_zong_mark', trigger.name == 'damage' ? trigger.num : trigger.player.countMark('_lz_zong_mark'));
                        if (trigger.name == 'die') trigger.player.unmarkSkill('_lz_zong_mark');
                    },
                },
                _lz_equip: {
                    charlotte: true,
                    trigger: { global: 'phaseBefore' },
                    filter: function (event, player) {
                        /*
                        var bool=false;
                        for(var i=1;i<=5;i++){
                        if(player.isEmpty(i)){
                        bool=true;
                        break;
                        }
                        }
                        */
                        return game.phaseNumber == 0 && player.identity == game.me.identity/*&&bool*/;
                    },
                    direct: true,
                    priority: 2023,
                    content: function () {
                        /*
                        var equips=[];
                        for(var i=1;i<=5;i++){
                        if(player.isEmpty(i)) equips.push('equip'+i);
                        }
                        */
                        var card = get.cardPile(function (card) {
                            return get.type(card) == 'equip'/*&&equips.includes(get.subtype(card))*/;
                        });
                        if (card) player.chooseUseTarget(card, 'nopopup', 'noanimate', true);
                    },
                },
                lz_dakuaiduoyi: {
                    charlotte: true,
                    trigger: { player: 'useCard' },
                    filter: function (event, player) {
                        return get.type2(event.card) == 'trick' && player.countMark('_lz_zong_mark') >= 2;
                    },
                    forced: true,
                    content: function () {
                        player.removeMark('_lz_zong_mark', 2);
                        player.draw();
                    },
                },
                lz_wuweijuquan: {
                    charlotte: true,
                    trigger: { source: 'damageBegin1' },
                    filter: function (event, player) {
                        return player.countMark('_lz_zong_mark') >= 4;
                    },
                    forced: true,
                    content: function () {
                        player.removeMark('_lz_zong_mark', 4);
                        trigger.num++;
                    },
                },
                lz_huiweuwuqiong: {
                    charlotte: true,
                    trigger: { source: 'damageSource' },
                    filter: function (event, player) {
                        return event.card && event.card.name == 'sha' && player.countMark('_lz_zong_mark') >= 2;
                    },
                    forced: true,
                    content: function () {
                        player.removeMark('_lz_zong_mark', 2);
                        player.draw();
                    },
                },
                lz_zhucuizhizhen: {
                    charlotte: true,
                    trigger: { player: 'useCard' },
                    filter: function (event, player) {
                        return get.type2(event.card) == 'equip' && player.countMark('_lz_zong_mark');
                    },
                    forced: true,
                    content: function () {
                        player.removeMark('_lz_zong_mark', 1);
                        player.draw();
                    },
                },
                lz_jinjinyouwei: {
                    charlotte: true,
                    trigger: { player: 'recoverEnd' },
                    filter: function (event, player) {
                        return event.card && event.card.name == 'tao' && player.countMark('_lz_zong_mark') >= 4;
                    },
                    forced: true,
                    content: function () {
                        player.removeMark('_lz_zong_mark', 4);
                        player.recover();
                    },
                },
                lz_zhenxiumeizhuan: {
                    charlotte: true,
                    trigger: { player: 'phaseDrawBegin' },
                    filter: function (event, player) {
                        return player.countMark('_lz_zong_mark');
                    },
                    forced: true,
                    content: function () {
                        var num = player.countMark('_lz_zong_mark');
                        player.removeMark('_lz_zong_mark', num);
                        player.draw(Math.floor(num / 2));
                    },
                },
                lz_chuixianyudi: {
                    charlotte: true,
                    trigger: { player: 'phaseJieshuBegin' },
                    filter: function (event, player) {
                        return player.countMark('_lz_zong_mark');
                    },
                    forced: true,
                    content: function () {
                        var num = player.countMark('_lz_zong_mark');
                        player.removeMark('_lz_zong_mark', num);
                        player.draw(Math.floor(num / 2));
                    },
                },
                lz_jiuzufanbao: {
                    mod: {
                        cardUsable: function (card, player, num) {
                            if (card.name == 'sha' && player.countMark('_lz_zong_mark') >= 6) return num + 1;
                        },
                        targetInRange: function (card, player) {
                            if (player.countMark('_lz_zong_mark') >= 4) return true;
                        },
                    },
                    charlotte: true,
                    trigger: { player: ['phaseDrawBegin2', 'phaseJieshuBegin'] },
                    filter: function (event, player) {
                        if (player.countMark('_lz_zong_mark') < 2) return false;
                        return event.name == 'phaseJieshu' || !event.numFixed;
                    },
                    forced: true,
                    content: function () {
                        if (trigger.name == 'phaseJieshu') {
                            var num = player.countMark('_lz_zong_mark');
                            player.removeMark('_lz_zong_mark', Math.floor(num / 2));
                        }
                        else trigger.num++;
                    },
                },
            },
            translate: {
                _LZ_jiazu_wei: '魏业',
                _LZ_jiazu_wei_info: '回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色选择一项：①弃置一张牌；②你摸一张牌。',
                _LZ_jiazu_shu: '蜀义',
                _LZ_jiazu_shu_info: '出牌阶段结束时，若你于此阶段使用【杀】的次数不少于2，摸一张牌。',
                _LZ_jiazu_wu: '吴耀',
                _LZ_jiazu_wu_info: '回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。',
                _LZ_jiazu_qun: '群心',
                _LZ_jiazu_qun_info: '锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1',
                _LZ_jiazu_jin: '晋势',
                _LZ_jiazu_jin_info: '回合开始时，你可以弃置一张牌，从牌堆中随机获得一张与此牌花色相同的牌。',
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
                xionghuangjiu: '雄黄酒',
                xionghuangjiu_info: '①出牌阶段对自己使用，本回合使用的下一张【杀】伤害+1；②当你处于濒死状态时，对自己使用，你回复1点体力。',
                tongzhougongji: '同舟共济',
                tongzhougongji_info: '出牌阶段，对自己和队友使用，目标角色各摸一张牌。',
                lizhengshangyou: '力争上游',
                lizhengshangyou_info: '出牌阶段，对所有角色使用，你和与你势力相同的角色各摸x张牌，其他角色摸一张牌（x为当前场上势力数）。',
                nishuixingzhou: '逆水行舟',
                nishuixingzhou_info: '出牌阶段，对一名与你势力不同的角色使用，对其和与其势力相同的角色各造成1点伤害。',
                LZ_chongsheng: '重生',
                LZ_chongsheng_info: '限定技，当你处于濒死状态时，你可以弃置判定区内的所有牌，然后复原你的武将牌，摸五张牌，将体力回复至体力上限（至多为5）。',
                _lz_zong_mark: '粽',
                lz_dakuaiduoyi: '大快朵颐',
                lz_wuweijuquan: '五味俱全',
                lz_huiweuwuqiong: '回味无穷',
                lz_zhucuizhizhen: '珠翠之珍',
                lz_jinjinyouwei: '津津有味',
                lz_zhenxiumeizhuan: '珍馐美馔',
                lz_chuixianyudi: '垂涎欲滴',
                lz_jiuzufanbao: '酒足饭饱',
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
                    case 'jiu': lib.card.list[i][2] = 'xionghuangjiu'; break;
                    case 'wuzhong': lib.card.list[i][2] = 'tongzhougongji'; break;
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
                    /*
                    if(source){
                    if(source.identity!=this.identity){
                    var fellow=game.findPlayer(function(current){
                    return current!=source&&current.identity==source.identity;
                    })
                    if(fellow) fellow.draw('nodelay');
                    source.draw();
                    }
                    else source.discard(source.getCards('he'));
                    }
                    */
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
            get.attitude = function (from, to) {
                var identity = game.me.identity;
                if (from.identity == to.identity) return 10;
                if (from != to && (from.identity == identity || to.identity == identity)) return -10;
                return -7.5;
            };
            get.rawAttitude = function (from, to) {
                var identity = game.me.identity;
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
                    var fellow = game.players.concat(game.dead).filter(function (current) {
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
                        if (game.RElongzhou) game.over(true);
                        else {
                            game.RElongzhou = true;
                            ui.arena.setNumber(8);
                            var groupList = ['wei', 'shu', 'wu', 'qun', 'jin'].remove(game.me.identity);
                            groupList = groupList.randomGets(3);
                            groupList.randomSort();
                            var tempNum = 3;
                            if (game.me.isIn()) game.me.directgain(get.cards(2));
                            if (fellow && fellow.isIn()) fellow.directgain(get.cards(2));
                            if (fellow && game.me.getSeatNum() > fellow.getSeatNum()) fellow.dataset.position = 7;
                            while (game.dead.filter(function (target) {
                                return target.identity != game.me.identity;
                            }).length) {
                                var target = game.dead.filter(function (target) {
                                    return target.identity != game.me.identity;
                                })[0];
                                if (target) {
                                    target.revive(null, false);
                                    target.uninit();
                                    target.identity = groupList[0];
                                    target.setIdentity();
                                    target.identityShown = true;
                                    var listxx = [];
                                    for (var name of _status.characterlist) {
                                        if (lib.character[name][1] == target.identity) listxx.push(name);
                                    }
                                    var character = listxx.randomGet();
                                    _status.characterlist.remove(character);
                                    target.init(character);
                                    if (target.countCards('hejsx')) {
                                        var hs = target.getCards('hejsx')
                                        for (var i = 0; i < hs.length; i++) {
                                            hs[i].discard(false);
                                        }
                                    }
                                    target.directgain(get.cards(5));
                                    for (var i in game.LZelement) target[i] = game.LZelement[i];
                                    target.dataset.position = tempNum - game.me.getSeatNum();
                                    tempNum++;
                                    target.removeMark('_lz_zong_mark', target.countMark('_lz_zong_mark'), false);
                                    target.addMark('_lz_zong_mark', 2);
                                    target.lz_levelNum = ['3', '4', '5'].randomGet();
                                    switch (target.lz_levelNum) {
                                        case '3':
                                            target.directgain(get.cards(1));
                                            target.maxHp = target.maxHp + 1;
                                            target.hp = target.hp + 1;
                                            target.update();
                                            break;
                                        case '4':
                                            target.directgain(get.cards(2));
                                            target.maxHp = target.maxHp + 1;
                                            target.hp = target.hp + 1;
                                            target.update();
                                            break;
                                        case '5':
                                            target.directgain(get.cards(2));
                                            target.maxHp = target.maxHp + 2;
                                            target.hp = target.hp + 2;
                                            target.update();
                                            break;
                                    }
                                }
                                else break;
                            }
                            for (var num = 1; num <= 4; num++) {
                                var listx = [], identityxx = groupList[num <= 2 ? 1 : 2];
                                for (var name of _status.characterlist) {
                                    if (lib.character[name][1] == identityxx) listx.push(name);
                                }
                                var character = listx.randomGet();
                                _status.characterlist.remove(character);
                                var target = game.addFellow(tempNum - game.me.getSeatNum(), character);
                                target.identity = identityxx;
                                target.setIdentity();
                                target.identityShown = true;
                                tempNum++;
                                target.directgain(get.cards(5));
                                for (var i in game.LZelement) target[i] = game.LZelement[i];
                                target.removeMark('_lz_zong_mark', target.countMark('_lz_zong_mark'), false);
                                target.addMark('_lz_zong_mark', 2);
                                target.lz_levelNum = ['3', '4', '5'].randomGet();
                                switch (target.lz_levelNum) {
                                    case '3':
                                        target.directgain(get.cards(1));
                                        target.maxHp = target.maxHp + 1;
                                        target.hp = target.hp + 1;
                                        target.update();
                                        break;
                                    case '4':
                                        target.directgain(get.cards(2));
                                        target.maxHp = target.maxHp + 1;
                                        target.hp = target.hp + 1;
                                        target.update();
                                        break;
                                    case '5':
                                        target.directgain(get.cards(2));
                                        target.maxHp = target.maxHp + 2;
                                        target.hp = target.hp + 2;
                                        target.update();
                                        break;
                                }
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
                    var evt = ['lz_dakuaiduoyi', 'lz_wuweijuquan', 'lz_huiweuwuqiong', 'lz_zhucuizhizhen', 'lz_jinjinyouwei', 'lz_zhenxiumeizhuan', 'lz_chuixianyudi', 'lz_jiuzufanbao'].randomGet();
                    game.addGlobalSkill(evt);
                    game.broadcastAll(function (evt) {
                        if (get.is.phoneLayout()) ui.guanduInfoxx = ui.create.div('.touchinfo.left', ui.window);
                        else ui.guanduInfoxx = ui.create.div(ui.gameinfo);
                        ui.guanduInfoxx.innerHTML = '本局事件：' + get.translation(evt);
                    }, evt);
                    var list = [
                        '使用锦囊牌时失去2个“棕”标记，摸一张牌。',
                        '造成伤害时失去4个“棕”标记，令此伤害+1。',
                        '使用【杀】造成伤害后失去2个“棕”标记，摸一张牌。',
                        '使用装备牌时失去1个“棕”标记，摸一张牌。',
                        '使用【桃】回复体力后失去4个“棕”标记，回复1点体力。',
                        '摸牌阶段开始时失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。',
                        '结束阶段失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。',
                        '①若你的“棕”标记数：不小于2，摸牌阶段多摸一张牌；不小于4，使用牌无距离限制；不小于6，使用【杀】的额定次数+1。②结束阶段，你失去X个“棕”标记（X为你的“棕”标记数，向下取整）',
                    ];
                    game.me.chooseControl('ok').set('prompt', '###本局特殊事件：' + get.translation(evt) + '###' + list[['lz_dakuaiduoyi', 'lz_wuweijuquan', 'lz_huiweuwuqiong', 'lz_zhucuizhizhen', 'lz_jinjinyouwei', 'lz_zhenxiumeizhuan', 'lz_chuixianyudi', 'lz_jiuzufanbao'].indexOf(evt)]);
                    'step 1'
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
                            i.addMark('_lz_zong_mark', 2);
                            i.lz_levelNum = ['3', '4'].randomGet();
                            switch (i.lz_levelNum) {
                                case '3':
                                    i.directgain(get.cards(1));
                                    i.maxHp = i.maxHp + 1;
                                    i.hp = i.hp + 1;
                                    i.update();
                                    break;
                                case '4':
                                    i.directgain(get.cards(2));
                                    i.maxHp = i.maxHp + 1;
                                    i.hp = i.hp + 1;
                                    i.update();
                                    break;
                            }
                        }
                    }
                    'step 2'
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
                    'step 3'
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
                    game.me.addMark('_lz_zong_mark', 2);
                    if (lib.config.extension_活动萌扩_JiaZhuAwaken) {
                        game.me._LZ_jiazuAwaken = true;
                        game.log(game.me, '已激活家族特殊技能');
                    }
                    game.me.lz_levelNum = lib.config.extension_活动萌扩_getLevel;
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
                            game.me.addSkill('LZ_chongsheng');
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
                        if (lib.config.extension_活动萌扩_JiaZhuAwaken) {
                            fellow._LZ_jiazuAwaken = true;
                            game.log(fellow, '已激活家族特殊技能');
                        }
                        fellow.addMark('_lz_zong_mark', 2);
                        fellow.lz_levelNum = lib.config.extension_活动萌扩_getLevel;
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
                                fellow.addSkill('LZ_chongsheng');
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
                    'step 4'
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
                                    else uiintro.add('（无）');
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