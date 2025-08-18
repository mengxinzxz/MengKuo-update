import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '文和乱武',
    mode: 'identity',
    intro: [
        '游戏人数：8人',
        '游戏目标：击杀所有其他玩家，最终存活的玩家为胜利者。',
        '击杀奖惩：击杀一名其他角色后，击杀者摸三张牌并增加1点体力上限。',
        '该模式有7条特殊规则，每轮开始时随机抽取并公布一条特殊规则作为本轮的特殊规则存在（第一轮默认为乱武规则）。',
        '牌堆情况：使用军争卡牌。其中【桃园结义】和【木牛流马】替换为【斗转星移】；黑色【无懈可击】替换为【偷梁换柱】；红色【无懈可击】替换为【李代桃僵】；【兵粮寸断】替换为【文和乱武】；移除所有【乐不思蜀】。',
        '禁将列表：' +
        '<ul><li>官方禁将：贾诩、周泰、蔡文姬、于吉、大乔、徐晃、灵雎、袁绍、曹丕、满宠，以及这些武将的所有同名异构武将（个人有删减）' +
        '</li><li>个人禁将：曹肇、卢弈、TW曹操、刘徽、OL董昭',
    ],
    init() {
        lib.configOL.number = 8;
        lib.config.mode_config.identity.auto_mark_identity = false;
        lib.config.mode_config.identity.double_character = false;
        var pack = {
            card: {
                whlw_lidaitaojiang: {
                    image: 'ext:活动萌扩/image/whlw_lidaitaojiang.png',
                    audio: true,
                    type: 'trick',
                    enable: true,
                    selectTarget: 1,
                    filterTarget(card, player, target) {
                        if (player == target) return false;
                        return target.countCards('h') + target.countCards('h') > 1;
                    },
                    content() {
                        var cards = player.getCards('h').concat(target.getCards('h'));
                        var list1 = [];
                        var list2 = [];
                        var list = [list1, list2];
                        for (var i = 0; i < cards.length; i++) {
                            list.randomGet().push(cards[i]);
                        }
                        if (list1.length) {
                            player.$draw(list1.length);
                            player.gain(list1);
                        }
                        if (list2.length) {
                            target.$draw(list2.length);
                            target.gain(list2);
                        }
                    },
                    ai: {
                        basic: {
                            order: 1,
                            useful: 1,
                            value: 5,
                        },
                        result: {
                            target(player, target) {
                                var ph = player.countCards('h') - 1;
                                var th = target.countCards('h');
                                return ph - th;
                            },
                        },
                    },
                    fullskin: true,
                },
                wenheluanwu_card: {
                    image: 'ext:活动萌扩/image/wenheluanwu_card.png',
                    audio: true,
                    type: 'trick',
                    enable: true,
                    selectTarget: -1,
                    toself: true,
                    filterTarget(card, player, target) {
                        return target == player;
                    },
                    modTarget: true,
                    content() {
                        'step 0'
                        event.current = player.next;
                        'step 1'
                        event.current.chooseToUse('乱武：使用一张杀或流失一点体力', { name: 'sha' }, function (card, player, target) {
                            if (player == target) return false;
                            if (!player.canUse('sha', target)) return false;
                            if (get.distance(player, target) <= 1) return true;
                            if (game.hasPlayer(function (current) {
                                return current != player && get.distance(player, current) < get.distance(player, target);
                            })) {
                                return false;
                            }
                            return true;
                        });
                        'step 2'
                        if (result.bool == false) event.current.loseHp();
                        if (player.classList.contains('dead') == false && event.current.next != player) {
                            event.current = event.current.next;
                            game.delay(0.5);
                            event.goto(1);
                        }
                    },
                    ai: {
                        basic: {
                            order: 1,
                            useful: 4.5,
                            value: 9.2,
                        },
                        result: {
                            player(player) {
                                var num = 0;
                                var players = game.filterPlayer();
                                for (var i = 0; i < players.length; i++) {
                                    var att = get.attitude(player, players[i]);
                                    if (att > 0) att = 1;
                                    if (att < 0) att = -1;
                                    if (players[i] != player && players[i].hp <= 3) {
                                        if (players[i].countCards('h') == 0) num += att / players[i].hp;
                                        else if (players[i].countCards('h') == 1) num += att / 2 / players[i].hp;
                                        else if (players[i].countCards('h') == 2) num += att / 4 / players[i].hp;
                                    }
                                    if (players[i].hp == 1) num += att * 1.5;
                                }
                                if (player.hp == 1) {
                                    return -num;
                                }
                                if (player.hp == 2) {
                                    return -game.players.length / 4 - num;
                                }
                                return -game.players.length / 3 - num;
                            },
                        },
                    },
                    fullskin: true,
                },
                whlw_toulianghuanzhu: {
                    image: 'ext:活动萌扩/image/whlw_toulianghuanzhu.png',
                    audio: true,
                    type: 'trick',
                    enable: true,
                    selectTarget: -1,
                    toself: true,
                    filterTarget(card, player, target) {
                        return target == player;
                    },
                    modTarget: true,
                    content() {
                        var equiplist = [];
                        for (var i = 0; i < game.players.length; i++) {
                            equiplist = equiplist.concat(game.players[i].getCards('e'));
                        }
                        game.delay();
                        for (var i = 0; i < equiplist.length; i++) {
                            game.players.randomGet().equip(equiplist[i]);
                        }
                    },
                    ai: {
                        basic: {
                            order: 7.2,
                            useful: 4.5,
                            value: 5,
                        },
                        result: {
                            target(player, target) {
                                var num = game.countPlayer(function (current) {
                                    return current.countCards('e');
                                });
                                return num * 2 / game.players.length - player.countCards('e');
                            },
                        },
                    },
                    fullskin: true,
                },
                douzhuanxingyi: {
                    image: 'ext:活动萌扩/image/douzhuanxingyi.png',
                    audio: true,
                    type: 'trick',
                    enable: true,
                    selectTarget: 1,
                    filterTarget(card, player, target) {
                        return player != target;
                    },
                    content() {
                        'step 0'
                        event.num = player.hp + target.hp - 2;
                        event.num1 = 1;
                        event.num2 = 1;
                        'step 1'
                        var add = [1, 2].randomGet();
                        if (event.num > 0) {
                            if (player.maxHp > event.num1 && target.maxHp > event.num2) {
                                if (add != 1) event.num1++;
                                else event.num2++;
                                event.num--;
                            }
                            else if (player.maxHp == event.num1) {
                                event.num2 = event.num2 + event.num;
                                event.num = 0;
                            }
                            else if (target.maxHp == event.num2) {
                                event.num1 = event.num1 + event.num;
                                event.num = 0;
                            }
                        }
                        'step 2'
                        if (event.num > 0) event.goto(1);
                        else {
                            var num;
                            if (player.hp > event.num1) {
                                num = player.hp - event.num1;
                                player.loseHp(num);
                                target.recover(num);
                            }
                            else if (player.hp < event.num1) {
                                num = event.num1 - player.hp;
                                player.recover(num);
                                target.loseHp(num);
                            }
                        }
                    },
                    ai: {
                        basic: {
                            order: 1,
                            useful: 1,
                            value: 5,
                        },
                        result: {
                            target(player, target) {
                                var ph = player.hp;
                                var pm = player.maxHp;
                                var th = target.hp;
                                var tm = target.maxHp;
                                if (ph == pm && th == tm) return 0;
                                if (th == tm) return ph - pm;
                                if (ph == pm) return tm - th;
                                if (ph == 1) return ph - th;
                                if (th == 1) return ph - th;
                                return ph - th;
                            },
                        },
                    },
                    fullskin: true,
                },
            },
            skill: {
                //全局规则机制
                _wenheluanwu_skill: {
                    charlotte: true,
                    ruleSkill: true,
                    isAct(player) {
                        for (var i = player.actionHistory.length - 1; i >= 0; i--) {
                            var history = player.actionHistory[i].useSkill;
                            if (history.some(evt => evt.skill == '_wenheluanwu_skill')) return true;
                            if (player.actionHistory[i].isRound) break;
                        }
                        return false;
                    },
                    trigger: { global: ['roundStart', 'roundEnd'] },
                    filter(event, player, name) {
                        if (name === 'roundEnd') return _status.luanwu_result == 'luanwu6';
                        return !game.hasPlayer2(current => lib.skill._wenheluanwu_skill.isAct(current));
                    },
                    forced: true,
                    firstDo: true,
                    forceDie: true,
                    forceOut: true,
                    priority: Infinity,
                    async content(event, trigger, player) {
                        if (event.triggername === 'roundEnd') {
                            var num = game.roundNumber;
                            var targets = game.filterPlayer(current => current.isMinHandcard());
                            targets.forEach(target => target.loseHp(num));
                        }
                        else {
                            delete _status.luanwu_result;
                            let result;
                            if (game.roundNumber == 1) result = 'luanwu1';
                            else result = ['luanwu1', 'luanwu2', 'luanwu3', 'luanwu4', 'luanwu5', 'luanwu6', 'luanwu7'].randomGet();
                            _status.luanwu_result = result;
                            if (!lib.card[result]) {
                                lib.card[result] = {
                                    type: 'luanwu',
                                    fullimage: true,
                                };
                                lib.card[result].image = 'ext:活动萌扩/image/' + result + '.jpg'
                            }
                            var content = ['本轮事件', [[result], 'vcard']];
                            await game.me.chooseControl('ok').set('dialog', content);
                            game.broadcastAll(result => {
                                if (lib.config.background_speak) game.playAudio('..', 'extension', '活动萌扩/audio', result);
                            }, result);
                            //乱武
                            if (result == 'luanwu1') {
                                var next = game.createEvent('whlw');
                                next.player = player;
                                next.forceDie = true;
                                next.forceOut = true;
                                next.setContent(lib.skill._wenheluanwu_skill.luanwu);
                                await next;
                            }
                        }
                    },
                    luanwu() {
                        'step 0'
                        var target = game.filterPlayer().randomGet();
                        if (!target) return;
                        event.current = target;
                        event.currented = [];
                        "step 1"
                        event.currented.push(event.current);
                        event.current.animate('target');
                        event.current.chooseToUse('乱武：使用一张杀或失去1点体力', function (card) {
                            if (get.name(card) != 'sha') return false;
                            return lib.filter.cardEnabled.apply(this, arguments)
                        }, function (card, player, target) {
                            if (player == target) return false;
                            var dist = get.distance(player, target);
                            if (dist > 1) {
                                if (game.hasPlayer(function (current) {
                                    return current != player && get.distance(player, current) < dist;
                                })) {
                                    return false;
                                }
                            }
                            return lib.filter.filterTarget.apply(this, arguments);
                        }).set('ai2', function () {
                            return get.effect_use.apply(this, arguments) + 0.01;
                        }).set('addCount', false);
                        "step 2"
                        if (result.bool == false) event.current.loseHp();
                        event.current = event.current.next;
                        if (!event.currented.includes(event.current)) {
                            game.delay(0.5);
                            event.goto(1);
                        }
                    },
                },
                _whlw_effect: {
                    //规则丶濒死不能救助其他参赛者
                    mod: {
                        cardSavable(card, player, target) {
                            if (target != player) return false;
                        },
                        //宴安鸠毒
                        cardname(card, player, name) {
                            if (!_status.luanwu_result || _status.luanwu_result != 'luanwu7') return;
                            if (card.name == 'tao') return 'du';
                        },
                        aiValue(player, card, num) {
                            if (!_status.luanwu_result || _status.luanwu_result != 'luanwu7') return;
                            if (get.name(card) == 'du' && card.name != 'du') return get.value({ name: card.name });
                        },
                    },
                    //横扫千军
                    //破釜沉舟
                    //横刀跃马
                    trigger: {
                        source: 'damageBegin1',
                        player: ['phaseBegin', 'phaseEnd'],
                    },
                    filter(event, player, name) {
                        if (!_status.luanwu_result) return false;
                        switch (name) {
                            case 'damageBegin1': return _status.luanwu_result == 'luanwu5'; break;
                            case 'phaseBegin': return _status.luanwu_result == 'luanwu3'; break;
                            case 'phaseEnd': return _status.luanwu_result == 'luanwu4'; break;
                        }
                    },
                    forced: true,
                    popup: false,
                    firstDo: true,
                    content() {
                        if (trigger.name == 'damage') trigger.num++;
                        if (event.triggername == 'phaseBegin') {
                            player.loseHp();
                            player.draw(3);
                        }
                        if (event.triggername == 'phaseEnd') {
                            var targets = game.filterPlayer(target => {
                                return !game.hasPlayer(current => current.countCards('e') < target.countCards('e'));
                            }), list = [];
                            targets.forEach(target => {
                                target.loseHp();
                                var card = get.cardPile2(card => get.type(card) == 'equip' && !list.includes(card));
                                if (card) {
                                    list.push(card);
                                    target.$gain2(card, false);
                                    game.delayx();
                                    target.equip(card);
                                }
                            });
                        }
                    },
                    /*
                    //状态越好嘲讽越高
                    ai:{
                    threaten:function(player,target){
                    return Math.max(0,target.hp)+target.countCards('he');
                    },
                    },
                    */
                },
            },
            translate: {
                luanwu1: '乱武',
                luanwu1_info: '从一名随机角色开始结算乱武。',
                luanwu2: '重赏',
                luanwu2_info: '本轮所有角色击杀角色的奖励翻倍。',
                luanwu3: '破釜沉舟',
                luanwu3_info: '每个回合开始时，当前回合角色失去1点体力并摸三张牌。',
                luanwu4: '横刀跃马',
                luanwu4_info: '每个回合结束时，所有装备最少的角色失去1点体力并随机在装备区内置入一件装备。',
                luanwu5: '横扫千军',
                luanwu5_info: '本轮所有角色造成的伤害+1。',
                luanwu6: '饿莩载道',
                luanwu6_info: '本轮结束时，所有手牌最少的角色失去当前轮数-1的体力值。',
                luanwu7: '宴安鸠毒',
                luanwu7_info: '本轮中，所有的【桃】均视为【毒】。',
                whlw_lidaitaojiang: '李代桃僵',
                whlw_lidaitaojiang_info: '出牌阶段，对一名其他角色使用。随机分配你们的手牌。',
                wenheluanwu_card: '文和乱武',
                wenheluanwu_card_info: '出牌阶段，对你自己使用。视为你发动了一次【乱武】。',
                whlw_toulianghuanzhu: '偷梁换柱',
                whlw_toulianghuanzhu_info: '出牌阶段，对你自己使用。随机分配场上所有的装备牌。',
                douzhuanxingyi: '斗转星移',
                douzhuanxingyi_info: '出牌阶段，对一名其他角色使用。随机分配你与其的体力。（至少为1，至多不能超出上限）',
            },
        };
        game.bolLoadPack(pack);
    },
    content: {
        submode: 'normal',
        cardPile() {
            for (var i = 0; i < lib.card.list.length; i++) {
                switch (lib.card.list[i][2]) {
                    case 'wuxie': lib.card.list[i][2] = (['heart', 'diamond'].includes(lib.card.list[i][0]) ? 'whlw_lidaitaojiang' : 'whlw_toulianghuanzhu'); break;
                    case 'taoyuan': case 'muniu': lib.card.list[i][2] = 'douzhuanxingyi'; break;
                    case 'bingliang': lib.card.list[i][2] = 'wenheluanwu_card'; break;
                    case 'lebu': lib.card.list.splice(i--, 1); break;
                }
            }
            return lib.card.list;
        },
        chooseCharacterBefore() {
            var element = {
                getFriends(func) {
                    return func === true ? [this] : [];
                },
                isFriendOf(player) {
                    return this.getFriends(true).includes(player);
                },
                getEnemies(func) {
                    var player = this;
                    return game.filterPlayer(current => current != player);
                },
                isEnemyOf(player) {
                    return this.getEnemies(true).includes(player);
                },
                logAi() { },
                dieAfter(source) {
                    this.$dieAfter();
                    game.checkResult();
                    if (source) {
                        var num = 1;
                        //重赏
                        if (_status.luanwu_result && _status.luanwu_result == 'luanwu2') num = 2;
                        source.draw(3 * num);
                        source.gainMaxHp(num);
                    }
                },
                $dieAfter() {
                    if (_status.video) return;
                    var str = get.cnNumber(game.players.length + 1, true);
                    var node = ui.create.div('.damage.dieidentity', '第' + str, this);
                    ui.refresh(node);
                    node.style.opacity = 1;
                    this.node.dieidentity = node;
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
            };
            for (var i in element) lib.element[i] = element[i];
            lib.translate.whlw_identity = ' ';
            lib.translate.whlw_identity2 = '参赛者';
            var target = game.players.randomGet();
            game.players.sortBySeat(target);
            var targets = game.players.sortBySeat(target);
            targets.forEach(current => {
                var num = targets.indexOf(current) + 1;
                if (num == 1) game.zhu = current;
                current.setSeatNum(num);
                current.setNickname(get.cnNumber(num, true) + '号位');
                for (var i in element) current[i] = element[i];
                current.identity = 'whlw_identity';
                current.setIdentity();
                current.identityShown = true;
                current.node.identity.firstChild.innerHTML = ' ';
                current.update();
            });
            get.rawAttitude = function (from, to) {
                return from == to ? 10 : -10;
            };
            game.showIdentity(true);
            game.checkResult = function () {
                switch (game.players.length) {
                    case 1: game.over(game.me.isIn()); break;
                    case 2: {
                        if (game.me.isIn()) {
                            ui.create.system('投降', function () {
                                game.log(game.me, '投降');
                                game.over(false);
                            }, true);
                        }
                        break;
                    }
                    default: return; break;
                }
            };
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    'step 0'
                    if (!_status.characterlist) lib.skill.pingjian.initList();
                    _status.characterlist = _status.characterlist.filter(name => {
                        var translate = lib.translate[name];
                        var list = '贾诩、周泰、蔡文姬、于吉、大乔、徐晃、灵雎、袁绍、曹丕、满宠'.split('、');//官方禁将表
                        var list2 = '曹肇、卢弈、TW曹操、刘徽、OL董昭'.split('、');//个人禁将表
                        if (!translate || translate == '') return false;
                        if (list.some(trans => translate.indexOf(trans) != -1)) return false;
                        if (list2.some(trans => translate == trans)) return false;
                        return true;
                    });
                    ui.arena.classList.add('choose-character');
                    'step 1'
                    var list = _status.characterlist.randomGets(5);
                    var dialog = ui.create.dialog('请选择您的武将', 'hidden');
                    dialog.add([list, 'character']);
                    game.me.chooseButton(dialog, true).set('onfree', true);
                    'step 2'
                    if (result.bool) {
                        game.me.init(result.links[0]);
                        _status.characterlist.remove(result.links[0]);
                        game.players.forEach(target => {
                            if (target != game.me) target.init(_status.characterlist.randomRemove(1)[0]);
                        });
                    }
                    else event.goto(1);
                    'step 3'
                    setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                });
            };
        },
    },
};

export default brawl;